from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from services.ml_bridge import run_ml_pipeline_for_user
from utils.auth_helper import get_current_user
from services.supabase_client import supabase

router = APIRouter()

@router.post("/run")
def trigger_ml(background_tasks: BackgroundTasks, user=Depends(get_current_user)):
    background_tasks.add_task(run_ml_pipeline_for_user, user.id)
    return {"status": "ML pipeline started in background"}

@router.post("/run-sync")
def trigger_ml_sync(user=Depends(get_current_user)):
    """Run synchronously for testing"""
    result = run_ml_pipeline_for_user(user.id)
    return result