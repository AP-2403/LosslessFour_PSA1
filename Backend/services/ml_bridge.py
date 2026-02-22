import os
import sys

# Relative — works on any machine, not just yours
ML_ROOT = r"C:\Users\Vipin\Downloads\exim_swipe\MachineLearning"
sys.path.insert(0, ML_ROOT)

# Clear cached wrong config if present
if "config" in sys.modules:
    del sys.modules["config"]


# ... rest unchanged
from ml.match_for_user import run_match_for_user_supabase
import pandas as pd
from services.supabase_client import supabase



def run_ml_pipeline_for_user(user_id: str):
    """Run ML matching for a specific logged-in exporter."""

    exporter = supabase.table("exporters")\
        .select("*").eq("user_id", user_id).single().execute().data

    if not exporter:
        return {"status": "error", "detail": "Exporter profile not found"}

    matches_df = run_match_for_user_supabase(
        user_id           = user_id,
        demo              = False,
        save_csv          = False,
        intent_model_path = os.path.join(ML_ROOT, "ml", "saved", "intent_model.pkl"),
        match_model_path  = os.path.join(ML_ROOT, "ml", "saved", "match_model.pkl"),
        buyer_csv         = os.path.join(ML_ROOT, "data", "Importer_LiveSignals_v5_Updated.csv"),
        news_csv          = os.path.join(ML_ROOT, "data", "Global_News_LiveSignals_Updated.csv"),
    )

    records = []
    for _, row in matches_df.iterrows():
        records.append({
            "exporter_id":       user_id,
            "buyer_id":          str(row.get("Buyer_ID", "")),
            "match_score":       float(row.get("Rule_Match_Score", 0)),
            "ml_match_score":    float(row.get("Match_Score", 0)),
            "match_rank":        int(row.get("rank", 0)),
            "preferred_channel": str(row.get("Best_Channel", "")),
            "base_similarity":   float(row.get("Sim_Score", 0)),
            "capacity_align":    float(row.get("Cap_Score", 0)),
            "news_delta":        float(row.get("News_Score", 0)),
            "engagement_bonus":  float(row.get("Engage_Score", 0)),
            "status":            "pending",
        })

    for i in range(0, len(records), 100):
        supabase.table("matches")\
            .upsert(records[i:i+100], on_conflict="exporter_id,buyer_id")\
            .execute()

    return {"status": "success", "matches": len(records)}