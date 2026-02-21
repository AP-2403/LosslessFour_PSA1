"""
news/risk_adjuster.py
─────────────────────
NewsRiskAdjuster — translates recent geopolitical and macro events
into a score delta (penalty or bonus) applied to each exporter-buyer pair.

Logic
  • Filters news to events matching the pair's industry OR buyer's region
    within the configured lookback window.
  • Penalises: tariff hikes, war flags, natural calamities, negative stock shocks.
  • Rewards:   tariff reductions (new market opportunity).

Returns a float delta in [NEWS_DELTA_CLIP[0], NEWS_DELTA_CLIP[1]].
"""

import numpy as np
import pandas as pd
from config import (
    NEWS_LOOKBACK_DAYS,
    NEWS_TARIFF_PENALTY_SCALE,
    NEWS_WAR_PENALTY_PER_EVENT,
    NEWS_CALAMITY_PENALTY,
    NEWS_STOCK_PENALTY_SCALE,
    NEWS_TARIFF_BONUS_SCALE,
    NEWS_DELTA_CLIP,
)


class NewsRiskAdjuster:
    """
    Parameters
    ----------
    news_df      : cleaned news DataFrame
    lookback_days: only consider events within this window from the latest date
    """

    def __init__(self, news_df: pd.DataFrame, lookback_days: int = NEWS_LOOKBACK_DAYS):
        self.news = news_df.copy()
        self.news["Date"] = pd.to_datetime(self.news["Date"])
        self.lookback_days  = lookback_days
        self.reference_date = self.news["Date"].max()

    # ── Helpers ──────────────────────────────────────────────────────
    def _recent_news(self, industry: str, region: str) -> pd.DataFrame:
        """Filter to recent events relevant to this industry or region."""
        cutoff = self.reference_date - pd.Timedelta(days=self.lookback_days)
        mask = (
            (self.news["Date"] >= cutoff) &
            (
                (self.news["Affected_Industry"] == industry) |
                (self.news["Region"]            == region)
            )
        )
        return self.news[mask]

    # ── Public API ───────────────────────────────────────────────────
    def compute_risk_delta(self, industry: str, region: str) -> float:
        """
        Returns a score delta in NEWS_DELTA_CLIP range.
        Negative = risk environment penalises the match.
        Positive = favourable trade conditions boost the match.
        """
        recent = self._recent_news(industry, region)
        if recent.empty:
            return 0.0

        tariff_penalty   = recent["Tariff_Change"].clip(lower=0).sum()      * NEWS_TARIFF_PENALTY_SCALE
        war_penalty      = recent["War_Flag"].sum()                          * NEWS_WAR_PENALTY_PER_EVENT
        calamity_penalty = recent["Natural_Calamity_Flag"].sum()             * NEWS_CALAMITY_PENALTY
        stock_penalty    = recent["StockMarket_Shock"].clip(upper=0).abs().sum() * NEWS_STOCK_PENALTY_SCALE
        tariff_bonus     = (-recent["Tariff_Change"]).clip(lower=0).sum()   * NEWS_TARIFF_BONUS_SCALE

        delta = tariff_bonus - tariff_penalty - war_penalty - calamity_penalty - stock_penalty
        return float(np.clip(delta, *NEWS_DELTA_CLIP))

    def industry_risk_summary(self, industry: str, region: str) -> dict:
        """Human-readable breakdown of risk components for a given pair context."""
        recent = self._recent_news(industry, region)
        if recent.empty:
            return {"events": 0, "delta": 0.0}
        return {
            "events":          len(recent),
            "war_events":      int(recent["War_Flag"].sum()),
            "calamity_events": int(recent["Natural_Calamity_Flag"].sum()),
            "avg_tariff_change": round(recent["Tariff_Change"].mean(), 3),
            "avg_stock_shock":   round(recent["StockMarket_Shock"].mean(), 3),
            "delta":             self.compute_risk_delta(industry, region),
        }
