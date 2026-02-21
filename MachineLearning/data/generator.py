"""
data/generator.py
─────────────────
Synthetic data factory for all three trade schemas:
  • News      (geopolitical / macro events)
  • Exporters (Indian MSME / large exporter profiles)
  • Buyers    (global importers)

Replace calls to generate_synthetic_data() with pd.read_csv() once you
have real data files.
"""

import numpy as np
import pandas as pd
from config import (
    INDUSTRIES, COUNTRIES, CERTIFICATIONS, REGIONS,
    EVENT_TYPES, STATES, CHANNELS,
    SYNTH_N_EXPORTERS, SYNTH_N_BUYERS, SYNTH_N_NEWS, SYNTH_SEED,
)


def generate_synthetic_data(
    n_exporters: int = SYNTH_N_EXPORTERS,
    n_buyers:    int = SYNTH_N_BUYERS,
    n_news:      int = SYNTH_N_NEWS,
    seed:        int = SYNTH_SEED,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Returns
    -------
    news      : pd.DataFrame
    exporters : pd.DataFrame
    buyers    : pd.DataFrame
    """
    rng = np.random.default_rng(seed)

    # ── NEWS ─────────────────────────────────────────────────────────
    news = pd.DataFrame({
        "News_ID":               [f"N{i:04d}" for i in range(n_news)],
        "Date":                  pd.date_range("2024-01-01", periods=n_news, freq="W"),
        "Region":                rng.choice(REGIONS,      n_news),
        "Event_Type":            rng.choice(EVENT_TYPES,  n_news),
        "Impact_Level":          rng.integers(1, 6,        n_news),
        "Affected_Industry":     rng.choice(INDUSTRIES,   n_news),
        "Tariff_Change":         rng.uniform(-0.30, 0.30,  n_news),
        "StockMarket_Shock":     rng.uniform(-0.20, 0.20,  n_news),
        "War_Flag":              rng.integers(0, 2,         n_news),
        "Natural_Calamity_Flag": rng.integers(0, 2,         n_news),
        "Currency_Shift":        rng.uniform(-0.15, 0.15,  n_news),
    })

    # ── EXPORTERS ────────────────────────────────────────────────────
    exporters = pd.DataFrame({
        "Record_ID":   [f"R{i:04d}" for i in range(n_exporters)],
        "Date":        pd.date_range("2024-01-01", periods=n_exporters, freq="3D"),
        "Exporter_ID": [f"EXP{i:04d}" for i in range(n_exporters)],
        "State":       rng.choice(STATES,          n_exporters),
        "Industry":    rng.choice(INDUSTRIES,      n_exporters),
        "MSME_Udyam":  rng.integers(0, 2,           n_exporters),
        "Manufacturing_Capacity_Tons": rng.integers(100, 5000,         n_exporters),
        "Revenue_Size_USD":            rng.integers(50_000, 5_000_000, n_exporters),
        "Team_Size":                   rng.integers(10, 500,           n_exporters),
        "Certification":               rng.choice(CERTIFICATIONS,      n_exporters),
        "Good_Payment_Terms":          rng.integers(0, 2,              n_exporters),
        "Prompt_Response_Score":       rng.uniform(1, 10,              n_exporters),
        "Hiring_Signal":               rng.integers(0, 2,              n_exporters),
        "LinkedIn_Activity":           rng.integers(0, 2,              n_exporters),
        "SalesNav_ProfileViews":       rng.integers(0, 500,            n_exporters),
        "SalesNav_JobChange":          rng.integers(0, 2,              n_exporters),
        "Intent_Score":                rng.uniform(0, 100,             n_exporters),
        "Shipment_Value_USD":          rng.integers(10_000, 500_000,   n_exporters),
        "Quantity_Tons":               rng.integers(10, 3000,          n_exporters),
        "Tariff_Impact":               rng.uniform(-1, 1,              n_exporters),
        "StockMarket_Impact":          rng.uniform(-1, 1,              n_exporters),
        "War_Risk":                    rng.uniform(0, 1,               n_exporters),
        "Natural_Calamity_Risk":       rng.uniform(0, 1,               n_exporters),
        "Currency_Shift":              rng.uniform(-0.15, 0.15,        n_exporters),
    })

    # ── BUYERS ───────────────────────────────────────────────────────
    buyers = pd.DataFrame({
        "Record_ID":    [f"R{i:04d}" for i in range(n_buyers)],
        "Date":         pd.date_range("2024-01-01", periods=n_buyers, freq="2D"),
        "Buyer_ID":     [f"BUY{i:04d}" for i in range(n_buyers)],
        "Country":      rng.choice(COUNTRIES,      n_buyers),
        "Industry":     rng.choice(INDUSTRIES,     n_buyers),
        "Avg_Order_Tons":       rng.integers(5, 2000,           n_buyers),
        "Revenue_Size_USD":     rng.integers(100_000, 10_000_000, n_buyers),
        "Team_Size":            rng.integers(5, 1000,           n_buyers),
        "Certification":        rng.choice(CERTIFICATIONS,      n_buyers),
        "Good_Payment_History": rng.integers(0, 2,              n_buyers),
        "Prompt_Response":      rng.uniform(1, 10,              n_buyers),
        "Hiring_Growth":        rng.integers(0, 2,              n_buyers),
        "Funding_Event":        rng.integers(0, 2,              n_buyers),
        "Engagement_Spike":     rng.integers(0, 2,              n_buyers),
        "SalesNav_ProfileVisits": rng.integers(0, 300,          n_buyers),
        "DecisionMaker_Change": rng.integers(0, 2,              n_buyers),
        "Intent_Score":         rng.uniform(0, 100,             n_buyers),
        "Preferred_Channel":    rng.choice(CHANNELS,            n_buyers),
        "Response_Probability": rng.uniform(0, 1,               n_buyers),
        "Tariff_News":          rng.integers(0, 2,              n_buyers),
        "StockMarket_Shock":    rng.uniform(-1, 1,              n_buyers),
        "War_Event":            rng.integers(0, 2,              n_buyers),
        "Natural_Calamity":     rng.integers(0, 2,              n_buyers),
        "Currency_Fluctuation": rng.uniform(-0.15, 0.15,        n_buyers),
    })

    return news, exporters, buyers
