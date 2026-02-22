"""
output/cards.py
───────────────
render_match_card — formats a single exporter-buyer match result
as a printable ASCII card with a visual score bar and score breakdown.
"""

import pandas as pd


def _score_label(score: float) -> str:
    if score >= 80:
        return "🏆 Excellent"
    elif score >= 60:
        return "✅ Good"
    elif score >= 40:
        return "⚠️  Fair"
    else:
        return "❌ Weak"


def render_match_card(row: pd.Series, bar_width: int = 20) -> str:
    """
    Parameters
    ----------
    row       : a single row from the matches DataFrame
    bar_width : character width of the visual progress bar

    Returns
    -------
    Formatted multi-line string ready for print().
    """
    filled   = int(row["match_score"] / 100 * bar_width)
    bar      = "█" * filled + "░" * (bar_width - filled)
    label    = _score_label(row["match_score"])
    sep      = "─" * 62

    return (
        f"\n{sep}\n"
        f"  🏭 EXPORTER : {row['Exporter_ID']:<10}  ({row['Exporter_Industry']:<14})  "
        f"Score: {row['Exporter_Score']}\n"
        f"  🛒 BUYER    : {row['Buyer_ID']:<10}  [{row['Buyer_Country']:<12}]  "
        f"({row['Buyer_Industry']:<14})  Score: {row['Buyer_Score']}\n"
        f"  📊 MATCH    : [{bar}]  {row['match_score']:.1f}/100  {label}\n"
        f"  📡 Channel  : {row['Preferred_Channel']}\n"
        f"  🔍 Breakdown: "
        f"sim={row['base_similarity']:.1f}  |  "
        f"cap={row['capacity_align']:.1f}  |  "
        f"news={row['news_delta']:+.1f}  |  "
        f"engage={row['engagement_bonus']:.1f}  |  "
        f"industry={row['industry_bonus']:+.0f}  |  "
        f"cert={row['cert_match']:.0f}\n"
        f"  🏅 Rank     : #{row['match_rank']}"
    )


def render_top_cards(
    matches_df: pd.DataFrame,
    n:          int = 15,
    rank:       int = 1,
) -> None:
    """Print the top-n rank-1 match cards sorted by match score."""
    subset = (
        matches_df[matches_df["match_rank"] == rank]
        .sort_values("match_score", ascending=False)
        .head(n)
    )
    print(f"\n{'═' * 62}")
    print(f"  🃏  TOP {n} MATCH CARDS  (rank #{rank} per exporter, highest score first)")
    print(f"{'═' * 62}")
    for _, row in subset.iterrows():
        print(render_match_card(row))
