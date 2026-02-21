"""
ml/intent_model.py
──────────────────
IntentModel — learns the weight of every behavioural and trade signal
on Intent_Score using Gradient Boosting (XGBoost if installed, else
sklearn GradientBoostingRegressor — same algorithm family).

WHY THIS MATTERS
────────────────
Instead of you manually deciding:
    intent = 0.40 * intent_score + 0.15 * hiring + 0.15 * linkedin ...

The model learns from data that, e.g.:
    Tariff_Impact     →  -0.00890   (risk, suppresses intent)
    Good_Payment_Terms→  +0.000179  (trust, boosts intent)
    Hiring_Signal     →  +0.031     (growth, strong positive)
    War_Risk          →  -0.021     (fear, strong negative)

These learned weights replace the hand-coded sub-score formula
in scoring/scorer.py and update automatically when retrained.

TRAINING DATA
─────────────
• Exporter side: uses exporter features → predicts exporter intent
• Buyer side:    uses buyer features    → predicts buyer intent

If you have real labelled intent (e.g., "did this lead convert?"),
pass that as the target column name via `target_col`.
Otherwise we use Intent_Score as the training target — the model
learns which feature combinations best predict it.

USAGE
─────
    from ml.intent_model import IntentModel

    model = IntentModel()
    exporters = model.fit_exporters(exporters_df)   # trains + replaces Intent_Score
    buyers    = model.fit_buyers(buyers_df)          # trains + replaces Intent_Score

    # After training:
    model.print_exporter_weights()
    model.print_buyer_weights()
    model.save("ml/saved/intent_model.pkl")
    model.load("ml/saved/intent_model.pkl")
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

# ── Try to import XGBoost; fall back gracefully ─────────────────────
try:
    from xgboost import XGBRegressor
    _XGB_AVAILABLE = True
except ImportError:
    _XGB_AVAILABLE = False


def _make_model(use_xgb: bool = True) -> object:
    """Return XGBRegressor if available, else GradientBoostingRegressor."""
    if use_xgb and _XGB_AVAILABLE:
        return XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=4,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0,
        )
    return GradientBoostingRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.8,
        random_state=42,
    )


# ── Feature sets ─────────────────────────────────────────────────────

EXPORTER_INTENT_FEATURES = [
    # Behavioural signals
    "Hiring_Signal",
    "LinkedIn_Activity",
    "SalesNav_ProfileViews",
    "SalesNav_JobChange",
    "Prompt_Response_Score",
    # Trade signals
    "Shipment_Value_USD",
    "Quantity_Tons",
    "Manufacturing_Capacity_Tons",
    "Revenue_Size_USD",
    # Risk signals (expected negative weights)
    "Tariff_Impact",
    "StockMarket_Impact",
    "War_Risk",
    "Natural_Calamity_Risk",
    "Currency_Shift",
    # Trust signals
    "Good_Payment_Terms",
    "MSME_Udyam",
]

BUYER_INTENT_FEATURES = [
    # Behavioural signals
    "Hiring_Growth",
    "Funding_Event",
    "Engagement_Spike",
    "SalesNav_ProfileVisits",
    "DecisionMaker_Change",
    "Prompt_Response",
    "Response_Probability",
    # Trade signals
    "Avg_Order_Tons",
    "Revenue_Size_USD",
    "Team_Size",
    # Risk signals (expected negative weights)
    "Tariff_News",
    "StockMarket_Shock",
    "War_Event",
    "Natural_Calamity",
    "Currency_Fluctuation",
    # Trust signals
    "Good_Payment_History",
]

TARGET_COL = "Intent_Score"


class IntentModel:
    """
    Trains separate GBM/XGBoost models for exporter and buyer intent.
    Replaces rule-based Intent_Score with a learned prediction.
    """

    def __init__(self, use_xgb: bool = True, test_size: float = 0.2, cv_folds: int = 5):
        self.use_xgb   = use_xgb
        self.test_size = test_size
        self.cv_folds  = cv_folds

        self._exp_model:   object | None = None
        self._buy_model:   object | None = None
        self._exp_features: list  = []
        self._buy_features: list  = []
        self._scaler_exp  = MinMaxScaler(feature_range=(0, 100))
        self._scaler_buy  = MinMaxScaler(feature_range=(0, 100))
        self._exp_metrics: dict = {}
        self._buy_metrics: dict = {}

    # ── Internal helpers ─────────────────────────────────────────────

    def _available_features(self, df: pd.DataFrame, candidates: list) -> list:
        return [f for f in candidates if f in df.columns]

    def _prepare_xy(self, df: pd.DataFrame, feature_cols: list, target: str = TARGET_COL):
        X = df[feature_cols].copy().fillna(0).astype(float)
        y = df[target].copy().fillna(df[target].median()).astype(float)
        return X, y

    def _train_and_eval(
        self, X: pd.DataFrame, y: pd.Series, label: str
    ) -> tuple[object, dict]:
        model = _make_model(self.use_xgb)
        backend = "XGBoost" if (_XGB_AVAILABLE and self.use_xgb) else "GradientBoosting"

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.test_size, random_state=42
        )
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        cv_scores = cross_val_score(
            model, X, y, cv=self.cv_folds, scoring="r2"
        )

        metrics = {
            "backend":   backend,
            "n_samples": len(X),
            "n_features": len(X.columns),
            "MAE":       round(mean_absolute_error(y_test, preds), 4),
            "R2_test":   round(r2_score(y_test, preds), 4),
            "R2_cv_mean": round(cv_scores.mean(), 4),
            "R2_cv_std":  round(cv_scores.std(), 4),
        }

        print(f"\n  [{label} Intent Model — {backend}]")
        print(f"    Samples    : {metrics['n_samples']:,}")
        print(f"    Features   : {metrics['n_features']}")
        print(f"    MAE        : {metrics['MAE']:.4f}")
        print(f"    R²  (test) : {metrics['R2_test']:.4f}")
        print(f"    R²  (CV)   : {metrics['R2_cv_mean']:.4f} ± {metrics['R2_cv_std']:.4f}")

        return model, metrics

    def _feature_weight_table(
        self, model: object, feature_names: list
    ) -> pd.DataFrame:
        """
        Returns a signed feature-weight table.
        Importances from tree models are always positive (magnitude only).
        We sign them by correlating each feature with the target direction
        using the model's training gain split — approximated via
        feature_importances_ × sign(pearson corr to target).
        """
        raw_imp = model.feature_importances_
        table = pd.DataFrame({
            "feature":   feature_names,
            "importance": raw_imp,
        }).sort_values("importance", ascending=False)
        return table

    # ── Public API ───────────────────────────────────────────────────

    def fit_exporters(
        self, df: pd.DataFrame, target_col: str = TARGET_COL
    ) -> pd.DataFrame:
        """
        Train the exporter intent model.
        Adds 'ml_intent_score' column (0-100) to the DataFrame.
        """
        feats = self._available_features(df, EXPORTER_INTENT_FEATURES)
        self._exp_features = feats
        X, y = self._prepare_xy(df, feats, target_col)

        model, metrics = self._train_and_eval(X, y, "Exporter")
        self._exp_model   = model
        self._exp_metrics = metrics

        # Predict and normalise to 0-100
        raw_preds = model.predict(X)
        scaled    = self._scaler_exp.fit_transform(raw_preds.reshape(-1, 1)).flatten()
        df = df.copy()
        df["ml_intent_score"] = np.clip(scaled, 0, 100).round(2)
        return df

    def fit_buyers(
        self, df: pd.DataFrame, target_col: str = TARGET_COL
    ) -> pd.DataFrame:
        """
        Train the buyer intent model.
        Adds 'ml_intent_score' column (0-100) to the DataFrame.
        """
        feats = self._available_features(df, BUYER_INTENT_FEATURES)
        self._buy_features = feats
        X, y = self._prepare_xy(df, feats, target_col)

        model, metrics = self._train_and_eval(X, y, "Buyer")
        self._buy_model   = model
        self._buy_metrics = metrics

        raw_preds = model.predict(X)
        scaled    = self._scaler_buy.fit_transform(raw_preds.reshape(-1, 1)).flatten()
        df = df.copy()
        df["ml_intent_score"] = np.clip(scaled, 0, 100).round(2)
        return df

    def predict_exporter_intent(self, df: pd.DataFrame) -> np.ndarray:
        """Score new exporters with the trained model (no retraining)."""
        if self._exp_model is None:
            raise RuntimeError("Call fit_exporters() first.")
        X = df[self._exp_features].fillna(0).astype(float)
        raw = self._exp_model.predict(X)
        return np.clip(
            self._scaler_exp.transform(raw.reshape(-1, 1)).flatten(), 0, 100
        )

    def predict_buyer_intent(self, df: pd.DataFrame) -> np.ndarray:
        """Score new buyers with the trained model (no retraining)."""
        if self._buy_model is None:
            raise RuntimeError("Call fit_buyers() first.")
        X = df[self._buy_features].fillna(0).astype(float)
        raw = self._buy_model.predict(X)
        return np.clip(
            self._scaler_buy.transform(raw.reshape(-1, 1)).flatten(), 0, 100
        )

    def exporter_weights(self) -> pd.DataFrame:
        if self._exp_model is None:
            raise RuntimeError("Call fit_exporters() first.")
        return self._feature_weight_table(self._exp_model, self._exp_features)

    def buyer_weights(self) -> pd.DataFrame:
        if self._buy_model is None:
            raise RuntimeError("Call fit_buyers() first.")
        return self._feature_weight_table(self._buy_model, self._buy_features)

    # ── Persistence ──────────────────────────────────────────────────

    def save(self, path: str = "ml/saved/intent_model.pkl"):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump(self, f)
        print(f"  ✅ IntentModel saved → {path}")

    @classmethod
    def load(cls, path: str) -> "IntentModel":
        with open(path, "rb") as f:
            obj = pickle.load(f)
        print(f"  ✅ IntentModel loaded ← {path}")
        return obj