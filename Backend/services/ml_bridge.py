import os
import sys

ML_ROOT = r"C:\Users\Vipin\Downloads\exim_swipe\MachineLearning"
sys.path.insert(0, ML_ROOT)

if "config" in sys.modules:
    del sys.modules["config"]

from ml.match_for_user import run_match_for_user_supabase
from services.supabase_client import supabase


def run_ml_pipeline_for_user(user_id: str):
    """Run ML matching for a specific logged-in exporter."""

    # Get exporter row using auth user_id
    result = supabase.table("exporters")\
        .select("*").eq("user_id", user_id).execute()

    if not result.data or len(result.data) == 0:
        return {"status": "error", "detail": "Exporter profile not found. Complete onboarding first."}

    exporter_row = result.data[0]
    exporter_uuid = exporter_row["id"]

    print(f"✅ Found exporter: {exporter_row.get('company_name')} (id={exporter_uuid})")

    # Run ML — pass exporter UUID (id column, not user_id)
    try:
        matches_df = run_match_for_user_supabase(
            user_id           = exporter_uuid,
            save_csv          = False,
            intent_model_path = os.path.join(ML_ROOT, "ml", "saved", "intent_model.pkl"),
            match_model_path  = os.path.join(ML_ROOT, "ml", "saved", "match_model.pkl"),
            buyer_csv         = os.path.join(ML_ROOT, "data", "Importer_LiveSignals_v5_Updated.csv"),
            news_csv          = os.path.join(ML_ROOT, "data", "Global_News_LiveSignals_Updated.csv"),
        )
    except Exception as e:
        return {"status": "error", "detail": str(e)}

    if matches_df is None or matches_df.empty:
        return {"status": "error", "detail": "ML returned no matches"}

    print("ML match columns:", matches_df.columns.tolist())
    print("Sample row:", matches_df.iloc[0].to_dict())

    # Sync buyers from CSV into Supabase if needed
    buyer_csv_ids = matches_df["Buyer_ID"].astype(str).unique().tolist()
    buyers_rows = supabase.table("buyers")\
        .select("id, buyer_csv_id")\
        .in_("buyer_csv_id", buyer_csv_ids)\
        .execute().data

    buyer_map = {b["buyer_csv_id"]: b["id"] for b in buyers_rows}

    missing = set(buyer_csv_ids) - set(buyer_map.keys())
    if missing:
        print(f"{len(missing)} buyers not in Supabase — syncing from CSV...")
        sync_buyers_from_csv(ML_ROOT)
        buyers_rows = supabase.table("buyers")\
            .select("id, buyer_csv_id")\
            .execute().data
        buyer_map = {b["buyer_csv_id"]: b["id"] for b in buyers_rows}

    # Build match records
    records = []
    skipped = 0
    for _, row in matches_df.iterrows():
        buyer_csv_id = str(row.get("Buyer_ID", ""))
        buyer_uuid   = buyer_map.get(buyer_csv_id)

        if not buyer_uuid:
            skipped += 1
            continue

        def safe_float(v, default=0.0):
            try:
                import math
                f = float(v)
                return default if math.isnan(f) else f
            except:
                return default

        records.append({
            "exporter_id":       exporter_uuid,
            "buyer_id":          buyer_uuid,
            "match_score":       safe_float(row.get("Rule_Match_Score")),
            "ml_match_score":    safe_float(row.get("Match_Score")),
            "match_rank":        int(row.get("rank", 0)),
            "preferred_channel": str(row.get("Best_Channel", "")),
            "base_similarity":   safe_float(row.get("Sim_Score")),
            "capacity_align":    safe_float(row.get("Cap_Score")),
            "news_delta":        safe_float(row.get("News_Score")),
            "engagement_bonus":  safe_float(row.get("Engage_Score")),
            "status":            "pending",
        })

    # Deduplicate
    seen = {}
    for r in records:
        key = f"{r['exporter_id']}_{r['buyer_id']}"
        seen[key] = r
    records = list(seen.values())

    print(f"Pushing {len(records)} unique matches, skipped {skipped}")
    for i in range(0, len(records), 100):
        supabase.table("matches")\
            .upsert(records[i:i+100], on_conflict="exporter_id,buyer_id")\
            .execute()

    return {"status": "success", "matches": len(records)}


def sync_buyers_from_csv(ml_root: str):
    """Sync buyer CSV data into Supabase buyers table."""
    import pandas as pd

    path = os.path.join(ml_root, "data", "Importer_LiveSignals_v5_Updated.csv")
    df = pd.read_csv(path)
    cols = df.columns.tolist()
    print("Buyer CSV columns:", cols)

    def safe_str(v):
        return str(v) if pd.notna(v) else ""

    def safe_int(v):
        try: return int(float(v)) if pd.notna(v) else 0
        except: return 0

    def safe_float(v):
        try: return float(v) if pd.notna(v) else 0.0
        except: return 0.0

    def safe_bool(v):
        try: return bool(int(float(v))) if pd.notna(v) else False
        except: return False

    buyer_id_col = next((c for c in cols if 'buyer' in c.lower() and 'id' in c.lower()), cols[0])
    country_col  = next((c for c in cols if 'country' in c.lower()), None)
    industry_col = next((c for c in cols if 'industry' in c.lower()), None)
    revenue_col  = next((c for c in cols if 'revenue' in c.lower()), None)
    order_col    = next((c for c in cols if 'order' in c.lower() or 'ton' in c.lower()), None)
    cert_col     = next((c for c in cols if 'cert' in c.lower()), None)
    payment_col  = next((c for c in cols if 'payment' in c.lower()), None)
    channel_col  = next((c for c in cols if 'channel' in c.lower()), None)
    prob_col     = next((c for c in cols if 'prob' in c.lower()), None)
    hiring_col   = next((c for c in cols if 'hiring' in c.lower()), None)
    funding_col  = next((c for c in cols if 'funding' in c.lower()), None)

    records = []
    for _, row in df.iterrows():
        bid = safe_str(row[buyer_id_col])
        if not bid:
            continue
        rec = {
            "buyer_csv_id":         bid,
            "company_name":         bid,
            "country":              safe_str(row[country_col]) if country_col else "",
            "industry":             safe_str(row[industry_col]) if industry_col else "",
            "avg_order_tons":       safe_int(row[order_col]) if order_col else 0,
            "revenue_size_usd":     safe_int(row[revenue_col]) if revenue_col else 0,
            "good_payment_history": safe_bool(row[payment_col]) if payment_col else False,
            "preferred_channel":    safe_str(row[channel_col]) if channel_col else "Email",
            "response_probability": safe_float(row[prob_col]) if prob_col else 0.5,
            "hiring_growth":        safe_bool(row[hiring_col]) if hiring_col else False,
            "funding_event":        safe_bool(row[funding_col]) if funding_col else False,
        }
        if cert_col:
            cv = safe_str(row[cert_col])
            rec["certifications"] = [cv] if cv and cv.lower() != "none" else []
        records.append(rec)

    seen = {}
    for r in records:
        seen[r["buyer_csv_id"]] = r
    records = list(seen.values())

    print(f"After dedup: {len(records)} unique buyers")
    for i in range(0, len(records), 100):
        supabase.table("buyers")\
            .upsert(records[i:i+100], on_conflict="buyer_csv_id").execute()
    print(f"✅ Synced {len(records)} buyers")