"""
ml/feature_importance.py
─────────────────────────
show_feature_weights — prints the learned weights for intent and match
models in a human-readable table showing direction (+/-) and magnitude,
exactly like the example:

    Feature                   Direction    Weight
    ─────────────────────────────────────────────
    Hiring_Signal             POSITIVE   +0.03142
    Good_Payment_Terms        POSITIVE   +0.01793
    Prompt_Response_Score     POSITIVE   +0.00920
    Tariff_Impact             NEGATIVE   -0.00890
    War_Risk                  NEGATIVE   -0.02100
    StockMarket_Impact        NEGATIVE   -0.01340
    Natural_Calamity_Risk     NEGATIVE   -0.00710

HOW WE SIGN THE WEIGHTS
────────────────────────
Tree-based importances (feature_importances_) are always ≥ 0 — they
measure "how much this feature splits" but not direction.

We recover direction by computing the Pearson correlation between each
feature and the model's own predictions on the training set.
    corr > 0  → feature pushes intent/score UP  → POSITIVE weight
    corr < 0  → feature pulls intent/score DOWN → NEGATIVE weight

Final signed weight = importance × sign(correlation)

This closely approximates SHAP mean values (the gold standard) without
requiring the shap library.  Install shap for exact SHAP values:
    pip install shap
"""

import numpy as np
import pandas as pd


def _sign_weights(
    model:         object,
    X:             pd.DataFrame,
    feature_names: list,
) -> pd.DataFrame:
    """
    Sign raw importances using correlation between feature and prediction.
    Returns DataFrame with columns: feature, raw_importance, direction, signed_weight.
    """
    preds = model.predict(X)

    signed_rows = []
    for feat in feature_names:
        imp = model.feature_importances_[list(feature_names).index(feat)]
        try:
            corr = float(np.corrcoef(X[feat].values, preds)[0, 1])
        except Exception:
            corr = 0.0
        direction = "POSITIVE" if corr >= 0 else "NEGATIVE"
        signed_w  = imp * (1 if corr >= 0 else -1)
        signed_rows.append({
            "feature":         feat,
            "raw_importance":  round(imp, 6),
            "direction":       direction,
            "signed_weight":   round(signed_w, 6),
        })

    return (
        pd.DataFrame(signed_rows)
        .assign(abs_weight=lambda d: d["signed_weight"].abs())
        .sort_values("abs_weight", ascending=False)
        .drop(columns="abs_weight")
        .reset_index(drop=True)
    )


def _print_weight_table(title: str, df: pd.DataFrame) -> None:
    div = "─" * 60
    print(f"\n{'═'*60}")
    print(f"  📊 {title}")
    print(f"{'═'*60}")
    print(f"  {'Feature':<32} {'Direction':<12} {'Weight':>10}")
    print(f"  {div}")
    for _, row in df.iterrows():
        is_positive = row["direction"] == "POSITIVE"
        sign        = "+" if is_positive else "-"
        abs_weight  = abs(row["signed_weight"])
        icon        = "✅ " if is_positive else "⚠️  "
        print(
            f"  {row['feature']:<32} "
            f"{icon + row['direction']:<12} "
            f"  {sign}{abs_weight:>9.5f}"
        )
    print(f"  {div}")
    pos = (df["direction"] == "POSITIVE").sum()
    neg = (df["direction"] == "NEGATIVE").sum()
    print(f"  Positive drivers: {pos}   |   Negative drivers: {neg}")


def show_feature_weights(
    intent_model=None,
    match_model=None,
    exporters_df: pd.DataFrame | None = None,
    buyers_df:    pd.DataFrame | None = None,
    matches_df:   pd.DataFrame | None = None,
) -> None:
    """
    Print signed feature weight tables for intent and/or match models.

    Parameters
    ----------
    intent_model  : fitted IntentModel instance
    match_model   : fitted MatchModel instance
    exporters_df  : needed to compute signs for exporter intent model
    buyers_df     : needed to compute signs for buyer intent model
    matches_df    : needed to compute signs for match model
    """

    # ── Exporter intent weights ───────────────────────────────────
    if intent_model is not None and intent_model._exp_model is not None:
        if exporters_df is not None:
            feats = intent_model._exp_features
            X     = exporters_df[feats].fillna(0).astype(float)
            table = _sign_weights(intent_model._exp_model, X, feats)
        else:
            table = intent_model.exporter_weights()
            table["direction"]    = "UNKNOWN"
            table["signed_weight"] = table["importance"]
        _print_weight_table("EXPORTER INTENT — Learned Feature Weights", table)

    # ── Buyer intent weights ──────────────────────────────────────
    if intent_model is not None and intent_model._buy_model is not None:
        if buyers_df is not None:
            feats = intent_model._buy_features
            X     = buyers_df[feats].fillna(0).astype(float)
            table = _sign_weights(intent_model._buy_model, X, feats)
        else:
            table = intent_model.buyer_weights()
            table["direction"]    = "UNKNOWN"
            table["signed_weight"] = table["importance"]
        _print_weight_table("BUYER INTENT — Learned Feature Weights", table)

    # ── Match score weights ───────────────────────────────────────
    if match_model is not None and match_model._model is not None:
        if matches_df is not None and exporters_df is not None and buyers_df is not None:
            feats = match_model._features
            X     = match_model._engineer_pair_features(
                matches_df, exporters_df, buyers_df
            )[feats]
            table = _sign_weights(match_model._model, X, feats)
        else:
            table = match_model.feature_weights()
            table["direction"]    = "UNKNOWN"
            table["signed_weight"] = table["importance"]
        _print_weight_table("MATCH SCORE — Learned Pair Feature Weights", table)