"""
ml/predict.py
─────────────
Prediction pipeline — loads saved .pkl models and uses them to score
new exporters/buyers WITHOUT retraining.

Flow:
  1. Load new CSVs
  2. Clean + rule-based score
  3. Load intent_model.pkl → predict ml_intent_score for each exporter & buyer
  4. Replace Intent_Score with ml_intent_score
  5. Re-score with updated intent
  6. Load match_model.pkl  → predict ml_match_score for each pair
  7. Print top match cards with ML scores
  8. Export results to CSV

Run:
    python ml/predict.py --exporters data/exporters.csv --buyers data/buyers.csv --news data/news.csv

Optional — custom model path:
    python ml/predict.py --exporters data/exporters.csv --buyers data/buyers.csv --news data/news.csv \
                         --intent_model ml/saved/intent_model.pkl \
                         --match_model  ml/saved/match_model.pkl
"""

import sys
import os
import argparse
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.generator     import generate_synthetic_data
from data.cleaner       import DataCleaner
from scoring.scorer     import ScoringEngine
from news.risk_adjuster import NewsRiskAdjuster
from matching.matcher   import MatchmakingEngine
from ml.intent_model    import IntentModel
from ml.match_model     import MatchModel
from output.cards       import render_top_cards
from output.analytics   import analytics_summary
from config             import MATCH_TOP_N, NEWS_LOOKBACK_DAYS, DISPLAY_CARDS_COUNT


def run_prediction(
    exporter_csv:       str | None = None,
    buyer_csv:          str | None = None,
    news_csv:           str | None = None,
    intent_model_path:  str        = "ml/saved/intent_model.pkl",
    match_model_path:   str        = "ml/saved/match_model.pkl",
    top_n:              int        = MATCH_TOP_N,
    display_cards:      int        = DISPLAY_CARDS_COUNT,
    output_csv:         str        = "ml_predictions.csv",
):
    print("╔══════════════════════════════════════════════════════════╗")
    print("║      SWIPE TO EXPORT — ML Prediction Pipeline           ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    # ── STEP 1: Check models exist ────────────────────────────────────
    for path, name in [(intent_model_path, "IntentModel"), (match_model_path, "MatchModel")]:
        if not os.path.exists(path):
            print(f"❌ {name} not found at '{path}'")
            print(f"   Run training first:  python ml/train.py --exporters data/exporters.csv "
                  f"--buyers data/buyers.csv --news data/news.csv")
            sys.exit(1)

    # ── STEP 2: Load data ─────────────────────────────────────────────
    if exporter_csv and buyer_csv and news_csv:
        print("📂 Loading from CSV files …")
        exporters = pd.read_csv(exporter_csv, parse_dates=["Date"])
        buyers    = pd.read_csv(buyer_csv,    parse_dates=["Date"])
        news      = pd.read_csv(news_csv,     parse_dates=["Date"])
    else:
        print("🔧 No CSVs provided — using synthetic demo data …")
        news, exporters, buyers = generate_synthetic_data()

    print(f"   Exporters : {len(exporters):,}  |  Buyers : {len(buyers):,}  |  News : {len(news):,}")

    # ── STEP 3: Clean ─────────────────────────────────────────────────
    print("\n🧹 Cleaning data …")
    cleaner   = DataCleaner()
    exporters = cleaner.clean_exporters(exporters)
    buyers    = cleaner.clean_buyers(buyers)
    news      = cleaner.clean_news(news)

    # ── STEP 4: Rule-based score (needed as base for matching) ────────
    print("⚖️  Rule-based scoring …")
    scorer    = ScoringEngine()
    exporters = scorer.score_exporters(exporters)
    buyers    = scorer.score_buyers(buyers)

    # ── STEP 5: Load IntentModel + predict intent ─────────────────────
    print(f"\n📦 Loading IntentModel from {intent_model_path} …")
    intent_model = IntentModel.load(intent_model_path)

    print("🧠 Predicting intent scores using learned weights …")
    exp_intent_scores = intent_model.predict_exporter_intent(exporters)
    buy_intent_scores = intent_model.predict_buyer_intent(buyers)

    exporters["ml_intent_score"] = exp_intent_scores
    buyers["ml_intent_score"]    = buy_intent_scores

    # Show intent score summary
    print(f"\n   Exporter intent → "
          f"min={exp_intent_scores.min():.1f}  "
          f"max={exp_intent_scores.max():.1f}  "
          f"mean={exp_intent_scores.mean():.1f}")
    print(f"   Buyer intent    → "
          f"min={buy_intent_scores.min():.1f}  "
          f"max={buy_intent_scores.max():.1f}  "
          f"mean={buy_intent_scores.mean():.1f}")

    # Print top 5 highest intent exporters
    print("\n  🏭 Top 5 Exporters by ML Intent Score:")
    top_exp = exporters.nlargest(5, "ml_intent_score")[
        ["Exporter_ID", "Industry", "ml_intent_score", "exporter_score"]
    ].reset_index(drop=True)
    print(f"  {'Exporter_ID':<12} {'Industry':<16} {'ML Intent':>10} {'Base Score':>10}")
    print(f"  {'─'*52}")
    for _, r in top_exp.iterrows():
        print(f"  {r['Exporter_ID']:<12} {r['Industry']:<16} {r['ml_intent_score']:>10.1f} {r['exporter_score']:>10.1f}")

    print("\n  🛒 Top 5 Buyers by ML Intent Score:")
    top_buy = buyers.nlargest(5, "ml_intent_score")[
        ["Buyer_ID", "Country", "Industry", "ml_intent_score", "buyer_score"]
    ].reset_index(drop=True)
    print(f"  {'Buyer_ID':<12} {'Country':<12} {'Industry':<16} {'ML Intent':>10} {'Base Score':>10}")
    print(f"  {'─'*64}")
    for _, r in top_buy.iterrows():
        print(f"  {r['Buyer_ID']:<12} {r['Country']:<12} {r['Industry']:<16} {r['ml_intent_score']:>10.1f} {r['buyer_score']:>10.1f}")

    # ── STEP 6: Replace Intent_Score with ML intent + re-score ────────
    print("\n♻️  Re-scoring with ML intent …")
    exporters["Intent_Score"] = exporters["ml_intent_score"]
    buyers["Intent_Score"]    = buyers["ml_intent_score"]
    exporters = scorer.score_exporters(exporters)
    buyers    = scorer.score_buyers(buyers)

    # ── STEP 7: Rule-based matching to generate pairs ─────────────────
    print(f"🔗 Generating match pairs (top {top_n} per exporter) …")
    adjuster = NewsRiskAdjuster(news, lookback_days=NEWS_LOOKBACK_DAYS)
    engine   = MatchmakingEngine(exporters, buyers, adjuster, top_n=top_n)
    matches  = engine.run()

    # ── STEP 8: Load MatchModel + predict ml_match_score ─────────────
    print(f"\n📦 Loading MatchModel from {match_model_path} …")
    match_model = MatchModel.load(match_model_path)

    print("🎯 Predicting match scores using learned weights …")
    matches["ml_match_score"] = match_model.predict(matches, exporters, buyers)

    # ── STEP 9: Score comparison ──────────────────────────────────────
    print("\n📈 Rule-Based vs ML Match Score Comparison:")
    print(f"  {'Metric':<25} {'Rule-Based':>12} {'ML Model':>12}")
    print(f"  {'─'*52}")
    for metric, rb, ml in [
        ("Mean score",  matches["match_score"].mean(),         matches["ml_match_score"].mean()),
        ("Max score",   matches["match_score"].max(),          matches["ml_match_score"].max()),
        ("Min score",   matches["match_score"].min(),          matches["ml_match_score"].min()),
        ("% ≥ 80",      (matches["match_score"]>=80).mean()*100, (matches["ml_match_score"]>=80).mean()*100),
        ("% ≥ 60",      (matches["match_score"]>=60).mean()*100, (matches["ml_match_score"]>=60).mean()*100),
    ]:
        print(f"  {metric:<25} {rb:>11.2f}  {ml:>11.2f}")

    # ── STEP 10: Swap in ML score for display + use ml_match_score ────
    matches["rule_match_score"] = matches["match_score"]   # keep original
    matches["match_score"]      = matches["ml_match_score"] # use ML for ranking

    # Re-rank using ML score
    matches = (
        matches
        .sort_values(["Exporter_ID", "ml_match_score"], ascending=[True, False])
        .assign(match_rank=lambda d: d.groupby("Exporter_ID").cumcount() + 1)
    )

    # ── STEP 11: Display top match cards ─────────────────────────────
    render_top_cards(matches, n=display_cards, rank=1)

    # ── STEP 12: Analytics ────────────────────────────────────────────
    analytics_summary(matches, exporters, buyers)

    # ── STEP 13: Export ───────────────────────────────────────────────
    matches.to_csv(output_csv, index=False)
    print(f"💾 ML predictions saved → {output_csv}")
    print("\n✅ Prediction complete.\n")

    return matches, exporters, buyers


# ── CLI ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Swipe to Export — ML Prediction")
    p.add_argument("--exporters",     default=None,                        help="Exporters CSV")
    p.add_argument("--buyers",        default=None,                        help="Buyers CSV")
    p.add_argument("--news",          default=None,                        help="News CSV")
    p.add_argument("--intent_model",  default="ml/saved/intent_model.pkl", help="Path to saved IntentModel")
    p.add_argument("--match_model",   default="ml/saved/match_model.pkl",  help="Path to saved MatchModel")
    p.add_argument("--top_n",         default=MATCH_TOP_N,   type=int,     help="Top-N buyers per exporter")
    p.add_argument("--cards",         default=DISPLAY_CARDS_COUNT, type=int)
    p.add_argument("--output",        default="ml_predictions.csv",        help="Output CSV path")
    args = p.parse_args()

    run_prediction(
        exporter_csv      = args.exporters,
        buyer_csv         = args.buyers,
        news_csv          = args.news,
        intent_model_path = args.intent_model,
        match_model_path  = args.match_model,
        top_n             = args.top_n,
        display_cards     = args.cards,
        output_csv        = args.output,
    )