from fastapi import APIRouter, Depends
from services.ml_bridge import run_ml_pipeline_for_user
from utils.auth_helper import get_current_user

router = APIRouter()

@router.post("/run-sync")
def run_ml_sync(user=Depends(get_current_user)):
    result = run_ml_pipeline_for_user(user_id=user.id)
    return result