"""
ml/train.py
───────────
Standalone training pipeline — runs the full ML layer:

  1. Load + clean + score data  (same as main.py)
  2. Run rule-based matcher to generate bootstrap match_score labels
  3. Train IntentModel  (exporter + buyer separately)
  4. Train MatchModel   on engineered pair features
  5. Replace rule-based scores with ML predictions
  6. Print signed feature weight tables
  7. Save trained models to ml/saved/
  8. Export final ML-scored matches to CSV

Run:
    python ml/train.py                                         # synthetic data
    python ml/train.py --exporters data/exporters.csv \\
                       --buyers    data/buyers.csv    \\
                       --news      data/news.csv
"""

import sys
import os
import argparse
import pandas as pd
from tqdm import tqdm

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.generator      import generate_synthetic_data
from data.cleaner        import DataCleaner
from scoring.scorer      import ScoringEngine
from news.risk_adjuster  import NewsRiskAdjuster
from matching.matcher    import MatchmakingEngine
from ml.intent_model     import IntentModel
from ml.match_model      import MatchModel
from ml.feature_importance import show_feature_weights
from config import MATCH_TOP_N, NEWS_LOOKBACK_DAYS


def run_training(
    exporter_csv:    str | None = None,
    buyer_csv:       str | None = None,
    news_csv:        str | None = None,
    match_labels_csv:str | None = None,
    label_col:       str        = "match_score",
    top_n:           int        = MATCH_TOP_N,
    save_dir:        str        = "ml/saved",
    output_csv:      str        = "ml_match_results.csv",
):
    print("╔══════════════════════════════════════════════════════════╗")
    print("║      SWIPE TO EXPORT — ML Training Pipeline             ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    files_exist = (
        exporter_csv and os.path.exists(exporter_csv) and
        buyer_csv    and os.path.exists(buyer_csv)    and
        news_csv     and os.path.exists(news_csv)
    )

    if files_exist:
        print("📂 Loading from CSV files …")
        exporters = pd.read_csv(exporter_csv, parse_dates=["Date"])
        buyers    = pd.read_csv(buyer_csv,    parse_dates=["Date"])
        news      = pd.read_csv(news_csv,     parse_dates=["Date"])
    else:
        if exporter_csv and not os.path.exists(exporter_csv):
            print(f"⚠️  CSV not found: {exporter_csv} — falling back to synthetic data")
        print("🔧 Generating synthetic demo data …")
        news, exporters, buyers = generate_synthetic_data()

    # ── STEP 1: Load data ─────────────────────────────────────────────

    print(f"   Exporters: {len(exporters):,}  |  Buyers: {len(buyers):,}  |  News: {len(news):,}")

    # ✅ FIX 5A — distribution check so you know if real vs synthetic ranges differ
    print(f"\n📊 Feature distribution check:")
    print(f"   Buyer Revenue     : min=${buyers['Revenue_Size_USD'].min():,.0f}  max=${buyers['Revenue_Size_USD'].max():,.0f}")
    print(f"   Buyer Order Tons  : min={buyers['Avg_Order_Tons'].min():.0f}  max={buyers['Avg_Order_Tons'].max():.0f}")
    print(f"   Buyer Industries  : {sorted(buyers['Industry'].unique().tolist())}")
    # ── STEP 2: Clean ────────────────────────────────────────────────
    print("\n🧹 Cleaning data …")
    with tqdm(total=3, desc="   Cleaning", unit="file") as pbar:
        exporters = DataCleaner().clean_exporters(exporters); pbar.update(1)
        buyers    = DataCleaner().clean_buyers(buyers);       pbar.update(1)
        news      = DataCleaner().clean_news(news);           pbar.update(1)

    # ── STEP 3: Rule-based scoring ────────────────────────────────────
    print("⚖️  Rule-based scoring (bootstrap labels) …")
    scorer = ScoringEngine()
    with tqdm(total=2, desc="   Scoring", unit="side") as pbar:
        exporters = scorer.score_exporters(exporters); pbar.update(1)
        buyers    = scorer.score_buyers(buyers);        pbar.update(1)

    # ── STEP 4: Rule-based matching ───────────────────────────────────
    total_pairs = len(exporters) * top_n
    print(f"🔗 Rule-based matching (top {top_n} per exporter) …")
    print(f"   Expected pairs: {len(exporters):,} exporters × {top_n} = ~{total_pairs:,}")
    adjuster = NewsRiskAdjuster(news, lookback_days=NEWS_LOOKBACK_DAYS)
    engine   = MatchmakingEngine(exporters, buyers, adjuster, top_n=top_n)
    matches  = engine.run()
    print(f"   ✅ Match pairs generated: {len(matches):,}")

    # Optional: merge real deal labels
    if match_labels_csv:
        print(f"🏷️  Merging real labels from {match_labels_csv} …")
        labels  = pd.read_csv(match_labels_csv)
        matches = matches.merge(
            labels[["Exporter_ID", "Buyer_ID", label_col]],
            on=["Exporter_ID", "Buyer_ID"],
            how="left",
            suffixes=("_rule", ""),
        )
        if f"{label_col}_rule" in matches.columns:
            matches[label_col] = matches[label_col].fillna(matches[f"{label_col}_rule"])

    # ── STEP 5: Train IntentModel ─────────────────────────────────────
    intent_model_path = f"{save_dir}/intent_model.pkl"
    if os.path.exists(intent_model_path):
        print(f"\n⚠️  Found existing model at {intent_model_path}")
        print("   Delete it first to retrain from scratch.")
        print("   Loading and retraining on top of saved model …")
        intent_model = IntentModel.load(intent_model_path)

    print("\n🧠 Training IntentModel …")
    intent_model = IntentModel(use_xgb=True)

    with tqdm(total=2, desc="   Intent training", unit="model") as pbar:
        print("   [1/2] Fitting exporter intent …")
        exporters = intent_model.fit_exporters(exporters)
        pbar.update(1)
        print("   [2/2] Fitting buyer intent …")
        buyers = intent_model.fit_buyers(buyers)
        pbar.update(1)

    # Replace Intent_Score with learned ML score
    exporters["Intent_Score"] = exporters["ml_intent_score"]
    buyers["Intent_Score"]    = buyers["ml_intent_score"]

    # ── STEP 6: Re-score with ML intent ──────────────────────────────
    print("\n♻️  Re-scoring with ML intent scores …")
    with tqdm(total=2, desc="   Re-scoring", unit="side") as pbar:
        exporters = scorer.score_exporters(exporters); pbar.update(1)
        buyers    = scorer.score_buyers(buyers);        pbar.update(1)

    # ── STEP 7: Train MatchModel ──────────────────────────────────────
    match_model_path = f"{save_dir}/match_model.pkl"
    if os.path.exists(match_model_path):
        print(f"\n⚠️  Found existing model at {match_model_path}")
        print("   Delete it first to retrain from scratch.")

    # ── Build engineered labels (vectorized) ─────────────────────────
    print("\n🔧 Engineering better match labels …")

    # Pull only needed columns
    exp_cols = exporters[["Exporter_ID","Manufacturing_Capacity_Tons","Intent_Score",
                       "Good_Payment_Terms","War_Risk","Natural_Calamity_Risk",
                       "Hiring_Signal"]].drop_duplicates("Exporter_ID")

    buy_cols = buyers[["Buyer_ID","Avg_Order_Tons","Intent_Score","Good_Payment_History",
                    "War_Event","Natural_Calamity","Funding_Event",
                    "Engagement_Spike","DecisionMaker_Change"]].drop_duplicates("Buyer_ID")

    # Rename to avoid column name conflicts
    exp_cols = exp_cols.add_prefix("e_").rename(columns={"e_Exporter_ID":"Exporter_ID"})
    buy_cols = buy_cols.add_prefix("b_").rename(columns={"b_Buyer_ID":"Buyer_ID"})

    # Safe merge — no row explosion
    m = matches.reset_index(drop=True)
    m = m.merge(exp_cols, on="Exporter_ID", how="left")
    m = m.merge(buy_cols, on="Buyer_ID",    how="left")

    # Compute components
    industry_match = (m["Exporter_Industry"] == m["Buyer_Industry"]).astype(float)
    cap_min        = m[["e_Manufacturing_Capacity_Tons","b_Avg_Order_Tons"]].min(axis=1)
    cap_max        = m[["e_Manufacturing_Capacity_Tons","b_Avg_Order_Tons"]].max(axis=1) + 1e-9
    cap_ratio      = cap_min / cap_max
    intent_product = (m["e_Intent_Score"].fillna(50)/100) * (m["b_Intent_Score"].fillna(50)/100)
    trust          = (m["e_Good_Payment_Terms"].fillna(0) + m["b_Good_Payment_History"].fillna(0)) / 2
    risk_penalty   = (m["e_War_Risk"].fillna(0) + m["b_War_Event"].fillna(0)*0.1 +
                  m["e_Natural_Calamity_Risk"].fillna(0) + m["b_Natural_Calamity"].fillna(0)*0.1)
    engagement     = (m["b_Funding_Event"].fillna(0) + m["b_Engagement_Spike"].fillna(0) +
                  m["b_DecisionMaker_Change"].fillna(0) + m["e_Hiring_Signal"].fillna(0)) / 4

    raw = (
    industry_match * 35 +
    cap_ratio      * 20 +
    intent_product * 20 +
    trust          * 10 +
    engagement     * 10 -
    risk_penalty   * 15
    )

    matches = matches.reset_index(drop=True)
    matches["engineered_label"] = (raw * 100 / 95).clip(0, 100).round(2).values

    print(f"   Label range : {matches['engineered_label'].min():.1f} → {matches['engineered_label'].max():.1f}")
    print(f"   Label std   : {matches['engineered_label'].std():.1f}  (want > 20)")

    # ── Train MatchModel on engineered labels ─────────────────────────
    print("\n🎯 Training MatchModel …")
    print(f"   Pairs to train on: {len(matches):,}")
    match_model = MatchModel(use_xgb=True)

    with tqdm(total=1, desc="   Match training", unit="model") as pbar:
        match_model.fit(matches, exporters, buyers, target_col="engineered_label")
        pbar.update(1)

    print("🎯 Predicting ML match scores …")
    with tqdm(total=1, desc="   Predicting", unit="batch") as pbar:
        matches["ml_match_score"] = match_model.predict(matches, exporters, buyers)
        pbar.update(1)

    # ── STEP 8: Feature weights ───────────────────────────────────────
    print("\n📊 Learned Feature Weights:")
    show_feature_weights(
        intent_model = intent_model,
        match_model  = match_model,
        exporters_df = exporters,
        buyers_df    = buyers,
        matches_df   = matches,
    )

    # ── STEP 9: Comparison ────────────────────────────────────────────
    print("\n📈 Rule-Based vs ML Match Score Comparison:")
    print(f"  {'Metric':<25} {'Rule-Based':>12} {'ML Model':>12}")
    print(f"  {'─'*50}")
    for metric, rb, ml in [
        ("Mean score",  matches['match_score'].mean(),    matches['ml_match_score'].mean()),
        ("Max score",   matches['match_score'].max(),     matches['ml_match_score'].max()),
        ("Min score",   matches['match_score'].min(),     matches['ml_match_score'].min()),
        ("% ≥ 80",      (matches['match_score']>=80).mean()*100,
                        (matches['ml_match_score']>=80).mean()*100),
    ]:
        print(f"  {metric:<25} {rb:>11.2f}  {ml:>11.2f}")

    # ── STEP 10: Save models ──────────────────────────────────────────
    print(f"\n💾 Saving models to {save_dir}/ …")
    with tqdm(total=2, desc="   Saving", unit="model") as pbar:
        intent_model.save(f"{save_dir}/intent_model.pkl"); pbar.update(1)
        match_model.save(f"{save_dir}/match_model.pkl");   pbar.update(1)

    # ── STEP 11: Export results ───────────────────────────────────────
    matches.to_csv(output_csv, index=False)
    print(f"💾 ML match results saved → {output_csv}")
    print("\n✅ Training complete.\n")

    return intent_model, match_model, matches, exporters, buyers


# ── CLI ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Swipe to Export — ML Training")
    p.add_argument("--exporters",    default="data/Exporter_LiveSignals_v5_Updated.csv")
    p.add_argument("--buyers",       default="data/Importer_LiveSignals_v5_Updated.csv")
    p.add_argument("--news",         default="data/Global_News_LiveSignals_Updated.csv")
    p.add_argument("--match_labels", default=None)
    p.add_argument("--label_col",    default="match_score")
    p.add_argument("--top_n",        default=MATCH_TOP_N, type=int)
    p.add_argument("--save_dir",     default="ml/saved")
    p.add_argument("--output",       default="ml_match_results.csv")
    args = p.parse_args()

    run_training(
        exporter_csv     = args.exporters,
        buyer_csv        = args.buyers,
        news_csv         = args.news,
        match_labels_csv = args.match_labels,
        label_col        = args.label_col,
        top_n            = args.top_n,
        save_dir         = args.save_dir,
        output_csv       = args.output,
    )