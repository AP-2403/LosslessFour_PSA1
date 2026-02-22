from fastapi import APIRouter, Depends
from models.exporter import ExporterProfile
from services.supabase_client import supabase
from utils.auth_helper import get_current_user

router = APIRouter()

@router.post("/exporter")
def save_exporter(profile: ExporterProfile, user=Depends(get_current_user)):
    data = profile.dict()
    data["user_id"] = user.id

    result = supabase.table("exporters")\
        .upsert(data, on_conflict="user_id").execute()

    return {"status": "saved", "data": result.data}

@router.get("/exporter/me")
def get_my_profile(user=Depends(get_current_user)):
    result = supabase.table("exporters")\
        .select("*").eq("user_id", user.id).single().execute()
    return result.data