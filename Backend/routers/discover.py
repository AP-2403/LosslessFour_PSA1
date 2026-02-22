from fastapi import APIRouter, Depends
from services.supabase_client import supabase
from utils.auth_helper import get_current_user

router = APIRouter()

@router.get("/feed")
def get_feed(user=Depends(get_current_user)):
    # Get exporter profile
    exporter = supabase.table("exporters")\
        .select("id").eq("user_id", user.id).single().execute()

    exporter_id = exporter.data["id"]

    # Get already swiped buyer IDs
    swiped = supabase.table("swipe_actions")\
        .select("target_id").eq("user_id", user.id).execute()
    swiped_ids = [s["target_id"] for s in swiped.data]

    # Get top ranked matches excluding swiped
    query = supabase.table("matches")\
        .select("*, buyers(*)")\
        .eq("exporter_id", exporter_id)\
        .order("ml_match_score", desc=True)\
        .limit(12)

    if swiped_ids:
        query = query.not_.in_("buyer_id", swiped_ids)

    return query.execute().data

@router.post("/swipe")
def swipe(target_id: str, action: str, user=Depends(get_current_user)):
    # action = 'match' | 'skip' | 'pass'
    supabase.table("swipe_actions").insert({
        "user_id": user.id,
        "target_id": target_id,
        "action": action
    }).execute()

    if action == "match":
        supabase.table("matches")\
            .update({"status": "accepted"})\
            .eq("buyer_id", target_id).execute()

    return {"status": "recorded"}