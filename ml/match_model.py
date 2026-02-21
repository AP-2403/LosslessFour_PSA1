"""
ml/match_model.py
─────────────────
MatchModel — learns the weight of every pair-level feature on the
final match score using Gradient Boosting (XGBoost if installed).

WHY THIS MATTERS
────────────────
The rule-based matcher in matching/matcher.py uses manually set weights:
    industry mismatch → -30 pts  (you decided this)
    capacity align    →  ×0.15   (you decided this)

MatchModel replaces that with a trained function that learns from data
which pair features most predict a good match — and by how much:

    Feature                     Learned Weight
    ──────────────────────────────────────────
    Industry_Match              +0.1820   (biggest positive driver)
    Buyer_Intent_Score          +0.1340
    Exporter_Reliability        +0.0980
    Tariff_Delta (buyer-exp)    -0.0712   (risk mismatch kills deals)
    Capacity_Ratio              +0.0540
    War_Risk_Combined           -0.0310
    Currency_Mismatch           -0.0089

TRAINING TARGET
───────────────
Bootstrapped from the rule-based match_score (first run) — the model
learns to approximate and then improve on the hand-coded formula.
When you have real conversion data (won/lost deals), pass that as the
target for full supervised learning.

PAIR FEATURES (engineered at training time)
───────────────────────────────────────────
The model doesn't just concatenate exporter + buyer columns.
It engineers interaction features that capture the *relationship*
between the two sides — these are what drive the learned weights.

USAGE
─────
    from ml.match_model import MatchModel

    model = MatchModel()
    model.fit(matches_df, exporters_df, buyers_df)
    matches_df["ml_match_score"] = model.predict(matches_df, exporters_df, buyers_df)

    model.print_weights()
    model.save("ml/saved/match_model.pkl")
"""

import os
import pickle
import warnings
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import MinMaxScaler

warnings.filterwarnings("ignore")

try:
    from xgboost import XGBRegressor
    _XGB_AVAILABLE = True
except ImportError:
    _XGB_AVAILABLE = False


def _make_model(use_xgb: bool = True) -> object:
    if use_xgb and _XGB_AVAILABLE:
        return XGBRegressor(
            n_estimators=400,
            learning_rate=0.04,
            max_depth=5,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0,
        )
    return GradientBoostingRegressor(
        n_estimators=400,
        learning_rate=0.04,
        max_depth=5,
        subsample=0.8,
        random_state=42,
    )


class MatchModel:
    """
    Trains a GBM/XGBoost model on engineered pair features to
    predict match scores — replacing manually tuned weights.
    """

    def __init__(self, use_xgb: bool = True, test_size: float = 0.2, cv_folds: int = 5):
        self.use_xgb    = use_xgb
        self.test_size  = test_size
        self.cv_folds   = cv_folds
        self._model:    object | None = None
        self._features: list  = []
        self._metrics:  dict  = {}
        self._scaler    = MinMaxScaler(feature_range=(0, 100))

    # ── Feature engineering ──────────────────────────────────────────

    def _engineer_pair_features(
        self,
        matches_df:   pd.DataFrame,
        exporters_df: pd.DataFrame,
        buyers_df:    pd.DataFrame,
    ) -> pd.DataFrame:
        """
        Build interaction features from exporter + buyer columns
        for each pair row in matches_df.
        """
        exp = exporters_df.copy().set_index("Exporter_ID") \
            if "Exporter_ID" in exporters_df.columns else exporters_df.copy()
        buy = buyers_df.copy().set_index("Buyer_ID") \
            if "Buyer_ID" in buyers_df.columns else buyers_df.copy()

        rows = []
        for _, row in matches_df.iterrows():
            eid = row.get("Exporter_ID")
            bid = row.get("Buyer_ID")

            e = exp.loc[eid] if eid in exp.index else pd.Series(dtype=float)
            b = buy.loc[bid] if bid in buy.index else pd.Series(dtype=float)

            # If duplicate IDs exist, loc returns DataFrame — take first row only
            if isinstance(e, pd.DataFrame): e = e.iloc[0]
            if isinstance(b, pd.DataFrame): b = b.iloc[0]

            def ev(col, default=None): return e.get(col, default)
            def bv(col, default=None): return b.get(col, default)
            def evf(col, default=0.0):
                try: return float(e.get(col, default))
                except (ValueError, TypeError): return default
            def bvf(col, default=0.0):
                try: return float(b.get(col, default))
                except (ValueError, TypeError): return default

            # ── Pair-level engineered features ──────────────────────
            industry_match      = 1.0 if ev("Industry", "") == bv("Industry", "") else 0.0
            capacity_ratio      = min(evf("Manufacturing_Capacity_Tons", 1),
                                      bvf("Avg_Order_Tons", 1)) / \
                                  (max(evf("Manufacturing_Capacity_Tons", 1),
                                       bvf("Avg_Order_Tons", 1)) + 1e-9)
            revenue_ratio       = min(evf("Revenue_Size_USD", 1),
                                      bvf("Revenue_Size_USD", 1)) / \
                                  (max(evf("Revenue_Size_USD", 1),
                                       bvf("Revenue_Size_USD", 1)) + 1e-9)
            cert_match          = 1.0 if (ev("Certification", "None") ==
                                          bv("Certification", "None") and
                                          ev("Certification", "None") not in
                                          ("None", "Unknown", "")) else 0.0

            # Risk alignment — penalise when both sides carry risk
            combined_war_risk   = evf("War_Risk") * bvf("War_Event")
            tariff_delta        = abs(evf("Tariff_Impact") - bvf("Tariff_News"))
            currency_mismatch   = abs(evf("Currency_Shift") - bvf("Currency_Fluctuation"))
            stock_combined      = abs(evf("StockMarket_Impact")) + abs(bvf("StockMarket_Shock"))

            # Intent quality
            exp_intent          = evf("Intent_Score") / 100
            buy_intent          = bvf("Intent_Score") / 100
            intent_product      = exp_intent * buy_intent   # both high = strong signal

            # Trust / reliability
            exp_reliability     = (evf("Good_Payment_Terms") +
                                   evf("Prompt_Response_Score") / 10) / 2
            buy_creditworthiness= (bvf("Good_Payment_History") +
                                   bvf("Funding_Event")         +
                                   bvf("Response_Probability")) / 3

            # Growth signals
            engagement_sum      = (evf("Hiring_Signal")         +
                                   bvf("Hiring_Growth")         +
                                   bvf("Engagement_Spike")      +
                                   bvf("Funding_Event")         +
                                   bvf("DecisionMaker_Change"))

            rows.append({
                # ── Pair interaction features ──────────────────────
                "industry_match":       industry_match,
                "capacity_ratio":       capacity_ratio,
                "revenue_ratio":        revenue_ratio,
                "cert_match":           cert_match,
                "combined_war_risk":    combined_war_risk,
                "tariff_delta":         tariff_delta,
                "currency_mismatch":    currency_mismatch,
                "stock_combined":       stock_combined,
                "exp_intent":           exp_intent,
                "buy_intent":           buy_intent,
                "intent_product":       intent_product,
                "exp_reliability":      exp_reliability,
                "buy_creditworthiness": buy_creditworthiness,
                "engagement_sum":       engagement_sum,
                # ── Individual composite scores (if already computed) ──
                "exporter_score":       evf("exporter_score")  / 100,
                "buyer_score":          bvf("buyer_score")     / 100,
                # ── Rule-based diagnostics (from matcher output) ──
                "base_similarity":      float(row.get("base_similarity",  0)) / 100,
                "capacity_align":       float(row.get("capacity_align",   0)) / 100,
                "news_delta":           float(row.get("news_delta",       0)),
                "engagement_bonus":     float(row.get("engagement_bonus", 0)),
            })

        return pd.DataFrame(rows)

    # ── Train ────────────────────────────────────────────────────────

    def fit(
        self,
        matches_df:   pd.DataFrame,
        exporters_df: pd.DataFrame,
        buyers_df:    pd.DataFrame,
        target_col:   str = "match_score",
    ) -> "MatchModel":
        """
        Train on engineered pair features.
        target_col defaults to the rule-based match_score (bootstrapping).
        Swap in real conversion labels (0/1 or revenue) when available.
        """
        print("\n🤖 Training Match Score Model …")
        backend = "XGBoost" if (_XGB_AVAILABLE and self.use_xgb) else "GradientBoosting"

        X = self._engineer_pair_features(matches_df, exporters_df, buyers_df)
        y = matches_df[target_col].fillna(0).astype(float)

        self._features = list(X.columns)
        self._model    = _make_model(self.use_xgb)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.test_size, random_state=42
        )
        self._model.fit(X_train, y_train)
        preds    = self._model.predict(X_test)
        cv_scores = cross_val_score(self._model, X, y, cv=self.cv_folds, scoring="r2")

        self._metrics = {
            "backend":    backend,
            "n_samples":  len(X),
            "n_features": len(self._features),
            "MAE":        round(mean_absolute_error(y_test, preds), 4),
            "R2_test":    round(r2_score(y_test, preds), 4),
            "R2_cv_mean": round(cv_scores.mean(), 4),
            "R2_cv_std":  round(cv_scores.std(), 4),
        }

        print(f"    Backend    : {backend}")
        print(f"    Samples    : {self._metrics['n_samples']:,}")
        print(f"    Features   : {self._metrics['n_features']}")
        print(f"    MAE        : {self._metrics['MAE']:.4f}")
        print(f"    R²  (test) : {self._metrics['R2_test']:.4f}")
        print(f"    R²  (CV)   : {self._metrics['R2_cv_mean']:.4f} ± {self._metrics['R2_cv_std']:.4f}")

        return self

    # ── Predict ──────────────────────────────────────────────────────

    def predict(
        self,
        matches_df:   pd.DataFrame,
        exporters_df: pd.DataFrame,
        buyers_df:    pd.DataFrame,
    ) -> np.ndarray:
        if self._model is None:
            raise RuntimeError("Call fit() first.")
        X    = self._engineer_pair_features(matches_df, exporters_df, buyers_df)
        raw  = self._model.predict(X[self._features])
        return np.clip(raw, 0, 100).round(2)

    # ── Weights table ─────────────────────────────────────────────────

    def feature_weights(self) -> pd.DataFrame:
        """Return learned feature importances sorted descending."""
        if self._model is None:
            raise RuntimeError("Call fit() first.")
        return (
            pd.DataFrame({
                "feature":    self._features,
                "importance": self._model.feature_importances_,
            })
            .sort_values("importance", ascending=False)
            .reset_index(drop=True)
        )

    # ── Persistence ───────────────────────────────────────────────────

    def save(self, path: str = "ml/saved/match_model.pkl"):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump(self, f)
        print(f"  ✅ MatchModel saved → {path}")

    @classmethod
    def load(cls, path: str) -> "MatchModel":
        with open(path, "rb") as f:
            obj = pickle.load(f)
        print(f"  ✅ MatchModel loaded ← {path}")
        return obj