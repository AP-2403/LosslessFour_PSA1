"""
ml/match_for_user.py
────────────────────
Fetches a user exporter's profile from Supabase,
scores them against all buyers, and returns/saves
a ranked match CSV sorted by ml_match_score descending.

Usage:
    # Real user from Supabase
    python ml/match_for_user.py --user_id "your-supabase-uuid"
"""

import sys, os, argparse
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Load secret environment variables (SUPABASE_URL, SUPABASE_KEY)
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.cleaner       import DataCleaner
from scoring.scorer     import ScoringEngine
from news.risk_adjuster import NewsRiskAdjuster
from matching.matcher   import MatchmakingEngine
from ml.intent_model    import IntentModel
from ml.match_model     import MatchModel
from config             import NEWS_LOOKBACK_DAYS

# ── Config ────────────────────────────────────────────────────────────────────
_ML_ROOT = r"C:\Users\Vipin\Downloads\exim_swipe\MachineLearning"

INTENT_MODEL_PATH = os.path.join(_ML_ROOT, "ml",   "saved", "intent_model.pkl")
MATCH_MODEL_PATH  = os.path.join(_ML_ROOT, "ml",   "saved", "match_model.pkl")
BUYER_CSV         = os.path.join(_ML_ROOT, "data",  "Importer_LiveSignals_v5_Updated.csv")
NEWS_CSV          = os.path.join(_ML_ROOT, "data",  "Global_News_LiveSignals_Updated.csv")

# ── Supabase column → internal field mapping ──────────────────────────────────
FIELD_MAP = {
    "user_id":                  "Exporter_ID",
    "company_name":             "Company_Name",
    "industry":                 "Industry",
    "hq_country":               "Country",
    "target_countries":         "Target_Countries",
    "annual_revenue_usd":       "Revenue_Size_USD",
    "manufacturing_capacity":   "Manufacturing_Capacity_Tons",
    "certifications":           "Certification",
    "good_payment_terms":       "Good_Payment_Terms",
    "prompt_response_score":    "Prompt_Response_Score",
    "team_size":                "Team_Size",
    "is_hiring":                "Hiring_Signal",
    "linkedin_active":          "LinkedIn_Activity",
}

DEFAULTS = {
    "Manufacturing_Capacity_Tons": 1000,
    "Revenue_Size_USD":            500000,
    "Intent_Score":                50,
    "Prompt_Response_Score":       5,
    "War_Risk":                    0.1,
    "Natural_Calamity_Risk":       0.1,
    "Currency_Shift":              0.0,
    "Certifications":              0,
    "Target_Countries":            "",
}

# ── Fetch from Supabase ───────────────────────────────────────────────────────
def fetch_user_from_supabase(user_id: str) -> dict:
    """
    Pull exporter row from Supabase for the given user UUID.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        raise ValueError("❌ SUPABASE_URL or SUPABASE_KEY environment variables are missing from .env")

    try:
        from supabase import create_client
    except ImportError:
        raise ImportError("❌ The 'supabase' package is not installed. Run: pip install supabase")

    client   = create_client(url, key)
    response = (
        client.table("exporters")
              .select("*")
              .eq("user_id", user_id)
              .execute()          # ← remove .single()
    )

    if not response.data or len(response.data) == 0:
        raise ValueError(f"No exporter found for user_id='{user_id}'. Complete onboarding first.")
    # Then take first row manually:
    raw = response.data[0]  
    user_row = {}
    for sb_field, internal_field in FIELD_MAP.items():
        value = raw.get(sb_field)

        if isinstance(value, list):
            value = ",".join(str(v) for v in value)

        if isinstance(value, bool):
            value = int(value)

        user_row[internal_field] = value if value is not None else DEFAULTS.get(internal_field, 0)
        # ── Parse manufacturing_capacity ──────────────────────────────────
        cap = user_row.get("Manufacturing_Capacity_Tons", 1000)
        if isinstance(cap, str):
            cap = cap.upper().replace("MT", "").replace("TONS", "").replace("HIGH", "5000").strip()
            try:
                parts = [float(x) for x in cap.split("-")]
                user_row["Manufacturing_Capacity_Tons"] = int(sum(parts) / len(parts))
            except:
                # Map text values to numbers
                text_map = {"HIGH": 5000, "MEDIUM": 2000, "LOW": 500, "VERY HIGH": 10000}
                user_row["Manufacturing_Capacity_Tons"] = text_map.get(
                    str(user_row.get("Manufacturing_Capacity_Tons", "")).upper().strip(), 1000
                )

# ── Parse team_size ───────────────────────────────────────────────
        ts = user_row.get("Team_Size", 50)
        if isinstance(ts, str):
            try:
                # "50-100" → average → 75
                parts = [float(x) for x in ts.split("-")]
                user_row["Team_Size"] = int(sum(parts) / len(parts))
            except:
                user_row["Team_Size"] = 50

    user_row["Date"] = datetime.today().strftime("%Y-%m-%d")
    print(f"✅ Loaded from Supabase: {user_row['Company_Name']} ({user_row['Industry']}, {user_row['Country']})")
    return user_row 

# ── Core pipeline ─────────────────────────────────────────────────────────────
def run_match_for_user_supabase(
    user_id:            str,
    buyer_csv:          str  = BUYER_CSV,
    news_csv:           str  = NEWS_CSV,
    intent_model_path:  str  = INTENT_MODEL_PATH,
    match_model_path:   str  = MATCH_MODEL_PATH,
    output_csv:         str  = "user_matches.csv",
    save_csv:           bool = True,
) -> pd.DataFrame:
    """
    Main entry point for backend API or CLI.
    """
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║        SWIPE TO EXPORT — User Match Generator           ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    for path, name in [(intent_model_path, "IntentModel"), (match_model_path, "MatchModel")]:
        if not os.path.exists(path):
            raise FileNotFoundError(f"{name} not found at '{path}'. Run python ml/train.py first.")

    user_row = fetch_user_from_supabase(user_id)
    target_countries = user_row.pop("Target_Countries", "")

    user_df         = pd.DataFrame([user_row])
    user_df["Date"] = pd.to_datetime(user_df["Date"])

    print("\n📂 Loading buyers and news …")
    buyers = pd.read_csv(buyer_csv, parse_dates=["Date"])
    news   = pd.read_csv(news_csv,  parse_dates=["Date"])
    print(f"   Buyers: {len(buyers):,}  |  News: {len(news):,}")

    print("🧹 Cleaning …")
    cleaner = DataCleaner()
    user_df = cleaner.clean_exporters(user_df)
    buyers  = cleaner.clean_buyers(buyers)
    news    = cleaner.clean_news(news)

    scorer  = ScoringEngine()
    scorer_defaults = {
        "Good_Payment_Terms":          0,
        "Prompt_Response_Score":       5.0,
        "Certification":               None,
        "Manufacturing_Capacity_Tons": 1000,
        "Revenue_Size_USD":            500000,
        "Team_Size":                   50,
        "Shipment_Value_USD":          100000,
        "Intent_Score":                50,
        "Hiring_Signal":               0,
        "LinkedIn_Activity":           50.0,
        "SalesNav_ProfileViews":       100,
        "SalesNav_JobChange":          0,
        "Tariff_Impact":               0.0,
        "War_Risk":                    0.1,
        "Natural_Calamity_Risk":       0.1,
        "StockMarket_Impact":          0.0,
        "Quantity_Tons":               500,
        "MSME_Udyam":                  0
    }
    for col, val in scorer_defaults.items():
        if col not in user_df.columns:
            user_df[col] = val
    
    user_df = scorer.score_exporters(user_df)
    buyers  = scorer.score_buyers(buyers)

    print("🧠 ML intent scoring …")
    intent_model = IntentModel.load(intent_model_path)
    user_df["ml_intent_score"] = intent_model.predict_exporter_intent(user_df)
    buyers["ml_intent_score"]  = intent_model.predict_buyer_intent(buyers)

    user_df["Intent_Score"] = user_df["ml_intent_score"]
    buyers["Intent_Score"]  = buyers["ml_intent_score"]

    user_df = scorer.score_exporters(user_df)
    buyers  = scorer.score_buyers(buyers)

    print(f"   User intent score  : {user_df['ml_intent_score'].iloc[0]:.1f}")
    print(f"   User overall score : {user_df['exporter_score'].iloc[0]:.1f}")

    if target_countries:
        targets  = [c.strip() for c in target_countries.split(",") if c.strip()]
        filtered = buyers[buyers["Country"].isin(targets)].copy()
        if len(filtered) > 0:
            print(f"🌍 Country filter → {len(filtered)} buyers in: {', '.join(targets)}")
            buyers = filtered.reset_index(drop=True)
        else:
            print(f"⚠️  No buyers found in {targets} — showing all countries.")
            buyers = buyers.reset_index(drop=True)

    industry = str(user_row.get("Industry", "")).strip()
    same_ind_buyers = buyers[buyers["Industry"].astype(str).str.strip() == industry]
    print(f"\n🔍 Industry debug:")
    print(f"   Exporter industry        : '{industry}'")
    print(f"   Same-industry buyers     : {len(same_ind_buyers)}")

    print("🔗 Matching …")
    adjuster = NewsRiskAdjuster(news, lookback_days=NEWS_LOOKBACK_DAYS)
    engine = MatchmakingEngine(user_df, buyers, adjuster, top_n=100)
    matches  = engine.run()

    print("🎯 ML match scoring …")
    match_model = MatchModel.load(match_model_path)
    matches["ml_match_score"] = match_model.predict(matches, user_df, buyers)

    matches = (
        matches
        .sort_values("ml_match_score", ascending=False)
        .drop_duplicates(subset=["Buyer_ID"], keep="first")
        .reset_index(drop=True)
    )
    matches["rank"] = matches.index + 1

    def label(s):
        if s >= 90: return "Excellent"
        if s >= 75: return "Good"
        if s >= 60: return "Fair"
        return "Weak"
    matches["match_label"] = matches["ml_match_score"].apply(label)

    buyer_meta = buyers[[
        "Buyer_ID", "Country", "Industry", "buyer_score", "ml_intent_score"
    ]].rename(columns={
        "buyer_score":     "buyer_overall_score",
        "ml_intent_score": "buyer_intent_score",
    })
    output = matches.merge(buyer_meta, on="Buyer_ID", how="left")

    want = [
        "rank", "Buyer_ID", "Country", "Industry",
        "ml_match_score", "match_label", "match_score",
        "buyer_overall_score", "buyer_intent_score",
        "Preferred_Channel",
        "base_similarity", "capacity_align", "news_delta", "engagement_bonus",
    ]
    output = output[[c for c in want if c in output.columns]].copy()
    output.rename(columns={
        "ml_match_score":    "Match_Score",
        "match_score":       "Rule_Match_Score",
        "match_label":       "Match_Label",
        "Preferred_Channel": "Best_Channel",
        "base_similarity":   "Sim_Score",
        "capacity_align":    "Cap_Score",
        "news_delta":        "News_Score",
        "engagement_bonus":  "Engage_Score",
    }, inplace=True)

    print(f"\n{'═'*65}")
    print(f"  TOP MATCHES FOR: {user_row.get('Company_Name','User')} ({user_row.get('Industry','')})")
    print(f"{'═'*65}")
    print(f"  {'#':<4} {'Buyer_ID':<12} {'Country':<14} {'Industry':<16} {'Score':>6}  Label")
    print(f"  {'─'*65}")
    for _, r in output.head(10).iterrows():
        print(f"  #{int(r['rank']):<3} {r['Buyer_ID']:<12} {r['Country']:<14} "
              f"{r['Industry']:<16} {r['Match_Score']:>6.1f}  {r['Match_Label']}")

    if save_csv:
        output.to_csv(output_csv, index=False)
        print(f"\n💾 Saved → {output_csv}")

    print(f"\n✅ {len(output)} matches ready.\n")
    return output

# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Match a user exporter against all buyers")
    p.add_argument("--user_id",      required=True,         help="Supabase user UUID")
    p.add_argument("--buyers",       default=BUYER_CSV)
    p.add_argument("--news",         default=NEWS_CSV)
    p.add_argument("--intent_model", default=INTENT_MODEL_PATH)
    p.add_argument("--match_model",  default=MATCH_MODEL_PATH)
    p.add_argument("--output",       default="user_matches.csv")
    args = p.parse_args()

    run_match_for_user_supabase(
        user_id           = args.user_id,
        buyer_csv         = args.buyers,
        news_csv          = args.news,
        intent_model_path = args.intent_model,
        match_model_path  = args.match_model,
        output_csv        = args.output,
    )