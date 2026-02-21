"""
matching/matcher.py  — fully vectorized, no inner loops
"""

import numpy as np
import pandas as pd
from tqdm import tqdm
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from news.risk_adjuster import NewsRiskAdjuster
from config import (
    MATCH_TOP_N,
    INDUSTRY_MISMATCH_PENALTY,
    CAPACITY_WEIGHT,
    COSINE_WEIGHT,
    EUCLIDEAN_WEIGHT,
    ENGAGEMENT_BONUSES,
    CERT_MATCH_BONUS,
    COUNTRY_REGION_MAP,
    NULL_CERTIFICATIONS,
)


class MatchmakingEngine:

    FEATURE_COLS_EXPORTER = [
        "exporter_score", "reliability_score", "capacity_score",
        "intent_score_calc", "risk_score",
    ]
    FEATURE_COLS_BUYER = [
        "buyer_score", "creditworthiness_score", "engagement_score",
        "intent_score_calc", "response_score", "risk_score",
    ]

    def __init__(self, exporters, buyers, news_adjuster, top_n=MATCH_TOP_N):
        self.exporters = exporters.reset_index(drop=True).copy()
        self.buyers    = buyers.reset_index(drop=True).copy()
        self.adjuster  = news_adjuster
        self.top_n     = top_n

    def _build_feature_matrix(self):
        exp_cols = [c for c in self.FEATURE_COLS_EXPORTER if c in self.exporters.columns]
        buy_cols = [c for c in self.FEATURE_COLS_BUYER    if c in self.buyers.columns]

        exp_mat = self.exporters[exp_cols].fillna(0).values.astype(float)
        buy_mat = self.buyers[buy_cols].fillna(0).values.astype(float)

        w = max(exp_mat.shape[1], buy_mat.shape[1])
        exp_mat = np.pad(exp_mat, ((0, 0), (0, w - exp_mat.shape[1])))
        buy_mat = np.pad(buy_mat, ((0, 0), (0, w - buy_mat.shape[1])))

        return (
            MinMaxScaler().fit_transform(exp_mat),
            MinMaxScaler().fit_transform(buy_mat),
        )

    def _precompute_news_delta_matrix(self) -> np.ndarray:
        """
        Build (n_exp × n_buy) news delta matrix using a lookup table.
        Only computes unique (industry, region) combinations — not 144M calls.
        """
        industries = self.exporters["Industry"].fillna("").values
        countries  = self.buyers["Country"].fillna("").values
        regions    = np.array([COUNTRY_REGION_MAP.get(str(c), "Unknown") for c in countries])
        # Unique pairs only
        unique_pairs = set(
            (str(ind), str(reg))
            for ind in industries
            for reg in regions
        )
        print(f"   News delta: {len(unique_pairs)} unique (industry, region) pairs "
              f"instead of {len(industries)*len(regions):,} calls")

        lookup = {
            (ind, reg): self.adjuster.compute_risk_delta(ind, reg)
            for ind, reg in tqdm(unique_pairs, desc="   News lookup", ncols=70)
        }

        # Build full matrix via lookup (vectorized)
        n_exp, n_buy = len(industries), len(regions)
        matrix = np.zeros((n_exp, n_buy), dtype=np.float32)
        for i, ind in enumerate(industries):
            row = np.array([lookup.get((str(ind), str(reg)), 0.0) for reg in regions], dtype=np.float32)
            matrix[i] = row

        return matrix

    def run(self) -> pd.DataFrame:
        n_exp = len(self.exporters)
        n_buy = len(self.buyers)
        print(f"\n   {n_exp:,} exporters × {n_buy:,} buyers = {n_exp*n_buy:,} pairs")

        # ── Similarity matrices (fully vectorized) ────────────────────
        print("   Building feature matrices …")
        exp_norm, buy_norm = self._build_feature_matrix()

        print("   Computing similarity matrices …")
        cos_sim  = (cosine_similarity(exp_norm, buy_norm) + 1) / 2 * 100
        max_dist = np.sqrt(exp_norm.shape[1]) * 100
        euc_sim  = np.clip(1 - euclidean_distances(exp_norm, buy_norm) / max_dist, 0, None) * 100
        base_sim = (COSINE_WEIGHT * cos_sim + EUCLIDEAN_WEIGHT * euc_sim).astype(np.float32)

        # ── Industry penalty matrix (fully vectorized) ────────────────
        print("   Computing industry penalty matrix …")
        exp_ind = self.exporters["Industry"].fillna("").values
        buy_ind = self.buyers["Industry"].fillna("").values
        industry_matrix = np.where(
            exp_ind[:, None] != buy_ind[None, :],
            -INDUSTRY_MISMATCH_PENALTY, 0.0
        ).astype(np.float32)

        # ── Capacity alignment matrix (vectorized) ────────────────────
        print("   Computing capacity alignment matrix …")
        exp_cap  = self.exporters["Manufacturing_Capacity_Tons"].fillna(500).values.astype(np.float32)
        buy_ord  = self.buyers.get("Avg_Order_Tons",
                   pd.Series([100]*n_buy)).fillna(100).values.astype(np.float32)
        mins     = np.minimum(exp_cap[:, None], buy_ord[None, :])
        maxs     = np.maximum(exp_cap[:, None], buy_ord[None, :]) + 1e-9
        cap_matrix = (CAPACITY_WEIGHT * mins / maxs * 100).astype(np.float32)

        # ── Engagement bonus matrix (vectorized) ──────────────────────
        print("   Computing engagement bonus matrix …")
        buy_funding  = self.buyers.get("Funding_Event",        pd.Series([0]*n_buy)).fillna(0).values.astype(np.float32)
        buy_dm       = self.buyers.get("DecisionMaker_Change", pd.Series([0]*n_buy)).fillna(0).values.astype(np.float32)
        buy_engage   = self.buyers.get("Engagement_Spike",     pd.Series([0]*n_buy)).fillna(0).values.astype(np.float32)
        exp_hiring   = self.exporters.get("Hiring_Signal",     pd.Series([0]*n_exp)).fillna(0).values.astype(np.float32)

        buy_eng_row  = (
            buy_funding  * ENGAGEMENT_BONUSES["Funding_Event"]        +
            buy_dm       * ENGAGEMENT_BONUSES["DecisionMaker_Change"] +
            buy_engage   * ENGAGEMENT_BONUSES["Engagement_Spike"]
        )  # shape (n_buy,)
        eng_matrix = (
            buy_eng_row[None, :] +
            (exp_hiring * ENGAGEMENT_BONUSES["Hiring_Signal"])[:, None]
        ).astype(np.float32)

        # ── Certification match matrix (vectorized) ───────────────────
        print("   Computing certification match matrix …")
        exp_cert = self.exporters.get("Certification", pd.Series([""]*n_exp)).fillna("").values
        buy_cert = self.buyers.get("Certification",   pd.Series([""]*n_buy)).fillna("").values
        valid    = np.array([c not in NULL_CERTIFICATIONS for c in exp_cert])
        cert_matrix = np.where(
            valid[:, None] & (exp_cert[:, None] == buy_cert[None, :]),
            CERT_MATCH_BONUS, 0.0
        ).astype(np.float32)

        # ── News delta matrix (lookup table — fast) ───────────────────
        news_matrix = self._precompute_news_delta_matrix()

        # ── Final score matrix ────────────────────────────────────────
        print("   Computing final score matrix …")
        score_matrix = np.clip(
            base_sim + industry_matrix + cap_matrix +
            eng_matrix + cert_matrix + news_matrix,
            0, 100
        )

        # ── Top-N selection ───────────────────────────────────────────
        print(f"   Selecting top {self.top_n} per exporter …")
        results = []

        with tqdm(total=n_exp, desc="   Building results", unit="exp", ncols=70) as pbar:
            for i in range(n_exp):
                exp_row  = self.exporters.iloc[i]
                scores_i = score_matrix[i]

                if self.top_n >= n_buy:
                    top_idx = np.argsort(scores_i)[::-1]
                else:
                    top_idx = np.argpartition(scores_i, -self.top_n)[-self.top_n:]
                    top_idx = top_idx[np.argsort(scores_i[top_idx])[::-1]]

                for rank, j in enumerate(top_idx, 1):
                    buy_row = self.buyers.iloc[j]
                    results.append({
                        "Exporter_ID":       exp_row.get("Exporter_ID", f"EXP{i}"),
                        "Exporter_Industry": exp_row.get("Industry", ""),
                        "Exporter_Score":    round(float(exp_row.get("exporter_score", 0)), 2),
                        "Buyer_ID":          buy_row.get("Buyer_ID", f"BUY{j}"),
                        "Buyer_Country":     buy_row.get("Country", ""),
                        "Buyer_Industry":    buy_row.get("Industry", ""),
                        "Buyer_Score":       round(float(buy_row.get("buyer_score", 0)), 2),
                        "Preferred_Channel": buy_row.get("Preferred_Channel", ""),
                        "base_similarity":   round(float(base_sim[i, j]), 2),
                        "industry_bonus":    round(float(industry_matrix[i, j]), 2),
                        "capacity_align":    round(float(cap_matrix[i, j]), 2),
                        "news_delta":        round(float(news_matrix[i, j]), 2),
                        "engagement_bonus":  round(float(eng_matrix[i, j]), 2),
                        "cert_match":        round(float(cert_matrix[i, j]), 2),
                        "match_score":       round(float(scores_i[j]), 2),
                        "match_rank":        rank,
                    })
                pbar.update(1)

        return pd.DataFrame(results)