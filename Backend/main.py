from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, onboard, discover, matches, ml_runner

app = FastAPI(title="Swipe to Export API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ← second app.add_middleware block DELETED

app.include_router(auth.router,      prefix="/auth",     tags=["Auth"])
app.include_router(onboard.router,   prefix="/onboard",  tags=["Onboard"])
app.include_router(discover.router,  prefix="/discover", tags=["Discover"])
app.include_router(matches.router,   prefix="/matches",  tags=["Matches"])
app.include_router(ml_runner.router, prefix="/ml",       tags=["ML"])

@app.get("/")
def root():
    return {"message": "Swipe to Export API is running"}