<<<<<<< HEAD
# 🌍 model_exim — Swipe to Export

An AI-powered B2B matchmaking engine that connects Indian exporters with global buyers using ML-based intent scoring, risk-adjusted news signals, and smart similarity matching.

---

## 📌 What It Does

- Takes an exporter's profile (industry, capacity, certifications, target markets, etc.)
- Scores them against thousands of global buyers
- Adjusts matches using real-time news risk signals (tariffs, wars, calamities, currency shifts)
- Ranks buyers by ML-predicted match score
- Returns a ranked list of best-fit buyers with match labels (Excellent / Good / Fair / Weak)

---

## 🗂️ Project Structure

```
model_exim/
├── data/
│   ├── cleaner.py                        # Data cleaning pipeline
│   ├── generator.py                      # Synthetic data generator
│   ├── Exporter_LiveSignals_v5_Updated.csv
│   ├── Importer_LiveSignals_v5_Updated.csv
│   └── Global_News_LiveSignals_Updated.csv
│
├── matching/
│   └── matcher.py                        # Vectorized matchmaking engine
│
├── ml/
│   ├── intent_model.py                   # ML intent scoring model
│   ├── match_model.py                    # ML match scoring model
│   ├── match_for_user.py                 # Main entry point (CLI + API)
│   ├── train.py                          # Model training script
│   ├── predict.py                        # Batch prediction
│   ├── feature_importance.py             # Feature analysis
│   └── saved/                            # Trained model files (not pushed to git)
│       ├── intent_model.pkl
│       └── match_model.pkl
│
├── news/
│   └── risk_adjuster.py                  # News-based risk delta calculator
│
├── output/
│   ├── analytics.py                      # Match analytics
│   └── cards.py                          # Buyer card renderer
│
├── scoring/
│   └── scorer.py                         # Exporter & buyer scoring engine
│
├── config.py                             # All weights, thresholds, constants
├── main.py                               # Batch pipeline entry point
├── requirements.txt
└── README.md
=======
# LOC8 – Enterprise B2B Portal
### React + Vite Migration

A pixel-perfect migration of the LOC8 B2B portal from vanilla HTML/CSS/JS to React + Vite.

---

## Project Structure

```
src/
├── assets/
├── components/
│   ├── DiscoveryCards.jsx   # Discover page: swipe cards + country map
│   ├── Login.jsx            # Login & Register views (unified)
│   ├── MapComponent.jsx     # Leaflet maps: DiscoverMap, TradeMap, MatchesMap
│   ├── Matches.jsx          # Matches page: list + partner map panel
│   ├── Onboarding.jsx       # Onboarding form with validation
│   ├── Sidebar.jsx          # Reusable sidebar (discover / matches variant)
│   └── Topbar.jsx           # Reusable topbar
├── App.css
├── App.jsx                  # Root: page state + dev nav
├── index.css                # All global styles (exact port from HTML)
└── main.jsx
>>>>>>> 71c497c25f2ef86e4e99a6e35a035badfc8e2e64
```

---

<<<<<<< HEAD
## ⚙️ Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourname/model_exim.git
cd model_exim
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up environment variables
Copy the example file and fill in your Supabase credentials:
```bash
cp .env.example .env
```

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

---

## 🧠 Train the Models

Before running matches, you need to train the intent and match models:

```bash
python ml/train.py
```

This saves `intent_model.pkl` and `match_model.pkl` to `ml/saved/`.

---

## 🚀 Run a Match

### Demo mode (no Supabase needed)
```bash
python ml/match_for_user.py --demo
```
Generates a random mock exporter and matches them against all buyers.

### Real user from Supabase
```bash
python ml/match_for_user.py --user_id "your-supabase-uuid"
```

### Custom options
```bash
python ml/match_for_user.py --demo \
  --buyers data/Importer_LiveSignals_v5_Updated.csv \
  --news data/Global_News_LiveSignals_Updated.csv \
  --output my_matches.csv
```

Output is saved as a CSV ranked by `Match_Score` descending.

---

## 📊 Scoring Model

### Exporter Score (0–100)
| Component | Weight |
|---|---|
| Reliability (payment terms, response speed, certifications) | 30% |
| Capacity (manufacturing, revenue, team, shipments) | 25% |
| Intent (intent index, hiring, LinkedIn, SalesNav signals) | 25% |
| Risk — inverted (tariff, war, calamity, stock impact) | 20% |

### Buyer Score (0–100)
| Component | Weight |
|---|---|
| Creditworthiness (payment history, funding, revenue) | 30% |
| Intent (intent index, hiring growth) | 25% |
| Engagement (spike, profile visits, DM change) | 20% |
| Response (probability + prompt response speed) | 15% |
| Risk — inverted (tariff, war, calamity, stock) | 10% |

### Match Score (0–100)
```
base_similarity  = 55% cosine + 45% euclidean (on normalised feature vectors)
industry_bonus   = 0 if same industry, -30 if different
capacity_align   = how well exporter capacity meets buyer order size
news_delta       = ±macro risk adjustment from recent news [-20, +10]
engagement_bonus = funding (3pt) + DM change (2.5pt) + spike (2pt) + hiring (1.5pt)
cert_match       = +5 if both sides share the same certification
```

### Match Labels
| Score | Label |
|---|---|
| ≥ 90 | Excellent |
| ≥ 75 | Good |
| ≥ 60 | Fair |
| < 60 | Weak |

---

## 📥 Input — Exporter Form Fields

| Field | Type | Description |
|---|---|---|
| Company Name | str | Company name |
| Industry | str | Agri-Foods / Steel / Textiles / Chemicals / etc. |
| Country | str | Exporter's country |
| Target Countries | list | UK, USA, Germany, UAE, etc. |
| Manufacturing Capacity | int | Annual capacity in tons |
| Annual Revenue | int | USD |
| Certifications | str | ISO9001 / CE / FDA / None |
| Good Payment Terms | bool | Flexible terms offered |
| Prompt Response Score | float 1–10 | Response speed |
| Team Size | int | Number of employees |
| Currently Hiring? | bool | Hiring signal |
| LinkedIn Activity | float | Low / Medium / High → 0–100 |

> Risk fields (`War_Risk`, `Currency_Shift`, etc.) are auto-computed from the news pipeline — no user input needed.

---

## 📤 Output — Match CSV Columns

| Column | Description |
|---|---|
| rank | Match rank (1 = best) |
| Buyer_ID | Unique buyer identifier |
| Country | Buyer's country |
| Industry | Buyer's industry |
| Match_Score | ML-predicted match score (0–100) |
| Match_Label | Excellent / Good / Fair / Weak |
| Rule_Match_Score | Rule-based score (pre-ML) |
| buyer_overall_score | Buyer's composite score |
| buyer_intent_score | Buyer's ML intent score |
| Best_Channel | Email / LinkedIn / WhatsApp / Phone |
| sim_score | Cosine + Euclidean similarity |
| cap_score | Capacity alignment score |
| news_score | News risk delta |
| engage_score | Engagement bonus |

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon/service key |

Never commit your `.env` file. Use `.env.example` as a template.

---

## 📦 Requirements

```
pandas
numpy
scikit-learn
tqdm
supabase
python-dotenv
```

Install all with:
```bash
pip install -r requirements.txt
```

---

## 🛣️ Roadmap

- [x] ML intent scoring model
- [x] Vectorized matchmaking engine
- [x] News risk adjustment pipeline
- [x] Supabase integration
- [ ] FastAPI backend
- [ ] Onboarding form → intent score pipeline
- [ ] Frontend (React / Next.js)
- [ ] Real-time match refresh on news update
=======
## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Maps (Leaflet)

Leaflet and the `leaflet-curve` plugin are loaded **globally** via CDN tags in `index.html` so they are available as `window.L` in all components. No additional npm install required for maps.

Three map modes in `MapComponent.jsx`:

| Export | Usage | Source |
|--------|-------|--------|
| `<DiscoverMap countryName="China" />` | Card right-panel, highlights a single country | `mapfirst.html` |
| `<TradeMap />` | Interactive trade route builder with curved arcs | `map.html` |
| `<MatchesMap partners={[...]} />` | Matches right panel with partner pin markers | new |

---

## Page Navigation

App state (`currentPage`) drives which component renders. The dev nav pill at the bottom of the screen lets you jump between pages during development.

| State value | Component |
|------------|-----------|
| `login`    | `<Login initialView="login" />` |
| `register` | `<Login initialView="register" />` |
| `onboard`  | `<Onboarding />` |
| `discover` | `<DiscoveryCards />` |
| `matches`  | `<Matches />` |

---

## Features Preserved

- ✅ Swipe animations (left/right/up) with CSS transforms
- ✅ Keyboard arrow-key controls on Discover page
- ✅ PASS / MATCH / SKIP overlay labels during swipe
- ✅ Password strength meter on Register
- ✅ Password match validation
- ✅ Onboarding form validation with shake animation
- ✅ Custom tag input with Enter/Escape handling
- ✅ Match delete with slide-out animation
- ✅ Leaflet country highlight map (DiscoverMap)
- ✅ Leaflet trade curve map (TradeMap)
- ✅ Leaflet partner pins map (MatchesMap)
- ✅ All CSS class names preserved exactly
- ✅ All animations: `slideIn`, `shake`, `removeItem`
>>>>>>> 71c497c25f2ef86e4e99a6e35a035badfc8e2e64
