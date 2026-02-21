# Swipe to Export — Intelligent Trade Matchmaking Engine

> Algorithm-first EXIM platform that matches Indian exporters with global buyers
> using trade signals, behavioural data, and real-time geopolitical risk scoring.

---

## Project Structure

```
swipe_to_export/
├── main.py                   # Pipeline orchestrator + CLI entry point
├── config.py                 # All weights, constants & mappings (edit here to tune)
├── requirements.txt
│
├── data/
│   ├── __init__.py
│   ├── generator.py          # Synthetic demo data for all 3 schemas
│   └── cleaner.py            # Imputation, clipping, validation
│
├── scoring/
│   ├── __init__.py
│   └── engine.py             # Weighted sub-score → 0-100 composite scores
│
├── news/
│   ├── __init__.py
│   └── risk_adjuster.py      # Macro/geopolitical risk delta from news feed
│
├── matching/
│   ├── __init__.py
│   └── engine.py             # Cosine + euclidean similarity, ranked match pairs
│
└── output/
    ├── __init__.py
    ├── cards.py              # ASCII match card renderer
    └── analytics.py         # Aggregated stats dashboard
```

---

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run with synthetic demo data
python main.py

# Run with your own CSVs
python main.py \
  --exporters exporters.csv \
  --buyers    buyers.csv \
  --news      news.csv \
  --top_n     5 \
  --cards     15 \
  --output    match_results.csv
```

---

## Input Schemas

### News CSV
| Column | Type | Description |
|---|---|---|
| News_ID | str | Unique event ID |
| Date | date | Publication date |
| Region | str | Geographic region affected |
| Event_Type | str | Tariff Change / War / Calamity / etc. |
| Impact_Level | int 1-5 | Severity |
| Affected_Industry | str | Industry vertical |
| Tariff_Change | float | Delta (negative = reduction = opportunity) |
| StockMarket_Shock | float | Market movement |
| War_Flag | 0/1 | Active conflict signal |
| Natural_Calamity_Flag | 0/1 | Disruption signal |
| Currency_Shift | float | FX movement |

### Exporters CSV
| Column | Type | Description |
|---|---|---|
| Exporter_ID | str | Unique ID |
| Industry | str | Product vertical |
| Manufacturing_Capacity_Tons | int | Annual capacity |
| Revenue_Size_USD | int | Annual revenue |
| Certification | str | ISO / FDA / CE / etc. |
| Good_Payment_Terms | 0/1 | Flexible terms offered |
| Intent_Score | float 0-100 | Platform engagement score |
| Hiring_Signal | 0/1 | Active hiring = growth signal |
| War_Risk / Natural_Calamity_Risk | float 0-1 | Exposure scores |
| … | | See config.py for full list |

### Buyers CSV
| Column | Type | Description |
|---|---|---|
| Buyer_ID | str | Unique ID |
| Country | str | Buyer's country |
| Industry | str | Sourcing vertical |
| Avg_Order_Tons | int | Typical order size |
| Good_Payment_History | 0/1 | Payment reliability |
| Funding_Event | 0/1 | Recently funded = growth signal |
| Response_Probability | float 0-1 | Likelihood to reply |
| Preferred_Channel | str | Email / LinkedIn / WhatsApp / Phone |
| … | | See config.py for full list |

---

## Scoring Model

### Exporter Score (0-100)
```
reliability  (30%) = payment terms + response speed + certification
capacity     (25%) = manufacturing tons + revenue + team + shipments
intent       (25%) = intent index + hiring + LinkedIn + SalesNav signals
risk         (20%) = INVERTED(tariff + war + calamity + stock impact)
```

### Buyer Score (0-100)
```
creditworthiness (30%) = payment history + funding + revenue + certification
engagement       (20%) = engagement spike + profile visits + DM change
intent           (25%) = intent index + hiring growth
response         (15%) = response probability + prompt response speed
risk             (10%) = INVERTED(tariff news + war + calamity + stock)
```

### Match Score (0-100)
```
base_similarity  = 55% cosine + 45% euclidean  (on normalised feature vectors)
industry_bonus   = 0 if same industry, -30 if different
capacity_align   = how well exporter capacity meets buyer order size
news_delta       = ±macro risk adjustment from recent news events [-20, +10]
engagement_bonus = funding event (3pt) + DM change (2.5pt) + spike (2pt) + hiring (1.5pt)
cert_match       = +5 if both sides share the same non-null certification
```

---

## Configuration

Edit **`config.py`** to change any weights, penalties, or thresholds without touching algorithm code:

```python
EXPORTER_WEIGHTS        = {"reliability": 0.30, "capacity": 0.25, ...}
INDUSTRY_MISMATCH_PENALTY = 30.0
NEWS_LOOKBACK_DAYS       = 90
MATCH_TOP_N              = 5
```
