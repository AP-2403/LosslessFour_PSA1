"""
ml/check_accuracy.py
────────────────────
Checks model accuracy with multiple metrics and visualizations.
Run: python ml/check_accuracy.py
"""

import sys, os
import numpy as np
import pandas as pd
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score
)
from sklearn.model_selection import cross_val_score

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.cleaner       import DataCleaner
from scoring.scorer     import ScoringEngine
from news.risk_adjuster import NewsRiskAdjuster
from matching.matcher   import MatchmakingEngine
from ml.intent_model    import IntentModel
from ml.match_model     import MatchModel
from config             import NEWS_LOOKBACK_DAYS

INTENT_MODEL_PATH = "ml/saved/intent_model.pkl"
MATCH_MODEL_PATH  = "ml/saved/match_model.pkl"
BUYER_CSV         = "data/Importer_LiveSignals_v5_Updated.csv"
EXPORTER_CSV      = "data/Exporter_LiveSignals_v5_Updated.csv"
NEWS_CSV          = "data/Global_News_LiveSignals_Updated.csv"

def check_accuracy():
    print("╔══════════════════════════════════════════╗")
    print("║      MODEL ACCURACY CHECKER              ║")
    print("╚══════════════════════════════════════════╝\n")

    # ── Load & clean ──────────────────────────────────────────────────
    print("📂 Loading data …")
    exporters = pd.read_csv(EXPORTER_CSV, parse_dates=["Date"])
    buyers    = pd.read_csv(BUYER_CSV,    parse_dates=["Date"])
    news      = pd.read_csv(NEWS_CSV,     parse_dates=["Date"])

    cleaner   = DataCleaner()
    exporters = cleaner.clean_exporters(exporters)
    buyers    = cleaner.clean_buyers(buyers)
    news      = cleaner.clean_news(news)

    scorer    = ScoringEngine()
    exporters = scorer.score_exporters(exporters)
    buyers    = scorer.score_buyers(buyers)

    # ── Load models ───────────────────────────────────────────────────
    intent_model = IntentModel.load(INTENT_MODEL_PATH)
    match_model  = MatchModel.load(MATCH_MODEL_PATH)

    # ══════════════════════════════════════════════════════════════════
    # CHECK 1 — Intent Model Accuracy
    # ══════════════════════════════════════════════════════════════════
    print("\n" + "═"*50)
    print("  CHECK 1: Intent Model Accuracy")
    print("═"*50)

    exp_pred = intent_model.predict_exporter_intent(exporters)
    buy_pred = intent_model.predict_buyer_intent(buyers)

    for label, pred, df in [
        ("Exporter", exp_pred, exporters),
        ("Buyer",    buy_pred, buyers),
    ]:
        print(f"\n  [{label} Intent]")
        print(f"  Score range  : {pred.min():.1f} → {pred.max():.1f}")
        print(f"  Mean score   : {pred.mean():.1f}")
        print(f"  Std dev      : {pred.std():.1f}  (higher = better spread)")

        # Distribution buckets
        buckets = {
            "Low  (0-33) ":  ((pred < 33)).sum(),
            "Mid  (33-66)":  ((pred >= 33) & (pred < 66)).sum(),
            "High (66-100)": ((pred >= 66)).sum(),
        }
        print(f"  Distribution:")
        for bucket, count in buckets.items():
            bar = "█" * (count * 20 // len(pred))
            print(f"    {bucket}: {bar} {count} ({count/len(pred)*100:.1f}%)")

    # ══════════════════════════════════════════════════════════════════
    # CHECK 2 — Match Model Accuracy
    # ══════════════════════════════════════════════════════════════════
    print("\n" + "═"*50)
    print("  CHECK 2: Match Model Accuracy")
    print("═"*50)

    # Load existing match results
    if os.path.exists("ml_match_results.csv"):
        matches = pd.read_csv("ml_match_results.csv")
        print(f"\n  Loaded {len(matches):,} match pairs from ml_match_results.csv")

        rule  = matches["match_score"]
        ml    = matches["ml_match_score"]

        print(f"\n  {'Metric':<30} {'Rule-Based':>12} {'ML Model':>12}")
        print(f"  {'─'*55}")
        metrics = [
            ("Mean score",    rule.mean(),           ml.mean()),
            ("Std deviation", rule.std(),            ml.std()),
            ("Min score",     rule.min(),            ml.min()),
            ("Max score",     rule.max(),            ml.max()),
            ("% Excellent (≥90)", (rule>=90).mean()*100, (ml>=90).mean()*100),
            ("% Good      (≥75)", (rule>=75).mean()*100, (ml>=75).mean()*100),
            ("% Fair      (≥60)", (rule>=60).mean()*100, (ml>=60).mean()*100),
            ("% Weak       (<60)", (rule<60).mean()*100,  (ml<60).mean()*100),
        ]
        for name, r, m in metrics:
            print(f"  {name:<30} {r:>11.2f}  {m:>11.2f}")

        # Correlation between rule and ML scores
        if "engineered_label" in matches.columns:
            eng = matches["engineered_label"]
            corr = np.corrcoef(eng, ml)[0, 1]
            print(f"  Correlation (engineered vs ML) : {corr:.4f}  {'✅ good' if corr > 0.7 else '⚠️ low'}")
        else:
            corr = np.corrcoef(rule, ml)[0, 1]
            print(f"  Correlation (rule vs ML) : {corr:.4f}  {'✅ good' if corr > 0.7 else '⚠️ low'}")
        # MAE between rule-based and ML
        mae = mean_absolute_error(rule, ml)
        print(f"  MAE (rule vs ML)         : {mae:.4f}")

        # Score spread check
        print(f"\n  Score spread check:")
        print(f"  Rule-based range : {rule.max()-rule.min():.1f} pts  (want > 30)")
        print(f"  ML model range   : {ml.max()-ml.min():.1f} pts   (want > 30)")
        if ml.std() < 10:
            print(f"  ⚠️  ML scores are compressed (std={ml.std():.1f}) — spread may be too tight")
        else:
            print(f"  ✅  ML scores are well spread (std={ml.std():.1f})")

    else:
        print("  ⚠️  ml_match_results.csv not found — run ml/train.py first")

    # ══════════════════════════════════════════════════════════════════
    # CHECK 3 — Sanity: do better exporters get better matches?
    # ══════════════════════════════════════════════════════════════════
    print("\n" + "═"*50)
    print("  CHECK 3: Sanity Check — Better Exporters → Better Matches?")
    print("═"*50)

    if os.path.exists("ml_match_results.csv"):
        matches = pd.read_csv("ml_match_results.csv")
        avg_by_exp = matches.groupby("Exporter_ID")["ml_match_score"].mean().reset_index()
        avg_by_exp.columns = ["Exporter_ID", "avg_match_score"]
        merged = avg_by_exp.merge(
            exporters[["Exporter_ID", "exporter_score"]].drop_duplicates(),
            on="Exporter_ID", how="left"
        ).dropna()

        corr = np.corrcoef(merged["exporter_score"], merged["avg_match_score"])[0, 1]
        print(f"\n  Correlation (exporter_score vs avg match score): {corr:.4f}")
        if corr > 0.3:
            print(f"  ✅  Better exporters tend to get better matches (as expected)")
        else:
            print(f"  ⚠️  Low correlation — exporter quality may not be driving match scores")

    # ══════════════════════════════════════════════════════════════════
    # CHECK 4 — Industry match rate
    # ══════════════════════════════════════════════════════════════════
    print("\n" + "═"*50)
    print("  CHECK 4: Industry Match Rate in Top Results")
    print("═"*50)

    if os.path.exists("ml_match_results.csv"):
        matches = pd.read_csv("ml_match_results.csv")
        top1    = matches[matches["match_rank"] == 1]
        ind_match_rate = (top1["Exporter_Industry"] == top1["Buyer_Industry"]).mean() * 100
        print(f"\n  % of #1 matches with same industry : {ind_match_rate:.1f}%")
        if ind_match_rate > 70:
            print(f"  ✅  Model correctly prioritises industry match")
        else:
            print(f"  ⚠️  Model not strongly favouring same-industry matches")

    print("\n✅ Accuracy check complete.\n")

if __name__ == "__main__":
    check_accuracy()