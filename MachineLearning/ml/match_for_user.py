"""
ml/match_for_user.py
────────────────────
Fetches a user exporter's profile from Supabase,
scores them against all buyers, and returns/saves
a ranked match CSV sorted by ml_match_score descending.

If Supabase is unavailable or --demo flag is passed,
a random mock user profile is used instead.

Usage:
    # Real user from Supabase
    python ml/match_for_user.py --user_id "your-supabase-uuid"

    # Demo / no Supabase yet
    python ml/match_for_user.py --demo
"""

import sys, os, argparse, random
import pandas as pd
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.cleaner       import DataCleaner
from scoring.scorer     import ScoringEngine
from news.risk_adjuster import NewsRiskAdjuster
from matching.matcher   import MatchmakingEngine
from ml.intent_model    import IntentModel
from ml.match_model     import MatchModel
from config             import NEWS_LOOKBACK_DAYS

# ── Config ────────────────────────────────────────────────────────────────────
INTENT_MODEL_PATH = "ml/saved/intent_model.pkl"
MATCH_MODEL_PATH  = "ml/saved/match_model.pkl"
BUYER_CSV         = "data/Importer_LiveSignals_v5_Updated.csv"
NEWS_CSV          = "data/Global_News_LiveSignals_Updated.csv"

# ── Supabase column → internal field mapping ──────────────────────────────────
FIELD_MAP = {
    "id":                           "Exporter_ID",
    "company_name":                 "Company_Name",
    "industry":                     "Industry",
    "country":                      "Country",
    "manufacturing_capacity_tons":  "Manufacturing_Capacity_Tons",
    "revenue_size_usd":             "Revenue_Size_USD",
    "intent_score":                 "Intent_Score",
    "prompt_response_score":        "Prompt_Response_Score",
    "war_risk":                     "War_Risk",
    "natural_calamity_risk":        "Natural_Calamity_Risk",
    "currency_shift":               "Currency_Shift",
    "certifications":               "Certifications",
    "target_countries":             "Target_Countries",
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


# ── MOCK DATA — used when Supabase is not set up yet ─────────────────────────
MOCK_COMPANIES = [
    ("AgroVista Exports Ltd.",     "Agri-Foods",   "India",    "UK,Germany,UAE"),
    ("SteelCore Industries",       "Steel",         "India",    "USA,Germany"),
    ("TextileCraft Pvt. Ltd.",     "Textiles",      "India",    "UK,France,USA"),
    ("ChemPro Solutions",          "Chemicals",     "India",    "UAE,Singapore,UK"),
    ("LeatherLux International",   "Leather",       "India",    "France,Germany,UAE"),
    ("AutoParts Global",           "Auto Parts",    "India",    "USA,Germany,UAE"),
    ("ElectroHub Exports",         "Electronics",   "India",    "UK,USA,Singapore"),
]

def generate_mock_user() -> dict:
    company, industry, country, targets = random.choice(MOCK_COMPANIES)
    mock = {
        # Identity
        "Exporter_ID":                 f"DEMO{random.randint(1000,9999)}",
        "Company_Name":                company,
        "Industry":                    industry,
        "Country":                     country,
        "Date":                        datetime.today().strftime("%Y-%m-%d"),
        "Target_Countries":            targets,
        # Capacity
        "Manufacturing_Capacity_Tons": round(random.uniform(500, 15000), 0),
        "Revenue_Size_USD":            round(random.uniform(200000, 5000000), 0),
        "Team_Size":                   random.randint(10, 500),
        "Shipment_Value_USD":          round(random.uniform(50000, 2000000), 0),
        "Quantity_Tons":               round(random.uniform(100, 10000), 0),
        # Reliability
        "Good_Payment_Terms":          random.randint(0, 1),
        "Prompt_Response_Score":       round(random.uniform(4, 10), 1),
        "Certification":               random.choice(["ISO9001", "CE", "FDA", None]),
        "MSME_Udyam":                  random.randint(0, 1),
        # Intent signals
        "Intent_Score":                round(random.uniform(40, 95), 1),
        "Hiring_Signal":               random.randint(0, 1),
        "LinkedIn_Activity":           round(random.uniform(0, 100), 1),
        "SalesNav_ProfileViews":       random.randint(0, 500),
        "SalesNav_JobChange":          random.randint(0, 1),
        # Risk
        "Tariff_Impact":               round(random.uniform(-0.3, 0.3), 2),
        "War_Risk":                    round(random.uniform(0.0, 0.4), 2),
        "Natural_Calamity_Risk":       round(random.uniform(0.0, 0.3), 2),
        "StockMarket_Impact":          round(random.uniform(-0.2, 0.2), 2),
        "Currency_Shift":              round(random.uniform(-0.2, 0.2), 2),
    }
    print("🎲 Using random mock user profile:")
    print(f"   Company  : {mock['Company_Name']}")
    print(f"   Industry : {mock['Industry']}")
    print(f"   Country  : {mock['Country']}")
    print(f"   Targets  : {mock['Target_Countries']}")
    print(f"   Capacity : {mock['Manufacturing_Capacity_Tons']:,.0f} tons")
    print(f"   Revenue  : ${mock['Revenue_Size_USD']:,.0f}")
    print(f"   Intent   : {mock['Intent_Score']}")
    return mock

# ── Fetch from Supabase ───────────────────────────────────────────────────────
def fetch_user_from_supabase(user_id: str) -> dict:
    """
    Pull exporter row from Supabase for the given user UUID.
    Falls back to mock data if env vars are missing.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        print("⚠️  SUPABASE_URL / SUPABASE_KEY not set — falling back to mock data.")
        return generate_mock_user()

    try:
        from supabase import create_client
    except ImportError:
        print("⚠️  supabase package not installed (run: pip install supabase) — using mock data.")
        return generate_mock_user()

    try:
        client   = create_client(url, key)
        response = (
            client.table("exporters")
                  .select("*")
                  .eq("id", user_id)
                  .single()
                  .execute()
        )

        if not response.data:
            print(f"⚠️  No row found for user_id='{user_id}' — using mock data.")
            return generate_mock_user()

        raw      = response.data
        user_row = {}
        for sb_field, internal_field in FIELD_MAP.items():
            value = raw.get(sb_field)
            user_row[internal_field] = value if value is not None else DEFAULTS.get(internal_field, "Unknown")

        user_row["Date"] = datetime.today().strftime("%Y-%m-%d")
        print(f"✅ Loaded from Supabase: {user_row['Company_Name']} ({user_row['Industry']}, {user_row['Country']})")
        return user_row

    except Exception as e:
        print(f"⚠️  Supabase error: {e} — falling back to mock data.")
        return generate_mock_user()


# ── Core pipeline ─────────────────────────────────────────────────────────────
def run_match_for_user_supabase(
    user_id:            str  = None,
    demo:               bool = False,
    buyer_csv:          str  = BUYER_CSV,
    news_csv:           str  = NEWS_CSV,
    intent_model_path:  str  = INTENT_MODEL_PATH,
    match_model_path:   str  = MATCH_MODEL_PATH,
    output_csv:         str  = "user_matches.csv",
    save_csv:           bool = True,
) -> pd.DataFrame:
    """
    Main entry point for backend API or CLI.

    Parameters
    ----------
    user_id  : Supabase UUID. If None or demo=True, uses mock data.
    demo     : Force mock data (useful during development).
    save_csv : False to only return DataFrame without writing file.

    Returns
    -------
    pd.DataFrame — all matched buyers, Match_Score descending.
    """

    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║        SWIPE TO EXPORT — User Match Generator           ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    # ── Check models ──────────────────────────────────────────────────
    for path, name in [(intent_model_path, "IntentModel"), (match_model_path, "MatchModel")]:
        if not os.path.exists(path):
            raise FileNotFoundError(f"{name} not found at '{path}'. Run python ml/train.py first.")

    # ── Get user profile ──────────────────────────────────────────────
    if demo or not user_id:
        print("🎲 Demo mode — generating random user profile …")
        user_row = generate_mock_user()
    else:
        user_row = fetch_user_from_supabase(user_id)

    target_countries = user_row.pop("Target_Countries", "")

    # ── Build single-row DataFrame ────────────────────────────────────
    user_df         = pd.DataFrame([user_row])
    user_df["Date"] = pd.to_datetime(user_df["Date"])

    # ── Load buyers & news ────────────────────────────────────────────
    print("\n📂 Loading buyers and news …")
    buyers = pd.read_csv(buyer_csv, parse_dates=["Date"])
    news   = pd.read_csv(news_csv,  parse_dates=["Date"])
    print(f"   Buyers: {len(buyers):,}  |  News: {len(news):,}")

    # ── Clean ─────────────────────────────────────────────────────────
    print("🧹 Cleaning …")
    cleaner = DataCleaner()
    user_df = cleaner.clean_exporters(user_df)
    buyers  = cleaner.clean_buyers(buyers)
    news    = cleaner.clean_news(news)

    # ── Score ─────────────────────────────────────────────────────────
    scorer  = ScoringEngine()
    # Safety net — fill any scorer column missing from user profile
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
            user_df[col] = val  # ← already there, don't duplicate
    user_df = scorer.score_exporters(user_df)
    buyers  = scorer.score_buyers(buyers)

    # ── ML intent ─────────────────────────────────────────────────────
    print("🧠 ML intent scoring …")
    intent_model = IntentModel.load(intent_model_path)
    user_df["ml_intent_score"] = intent_model.predict_exporter_intent(user_df)
    buyers["ml_intent_score"]  = intent_model.predict_buyer_intent(buyers)

    user_df["Intent_Score"] = user_df["ml_intent_score"]
    buyers["Intent_Score"]  = buyers["ml_intent_score"]
    # Safety net — fill any scorer column missing from user profile
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
        "Currency_Shift":              0.0,
        "Quantity_Tons":               500,      # ← add
        "MSME_Udyam":                  0, 
    }
    for col, val in scorer_defaults.items():
        if col not in user_df.columns:
            user_df[col] = val
    user_df = scorer.score_exporters(user_df)
    buyers  = scorer.score_buyers(buyers)

    print(f"   User intent score  : {user_df['ml_intent_score'].iloc[0]:.1f}")
    print(f"   User overall score : {user_df['exporter_score'].iloc[0]:.1f}")

    # ── Filter by target countries ────────────────────────────────────
    if target_countries:
        targets  = [c.strip() for c in target_countries.split(",") if c.strip()]
        filtered = buyers[buyers["Country"].isin(targets)].copy()
        if len(filtered) > 0:
            print(f"🌍 Country filter → {len(filtered)} buyers in: {', '.join(targets)}")
            buyers = filtered
        else:
            print(f"⚠️  No buyers found in {targets} — showing all countries.")

    # ── Match pairs ───────────────────────────────────────────────────
    print("🔗 Matching …")
    adjuster = NewsRiskAdjuster(news, lookback_days=NEWS_LOOKBACK_DAYS)
    engine = MatchmakingEngine(user_df, buyers, adjuster, top_n=100)
    matches  = engine.run()

    # ── ML match score ────────────────────────────────────────────────
    print("🎯 ML match scoring …")
    match_model = MatchModel.load(match_model_path)
    matches["ml_match_score"] = match_model.predict(matches, user_df, buyers)

    # ── Sort & rank ───────────────────────────────────────────────────
    matches = matches.sort_values("ml_match_score", ascending=False).reset_index(drop=True)
    matches["rank"] = matches.index + 1

    def label(s):
        if s >= 90: return "Excellent"
        if s >= 75: return "Good"
        if s >= 60: return "Fair"
        return "Weak"
    matches["match_label"] = matches["ml_match_score"].apply(label)

    # ── Merge buyer metadata ──────────────────────────────────────────
    buyer_meta = buyers[[
        "Buyer_ID", "Country", "Industry", "buyer_score", "ml_intent_score"
    ]].rename(columns={
        "buyer_score":     "buyer_overall_score",
        "ml_intent_score": "buyer_intent_score",
    })
    output = matches.merge(buyer_meta, on="Buyer_ID", how="left")

    # ── Final columns ─────────────────────────────────────────────────
    want   = [
        "rank", "Buyer_ID", "Country", "Industry",
        "ml_match_score", "match_label", "match_score",
        "buyer_overall_score", "buyer_intent_score",
        "Preferred_Channel",
        "sim_score", "cap_score", "news_score", "engage_score",
    ]
    output = output[[c for c in want if c in output.columns]].copy()
    output.rename(columns={
        "ml_match_score":    "Match_Score",
        "match_score":       "Rule_Match_Score",
        "match_label":       "Match_Label",
        "Preferred_Channel": "Best_Channel",
    }, inplace=True)

    # ── Preview ───────────────────────────────────────────────────────
    print(f"\n{'═'*65}")
    print(f"  TOP MATCHES FOR: {user_row.get('Company_Name','User')} ({user_row.get('Industry','')})")
    print(f"{'═'*65}")
    print(f"  {'#':<4} {'Buyer_ID':<12} {'Country':<14} {'Industry':<16} {'Score':>6}  Label")
    print(f"  {'─'*65}")
    for _, r in output.head(10).iterrows():
        print(f"  #{int(r['rank']):<3} {r['Buyer_ID']:<12} {r['Country']:<14} "
              f"{r['Industry']:<16} {r['Match_Score']:>6.1f}  {r['Match_Label']}")

    # ── Save ──────────────────────────────────────────────────────────
    if save_csv:
        output.to_csv(output_csv, index=False)
        print(f"\n💾 Saved → {output_csv}")

    print(f"\n✅ {len(output)} matches ready.\n")
    return output


# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Match a user exporter against all buyers")
    p.add_argument("--user_id",      default=None,          help="Supabase user UUID")
    p.add_argument("--demo",         action="store_true",   help="Use random mock user (no Supabase needed)")
    p.add_argument("--buyers",       default=BUYER_CSV)
    p.add_argument("--news",         default=NEWS_CSV)
    p.add_argument("--intent_model", default=INTENT_MODEL_PATH)
    p.add_argument("--match_model",  default=MATCH_MODEL_PATH)
    p.add_argument("--output",       default="user_matches.csv")
    args = p.parse_args()

    run_match_for_user_supabase(
        user_id           = args.user_id,
        demo              = args.demo,
        buyer_csv         = args.buyers,
        news_csv          = args.news,
        intent_model_path = args.intent_model,
        match_model_path  = args.match_model,
        output_csv        = args.output,
    )