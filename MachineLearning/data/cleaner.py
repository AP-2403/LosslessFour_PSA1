"""
data/cleaner.py
───────────────
DataCleaner — validates, imputes, and clips raw trade data
for all three schemas (news, exporters, buyers).

Steps performed
  1. Numeric NaN → column median
  2. Categorical NaN → "Unknown"
  3. Domain-specific clipping (e.g. Intent_Score 0-100)
"""

import numpy as np
import pandas as pd


class DataCleaner:
    """Stateless cleaner; call each method independently."""

    # ── EXPORTERS ────────────────────────────────────────────────────
    def clean_exporters(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        col_defaults = {
            "Manufacturing_Capacity_Tons": 0,
            "Revenue_Size_USD":            0,
            "Intent_Score":                50,
            "Prompt_Response_Score":       5.0,
            "War_Risk":                    0.1,
            "Natural_Calamity_Risk":       0.1,
            "Currency_Shift":              0.0,
        }
        for col, val in col_defaults.items():
            if col not in df.columns:
                df[col] = val
        num_cols = df.select_dtypes(include=np.number).columns
        cat_cols = df.select_dtypes(include="object").columns

        df[num_cols] = df[num_cols].fillna(df[num_cols].median())
        df[cat_cols] = df[cat_cols].fillna("Unknown")

        # Domain clips
        df["Manufacturing_Capacity_Tons"] = df["Manufacturing_Capacity_Tons"].clip(lower=0)
        df["Revenue_Size_USD"]            = df["Revenue_Size_USD"].clip(lower=0)
        df["Intent_Score"]                = df["Intent_Score"].clip(0, 100)
        df["Prompt_Response_Score"]       = df["Prompt_Response_Score"].clip(1, 10)
        df["War_Risk"]                    = df["War_Risk"].clip(0, 1)
        df["Natural_Calamity_Risk"]       = df["Natural_Calamity_Risk"].clip(0, 1)
        df["Currency_Shift"]              = df["Currency_Shift"].clip(-1, 1)

        return df

    # ── BUYERS ───────────────────────────────────────────────────────
    def clean_buyers(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        force_numeric = [
            "Funding_Event", "Good_Payment_History", "Engagement_Spike",
            "SalesNav_ProfileVisits", "DecisionMaker_Change", "Hiring_Growth",
            "Response_Probability", "Prompt_Response", "Tariff_News",
            "War_Event", "Natural_Calamity", "StockMarket_Shock",
            "Revenue_Size_USD", "Intent_Score", "Currency_Fluctuation",
        ]
        for col in force_numeric:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        num_cols = df.select_dtypes(include=np.number).columns
        cat_cols = df.select_dtypes(include="object").columns

        df[num_cols] = df[num_cols].fillna(df[num_cols].median())
        df[cat_cols] = df[cat_cols].fillna("Unknown")

        # Domain clips
        df["Intent_Score"]          = df["Intent_Score"].clip(0, 100)
        df["Response_Probability"]  = df["Response_Probability"].clip(0, 1)
        df["Prompt_Response"]       = df["Prompt_Response"].clip(1, 10)
        df["Currency_Fluctuation"]  = df["Currency_Fluctuation"].clip(-1, 1)

        return df

    # ── NEWS ─────────────────────────────────────────────────────────
    def clean_news(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        num_cols = df.select_dtypes(include=np.number).columns

        df[num_cols] = df[num_cols].fillna(0)
        df["Impact_Level"]      = pd.to_numeric(df["Impact_Level"], errors="coerce").fillna(3).clip(1, 5)
        df["Tariff_Change"]     = df["Tariff_Change"].clip(-1, 1)
        df["Currency_Shift"]    = df["Currency_Shift"].clip(-1, 1)
        df["War_Flag"]          = df["War_Flag"].clip(0, 1)
        df["Natural_Calamity_Flag"] = df["Natural_Calamity_Flag"].clip(0, 1)

        return df
