"""
output/analytics.py
────────────────────
analytics_summary — prints an aggregated dashboard of matchmaking
results: global stats, top industries, top countries, and channel
distribution.
"""

import pandas as pd


def analytics_summary(
    matches_df: pd.DataFrame,
    exporters:  pd.DataFrame,
    buyers:     pd.DataFrame,
) -> None:
    """Print a structured analytics report to stdout."""
    div = "═" * 62

    print(f"\n{div}")
    print("  📈  ANALYTICS SUMMARY")
    print(div)

    # ── Global counts ──────────────────────────────────────────────
    print(f"  Total Exporters Evaluated  : {exporters['Exporter_ID'].nunique():,}")
    print(f"  Total Buyers Evaluated     : {buyers['Buyer_ID'].nunique():,}")
    print(f"  Total Match Pairs          : {len(matches_df):,}")
    print(f"  Avg Match Score            : {matches_df['match_score'].mean():.2f}")
    pct_exc = (matches_df["match_score"] >= 80).mean() * 100
    pct_good = (matches_df["match_score"] >= 60).mean() * 100
    print(f"  Excellent Matches  (≥ 80)  : {pct_exc:.1f}%")
    print(f"  Good+ Matches      (≥ 60)  : {pct_good:.1f}%")

    # ── By exporter industry ───────────────────────────────────────
    print(f"\n  🏭 Top Exporter Industries by Avg Match Score")
    print(f"  {'Industry':<22} {'Avg Score':>10}")
    print(f"  {'─'*22}  {'─'*10}")
    ind = (
        matches_df.groupby("Exporter_Industry")["match_score"]
        .mean().sort_values(ascending=False).head(5)
    )
    for industry, score in ind.items():
        print(f"  {industry:<22} {score:>10.1f}")

    # ── By buyer country ───────────────────────────────────────────
    print(f"\n  🌍 Top Buyer Countries by Avg Match Score")
    print(f"  {'Country':<22} {'Avg Score':>10}")
    print(f"  {'─'*22}  {'─'*10}")
    cty = (
        matches_df.groupby("Buyer_Country")["match_score"]
        .mean().sort_values(ascending=False).head(5)
    )
    for country, score in cty.items():
        print(f"  {country:<22} {score:>10.1f}")

    # ── Channel distribution ───────────────────────────────────────
    print(f"\n  📡 Outreach Channel Performance")
    print(f"  {'Channel':<14} {'Pairs':>8} {'Avg Score':>10} {'Avg Response%':>14}")
    print(f"  {'─'*14}  {'─'*8}  {'─'*10}  {'─'*14}")
    chan = matches_df.groupby("Preferred_Channel").agg(
        Pairs=("match_score", "count"),
        Avg_Score=("match_score", "mean"),
    )
    if "response_score" in matches_df.columns:
        chan["Avg_Response"] = matches_df.groupby("Preferred_Channel")["response_score"].mean()
    else:
        chan["Avg_Response"] = float("nan")

    for ch, row in chan.iterrows():
        resp = f"{row['Avg_Response']:.1f}" if pd.notna(row["Avg_Response"]) else "N/A"
        print(f"  {ch:<14} {int(row['Pairs']):>8} {row['Avg_Score']:>10.1f} {resp:>14}")

    # ── Score distribution ─────────────────────────────────────────
    print(f"\n  📊 Match Score Distribution")
    buckets = [(80, 100, "Excellent"), (60, 80, "Good"), (40, 60, "Fair"), (0, 40, "Weak")]
    for lo, hi, label in buckets:
        count = ((matches_df["match_score"] >= lo) & (matches_df["match_score"] < hi)).sum()
        bar   = "█" * int(count / len(matches_df) * 30)
        print(f"  {label:<12} ({lo:>2}-{hi:<3}) : {bar:<30}  {count:>4}")

    print(f"\n{div}\n")
