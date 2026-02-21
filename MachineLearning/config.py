"""
config.py — Global constants, weights, and mappings for Swipe to Export.
Edit this file to tune scoring and matching behaviour without touching logic.
"""

# ── Exporter scoring weights (must sum to 1.0) ────────────────────────────
EXPORTER_WEIGHTS = {
    "reliability": 0.30,
    "capacity":    0.25,
    "intent":      0.25,
    "risk":        0.20,
}

# ── Buyer scoring weights (must sum to 1.0) ───────────────────────────────
BUYER_WEIGHTS = {
    "creditworthiness": 0.30,
    "engagement":       0.20,
    "intent":           0.25,
    "response":         0.15,
    "risk":             0.10,
}

# ── Matchmaking tuning ────────────────────────────────────────────────────
MATCH_TOP_N                  = 5       # Top-N buyers recommended per exporter
INDUSTRY_MISMATCH_PENALTY    = 30.0   # Points deducted for different industry
CAPACITY_WEIGHT              = 0.15   # Weight of capacity-alignment in final score
COSINE_WEIGHT                = 0.55   # vs euclidean in base similarity
EUCLIDEAN_WEIGHT             = 0.45

# ── Engagement event bonuses ──────────────────────────────────────────────
ENGAGEMENT_BONUSES = {
    "Funding_Event":         3.0,
    "DecisionMaker_Change":  2.5,
    "Engagement_Spike":      2.0,
    "Hiring_Signal":         1.5,  # exporter-side signal
}
CERT_MATCH_BONUS             = 5.0    # Both sides share a non-null certification

# ── News risk adjuster ────────────────────────────────────────────────────
NEWS_LOOKBACK_DAYS           = 90
NEWS_TARIFF_PENALTY_SCALE    = 30
NEWS_WAR_PENALTY_PER_EVENT   = 5
NEWS_CALAMITY_PENALTY        = 4
NEWS_STOCK_PENALTY_SCALE     = 20
NEWS_TARIFF_BONUS_SCALE      = 15     # Tariff reduction → opportunity
NEWS_DELTA_CLIP              = (-20, 10)

# ── Certification values (non-null = trusted) ─────────────────────────────
NULL_CERTIFICATIONS = {"None", "Unknown", ""}

# ── Country → region mapping ──────────────────────────────────────────────
COUNTRY_REGION_MAP = {
    "USA":       "North America",
    "Canada":    "North America",
    "Brazil":    "South America",
    "Germany":   "Europe",
    "France":    "Europe",
    "UK":        "Europe",
    "UAE":       "Middle East",
    "Japan":     "Asia",
    "Singapore": "Asia",
    "Australia": "Asia",
}

# ── Synthetic data generation defaults ───────────────────────────────────
SYNTH_N_EXPORTERS = 50
SYNTH_N_BUYERS    = 80
SYNTH_N_NEWS      = 30
SYNTH_SEED        = 42

INDUSTRIES    = ["Textiles", "Agri-Foods", "Pharma", "Electronics", "Chemicals",
                 "Auto Parts", "Handicrafts", "Steel", "Leather", "Spices"]
COUNTRIES     = ["USA", "Germany", "UAE", "UK", "Australia",
                 "Japan", "France", "Brazil", "Singapore", "Canada"]
CERTIFICATIONS = ["ISO 9001", "CE", "FDA", "FSSAI", "BIS", "REACH", "None"]
REGIONS       = ["Asia", "Europe", "North America", "Middle East", "South America"]
EVENT_TYPES   = ["Tariff Change", "Stock Shock", "War Escalation",
                 "Natural Calamity", "Currency Devaluation", "Policy Reform"]
STATES        = ["Maharashtra", "Gujarat", "Tamil Nadu",
                 "Rajasthan", "UP", "Karnataka"]
CHANNELS      = ["Email", "LinkedIn", "WhatsApp", "Phone"]

# ── Output ────────────────────────────────────────────────────────────────
DEFAULT_OUTPUT_CSV   = "match_results.csv"
DISPLAY_CARDS_COUNT  = 15
