"""
main.py — Swipe to Export
──────────────────────────
Pipeline orchestrator and CLI entry point.

Usage (synthetic demo):
    python main.py

Usage (real CSVs):
    python main.py --exporters exporters.csv --buyers buyers.csv --news news.csv

All tuneable parameters live in config.py.
"""

import argparse
import sys
import pandas as pd

from data.generator   import generate_synthetic_data
from data.cleaner     import DataCleaner
from scoring.scorer   import ScoringEngine
from news.risk_adjuster import NewsRiskAdjuster
from matching.matcher  import MatchmakingEngine
from output.cards     import render_top_cards
from output.analytics import analytics_summary
from config import (
    MATCH_TOP_N,
    DISPLAY_CARDS_COUNT,
    DEFAULT_OUTPUT_CSV,
    NEWS_LOOKBACK_DAYS,
)


def run_pipeline(
    exporter_csv:   str | None = None,
    buyer_csv:      str | None = None,
    news_csv:       str | None = None,
    top_n:          int        = MATCH_TOP_N,
    display_cards:  int        = DISPLAY_CARDS_COUNT,
    export_results: str        = DEFAULT_OUTPUT_CSV,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Full pipeline:  load → clean → score → news-adjust → match → output.

    Returns
    -------
    matches   : ranked match pairs DataFrame
    exporters : scored exporter DataFrame
    buyers    : scored buyer DataFrame
    news      : cleaned news DataFrame
    """
    print("╔══════════════════════════════════════════════════════════╗")
    print("║        SWIPE TO EXPORT — Matchmaking Pipeline           ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    # ── 1. LOAD ───────────────────────────────────────────────────────
    if exporter_csv and buyer_csv and news_csv:
        print("📂 Loading from CSV files …")
        exporters = pd.read_csv(exporter_csv, parse_dates=["Date"])
        buyers    = pd.read_csv(buyer_csv,    parse_dates=["Date"])
        news      = pd.read_csv(news_csv,     parse_dates=["Date"])
    else:
        print("🔧 No CSVs provided — generating synthetic demo data …")
        news, exporters, buyers = generate_synthetic_data()

    print(f"   Exporters : {len(exporters):,}  |  "
          f"Buyers : {len(buyers):,}  |  "
          f"News events : {len(news):,}")

    # ── 2. CLEAN ──────────────────────────────────────────────────────
    print("\n🧹 Cleaning & validating data …")
    cleaner   = DataCleaner()
    exporters = cleaner.clean_exporters(exporters)
    buyers    = cleaner.clean_buyers(buyers)
    news      = cleaner.clean_news(news)

    # ── 3. SCORE ──────────────────────────────────────────────────────
    print("⚖️  Scoring exporters and buyers …")
    scorer    = ScoringEngine()
    exporters = scorer.score_exporters(exporters)
    buyers    = scorer.score_buyers(buyers)

    print(f"   Exporter score →  "
          f"min={exporters['exporter_score'].min():.1f}  "
          f"max={exporters['exporter_score'].max():.1f}  "
          f"mean={exporters['exporter_score'].mean():.1f}")
    print(f"   Buyer score    →  "
          f"min={buyers['buyer_score'].min():.1f}  "
          f"max={buyers['buyer_score'].max():.1f}  "
          f"mean={buyers['buyer_score'].mean():.1f}")

    # ── 4. NEWS RISK ADJUST ───────────────────────────────────────────
    print(f"\n📰 Calibrating macro-risk from news (lookback {NEWS_LOOKBACK_DAYS}d) …")
    news_adjuster = NewsRiskAdjuster(news, lookback_days=NEWS_LOOKBACK_DAYS)

    # ── 5. MATCHMAKING ────────────────────────────────────────────────
    print(f"🔗 Running matchmaking (top {top_n} buyers per exporter) …")
    engine  = MatchmakingEngine(exporters, buyers, news_adjuster, top_n=top_n)
    matches = engine.run()

    # ── 6. RENDER MATCH CARDS ─────────────────────────────────────────
    render_top_cards(matches, n=display_cards, rank=1)

    # ── 7. ANALYTICS ─────────────────────────────────────────────────
    analytics_summary(matches, exporters, buyers)

    # ── 8. EXPORT ─────────────────────────────────────────────────────
    if export_results:
        matches.to_csv(export_results, index=False)
        print(f"💾 Full results saved → {export_results}")

    print("\n✅  Pipeline complete.\n")
    return matches, exporters, buyers, news


# ── CLI ───────────────────────────────────────────────────────────────
def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Swipe to Export — Intelligent EXIM Matchmaking Engine",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--exporters", default=None,               help="Path to exporters CSV")
    p.add_argument("--buyers",    default=None,               help="Path to buyers CSV")
    p.add_argument("--news",      default=None,               help="Path to news CSV")
    p.add_argument("--top_n",     default=MATCH_TOP_N,  type=int, help="Top-N buyers per exporter")
    p.add_argument("--cards",     default=DISPLAY_CARDS_COUNT, type=int, help="Match cards to display")
    p.add_argument("--output",    default=DEFAULT_OUTPUT_CSV,  help="Output CSV path")
    return p.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    run_pipeline(
        exporter_csv   = args.exporters,
        buyer_csv      = args.buyers,
        news_csv       = args.news,
        top_n          = args.top_n,
        display_cards  = args.cards,
        export_results = args.output,
    )
