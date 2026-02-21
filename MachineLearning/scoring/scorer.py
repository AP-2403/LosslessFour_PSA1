"""
scoring/engine.py
─────────────────
ScoringEngine — produces normalised 0-100 composite scores for
exporters and buyers using weighted sub-scores.

Exporter Score  = weighted sum of:
    reliability_score   (payment terms, response speed, certification)
    capacity_score      (manufacturing tons, revenue, team size, shipments)
    intent_score        (intent index, hiring, LinkedIn, SalesNav signals)
    risk_score          (tariff, war, calamity, stock — inverted so risk ↑ = score ↓)

Buyer Score = weighted sum of:
    creditworthiness    (payment history, funding events, revenue, certification)
    engagement_score    (engagement spike, profile visits, decision-maker change)
    intent_score        (intent index, hiring growth)
    response_score      (response probability, prompt response speed)
    risk_score          (tariff news, war, calamity, stock — inverted)
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from config import EXPORTER_WEIGHTS, BUYER_WEIGHTS, NULL_CERTIFICATIONS


def _norm(series: pd.Series) -> pd.Series:
    """Min-max normalise a Series to [0, 100]."""
    vals = series.values.reshape(-1, 1)
    return pd.Series(
        MinMaxScaler(feature_range=(0, 100)).fit_transform(vals).flatten(),
        index=series.index,
    )


def _cert_bonus(cert_series: pd.Series, pts: float = 10.0) -> pd.Series:
    """Binary bonus: pts if certification is non-null, 0 otherwise."""
    return cert_series.apply(lambda c: pts if c not in NULL_CERTIFICATIONS else 0.0)


class ScoringEngine:
    """Score exporters and buyers; results are added as new columns."""

    # ── EXPORTERS ────────────────────────────────────────────────────
    def score_exporters(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        w  = EXPORTER_WEIGHTS

        reliability = (
            _norm(df["Good_Payment_Terms"])     * 0.40 +
            _norm(df["Prompt_Response_Score"])  * 0.40 +
            _cert_bonus(df["Certification"])    * 0.20
        )

        capacity = (
            _norm(df["Manufacturing_Capacity_Tons"]) * 0.35 +
            _norm(df["Revenue_Size_USD"])            * 0.35 +
            _norm(df["Team_Size"])                   * 0.15 +
            _norm(df["Shipment_Value_USD"])          * 0.15
        )

        intent = (
            _norm(df["Intent_Score"])           * 0.40 +
            _norm(df["Hiring_Signal"])          * 0.15 +
            _norm(df["LinkedIn_Activity"])      * 0.15 +
            _norm(df["SalesNav_ProfileViews"])  * 0.20 +
            _norm(df["SalesNav_JobChange"])     * 0.10
        )

        risk_raw = (
            _norm(df["Tariff_Impact"].abs())        * 0.30 +
            _norm(df["War_Risk"])                   * 0.30 +
            _norm(df["Natural_Calamity_Risk"])      * 0.25 +
            _norm(df["StockMarket_Impact"].abs())   * 0.15
        )
        risk = 100 - risk_raw   # higher risk → lower score

        df["reliability_score"]  = reliability.clip(0, 100)
        df["capacity_score"]     = capacity.clip(0, 100)
        df["intent_score_calc"]  = intent.clip(0, 100)
        df["risk_score"]         = risk.clip(0, 100)

        df["exporter_score"] = (
            w["reliability"] * df["reliability_score"] +
            w["capacity"]    * df["capacity_score"]    +
            w["intent"]      * df["intent_score_calc"] +
            w["risk"]        * df["risk_score"]
        ).clip(0, 100).round(2)

        return df

    # ── BUYERS ───────────────────────────────────────────────────────
    def score_buyers(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        w  = BUYER_WEIGHTS

        creditworthiness = (
            _norm(df["Good_Payment_History"]) * 0.40 +
            _norm(df["Funding_Event"])        * 0.25 +
            _norm(df["Revenue_Size_USD"])     * 0.25 +
            _cert_bonus(df["Certification"])  * 0.10
        )

        engagement = (
            _norm(df["Engagement_Spike"])       * 0.35 +
            _norm(df["SalesNav_ProfileVisits"]) * 0.35 +
            _norm(df["DecisionMaker_Change"])   * 0.30
        )

        intent = (
            _norm(df["Intent_Score"])   * 0.65 +
            _norm(df["Hiring_Growth"])  * 0.35
        )

        response = (
            _norm(df["Response_Probability"]) * 0.55 +
            _norm(df["Prompt_Response"])      * 0.45
        )

        risk_raw = (
            _norm(df["Tariff_News"].astype(float))     * 0.30 +
            _norm(df["War_Event"].astype(float))       * 0.35 +
            _norm(df["Natural_Calamity"].astype(float))* 0.20 +
            _norm(df["StockMarket_Shock"].abs())       * 0.15
        )
        risk = 100 - risk_raw

        df["creditworthiness_score"] = creditworthiness.clip(0, 100)
        df["engagement_score"]       = engagement.clip(0, 100)
        df["intent_score_calc"]      = intent.clip(0, 100)
        df["response_score"]         = response.clip(0, 100)
        df["risk_score"]             = risk.clip(0, 100)

        df["buyer_score"] = (
            w["creditworthiness"] * df["creditworthiness_score"] +
            w["engagement"]       * df["engagement_score"]       +
            w["intent"]           * df["intent_score_calc"]      +
            w["response"]         * df["response_score"]         +
            w["risk"]             * df["risk_score"]
        ).clip(0, 100).round(2)

        return df
