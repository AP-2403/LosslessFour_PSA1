from fastapi import APIRouter, Depends
from services.supabase_client import supabase
from utils.auth_helper import get_current_user

router = APIRouter()

@router.get("/")
def get_matches(user=Depends(get_current_user)):
    exporter = supabase.table("exporters")\
        .select("id").eq("user_id", user.id).single().execute()

    result = supabase.table("matches")\
        .select("*, buyers(company_name, country, industry, preferred_channel)")\
        .eq("exporter_id", exporter.data["id"])\
        .order("match_rank")\
        .execute()

    return result.data