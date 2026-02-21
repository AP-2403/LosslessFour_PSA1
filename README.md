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
```

---

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
