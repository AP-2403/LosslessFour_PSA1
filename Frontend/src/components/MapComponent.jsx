import { useEffect, useRef, useState } from 'react'

/* ══════════════════════════════════════════
   DISCOVER MAP
   – Single country highlight on the card
══════════════════════════════════════════ */
export function DiscoverMap({ countryName = 'China' }) {
  const mapRef      = useRef(null)
  const instanceRef = useRef(null)
  const geoDataRef  = useRef(null)

  useEffect(() => {
    const L = window.L
    if (!L || !mapRef.current) return

    if (instanceRef.current) {
      instanceRef.current.remove()
      instanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      minZoom: 2,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0,
    }).setView([20, 0], 2)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      noWrap: true,
    }).addTo(map)

    instanceRef.current = map

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
      .then(r => r.json())
      .then(data => {
        geoDataRef.current = data
        highlightCountry(countryName, map, data, L)
      })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const L = window.L
    if (!instanceRef.current || !geoDataRef.current || !L) return
    highlightCountry(countryName, instanceRef.current, geoDataRef.current, L)
  }, [countryName])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '240px', borderRadius: 12, overflow: 'hidden' }}
    />
  )
}

function highlightCountry(name, map, geoData, L) {
  const feature = geoData.features.find(f =>
    f.properties.name.toLowerCase() === name.toLowerCase() ||
    (f.properties.formal_en || '').toLowerCase() === name.toLowerCase()
  )
  if (!feature) return

  if (map._highlightLayer) map.removeLayer(map._highlightLayer)

  const layer = L.geoJSON(feature, {
    style: { fillColor: '#2563EB', weight: 2, color: 'white', fillOpacity: 0.6 },
  }).addTo(map)

  map._highlightLayer = layer
  map.flyToBounds(layer.getBounds(), { padding: [40, 40], duration: 1.5 })
}


/* ══════════════════════════════════════════
   TRADE CURVE MAP
   – Exporter → destinations with curved arcs
══════════════════════════════════════════ */
export function TradeMap({ style = {} }) {
  const mapRef       = useRef(null)
  const instanceRef  = useRef(null)
  const highlightRef = useRef(null)
  const geoDataRef   = useRef(null)
  const exporterRef  = useRef(null)

  const [query, setQuery]       = useState('')
  const [btnLabel, setBtnLabel] = useState('Set Exporter')
  const [btnBg, setBtnBg]       = useState('#2563EB')

  useEffect(() => {
    const L = window.L
    if (!L || !mapRef.current) return

    if (instanceRef.current) {
      instanceRef.current.remove()
      instanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      minZoom: 2,
      worldCopyJump: false,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0,
    }).setView([20, 0], 2)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      noWrap: true,
    }).addTo(map)

    instanceRef.current  = map
    highlightRef.current = L.layerGroup().addTo(map)

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
      .then(r => r.json())
      .then(data => { geoDataRef.current = data })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [])

  const processCountry = () => {
    const L = window.L
    if (!L || !query.trim() || !geoDataRef.current || !instanceRef.current) return

    const feature = geoDataRef.current.features.find(f =>
      f.properties.name.toLowerCase() === query.toLowerCase() ||
      (f.properties.formal_en || '').toLowerCase() === query.toLowerCase()
    )

    if (!feature) {
      alert('Country not found. Try: Brazil, China, Canada')
      return
    }

    const layer = L.geoJSON(feature, {
      style: { fillColor: '#2563EB', weight: 1, opacity: 1, color: 'white', fillOpacity: 0.4 },
    }).addTo(highlightRef.current)

    const bounds = layer.getBounds()
    const center = bounds.getCenter()

    if (!exporterRef.current) {
      exporterRef.current = center
      setBtnLabel('Add Destination')
      setBtnBg('#10B981')
      layer.setStyle({ fillOpacity: 0.7, fillColor: '#1E3A8A' })
    } else {
      drawTradeCurve(exporterRef.current, center, instanceRef.current, L)
    }

    instanceRef.current.flyToBounds(bounds, { padding: [50, 50] })
    setQuery('')
  }

  const drawTradeCurve = (start, end, map, L) => {
    const midLat = (start.lat + end.lat) / 2
    const midLng = (start.lng + end.lng) / 2
    const controlPoint = [midLat + 15, midLng]

    L.curve(
      ['M', [start.lat, start.lng], 'Q', controlPoint, [end.lat, end.lng]],
      { color: '#2563EB', weight: 2, opacity: 0.6, dashArray: '5, 10', fill: false }
    ).addTo(map)
  }

  return (
    <div style={style}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && processCountry()}
          placeholder="Enter Country Name..."
          style={{
            flexGrow: 1, padding: '10px', borderRadius: 8,
            border: '1.5px solid var(--gray-200)', fontFamily: 'DM Sans',
            fontSize: 13, outline: 'none', color: 'var(--navy)',
          }}
        />
        <button
          onClick={processCountry}
          style={{
            background: btnBg, color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: 8, cursor: 'pointer',
            fontWeight: 700, fontFamily: 'DM Sans', fontSize: 13,
            transition: 'background 0.2s',
          }}
        >
          {btnLabel}
        </button>
      </div>

      <div
        ref={mapRef}
        style={{ height: 380, borderRadius: 12, overflow: 'hidden', background: '#f8f9fa' }}
      />
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════
   MATCHES MAP
   – Country highlights + animated trade curves from Home origin
   
   Props:
     partners  array of { name, location, lat, lng, color }
     homeLat   number  – origin latitude  (default: Brazil)
     homeLng   number  – origin longitude (default: Brazil)
══════════════════════════════════════════════════════════════ */

/* ── Point-in-polygon (ray casting) ─────────────────────────
   Works on GeoJSON Polygon and MultiPolygon features.
   Returns true if [lng, lat] is inside the feature's rings.
─────────────────────────────────────────────────────────────*/
function pointInPolygonRings(rings, lng, lat) {
  let inside = false
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]
      const intersect =
        yi > lat !== yj > lat &&
        lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
  }
  return inside
}

function pointInFeature(feature, lng, lat) {
  const geom = feature.geometry
  if (!geom) return false

  if (geom.type === 'Polygon') {
    return pointInPolygonRings(geom.coordinates, lng, lat)
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.some(poly => pointInPolygonRings(poly, lng, lat))
  }
  return false
}

/* ── Hex color → rgba string ────────────────────────────────*/
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function MatchesMap({
  partners = [],
  homeLat  = -14.2,    // Brazil
  homeLng  = -51.9,
  homeCountry = '',
}) {
  const mapRef       = useRef(null)
  const instanceRef  = useRef(null)
  const geoDataRef   = useRef(null)
  const geoLayersRef = useRef([])   // GeoJSON country layers
  const curveLayersRef = useRef([]) // Trade curve layers

  /* ── Build country → partner mapping from GeoJSON ── */
  const buildCountryMap = (geoData, partners) => {
    // Map: featureIndex → { color } for highlighted countries
    const result = []
    partners.forEach(partner => {
      const feature = geoData.features.find(f =>
        pointInFeature(f, partner.lng, partner.lat)
      )
      if (feature) {
        // Avoid duplicates (multiple partners same country → blend first color)
        const exists = result.find(r => r.feature === feature)
        if (!exists) {
          result.push({ feature, color: partner.color || '#3B5BF5' })
        }
      }
    })
    return result
  }

  /* ── Draw all country fills + trade curves ── */
  const renderAll = (map, geoData, partners, L) => {
    // Clear previous layers
    geoLayersRef.current.forEach(l => { try { map.removeLayer(l) } catch (_) {} })
    curveLayersRef.current.forEach(l => { try { map.removeLayer(l) } catch (_) {} })
    geoLayersRef.current   = []
    curveLayersRef.current = []

    if (!partners.length) return

    const countryMatches = buildCountryMap(geoData, partners)

    // 1 ── Render ALL country fills (highlighted + faded world base)
    const allLayer = L.geoJSON(geoData, {
      style: feature => {
        const match = countryMatches.find(c => c.feature === feature)
        if (match) {
          return {
            fillColor: match.color,
            fillOpacity: 0.40,
            color: match.color,
            weight: 1.5,
            opacity: 0.8,
          }
        }
        return {
          fillColor: '#94A3B8',
          fillOpacity: 0.08,
          color: '#CBD5E1',
          weight: 0.3,
        }
      },
      onEachFeature: (feature, layer) => {
        const match = countryMatches.find(c => c.feature === feature)
        if (!match) return

        // Hover brighten
        const baseStyle = {
          fillColor: match.color,
          fillOpacity: 0.40,
          color: match.color,
          weight: 1.5,
        }
        layer.on('mouseover', () => layer.setStyle({ ...baseStyle, fillOpacity: 0.70, weight: 2.5 }))
        layer.on('mouseout',  () => layer.setStyle(baseStyle))

        // Find partner name(s) in this country
        const names = partners
          .filter(p => pointInFeature(feature, p.lng, p.lat))
          .map(p => p.name)
          .join(', ')

        layer.bindTooltip(
          `<div style="font-size:12px;font-weight:700;color:#1e293b">${feature.properties.name}</div>` +
          `<div style="font-size:11px;color:#64748b;margin-top:2px">🤝 ${names}</div>`,
          { sticky: true }
        )
      },
    }).addTo(map)

    geoLayersRef.current.push(allLayer)

    // 2 ── Draw animated dotted curves: Home → each partner
    // determine home coordinates: prefer homeCountry if provided
    let home = [homeLat, homeLng]
    if (homeCountry && geoData) {
      const feature = geoData.features.find(f =>
        (f.properties.name || '').toLowerCase() === (homeCountry || '').toLowerCase() ||
        ((f.properties.formal_en || '').toLowerCase() === (homeCountry || '').toLowerCase())
      )
      if (feature) {
        try {
          const tmpLayer = L.geoJSON(feature)
          const center = tmpLayer.getBounds().getCenter()
          home = [center.lat, center.lng]
        } catch (e) {
          // fallback to defaults
        }
      }
    }

    partners.forEach(partner => {
      if (partner.lat == null || partner.lng == null) return

      const dest = [partner.lat, partner.lng]

      // Arc lift — scale with geographic distance for natural look
      const dLat = dest[0] - home[0]
      const dLng = dest[1] - home[1]
      const dist = Math.sqrt(dLat * dLat + dLng * dLng)
      const lift = Math.min(dist * 0.35, 40)

      const controlPt = [
        (home[0] + dest[0]) / 2 + lift,
        (home[1] + dest[1]) / 2,
      ]

      const curve = L.curve(
        ['M', home, 'Q', controlPt, dest],
        {
          color:     partner.color || '#3B5BF5',
          weight:    2,
          opacity:   0.7,
          dashArray: '6, 10',
          fill:      false,
          animate:   { duration: 2500, iterations: Infinity },
        }
      )
      curve.addTo(map)
      curveLayersRef.current.push(curve)
    })

    // 3 ── Home origin pin (pulse circle)
    const homeMarker = L.circleMarker(home, {
      radius:      8,
      fillColor:   '#1E3A8A',
      fillOpacity: 0.95,
      color:       '#fff',
      weight:      2.5,
    })
      .addTo(map)
      .bindTooltip('<div style="font-size:12px;font-weight:700;color:#1e293b">📍 Your Location</div>', { sticky: true })

    geoLayersRef.current.push(homeMarker)

    // 4 ── Auto-fit to show origin + all destinations
    const allPoints = [home, ...partners.map(p => [p.lat, p.lng])]
    const bounds = L.latLngBounds(allPoints)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 4 })
  }

  /* ── Initial mount ── */
  useEffect(() => {
    const L = window.L
    if (!L || !mapRef.current) return

    if (instanceRef.current) {
      instanceRef.current.remove()
      instanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      minZoom: 1,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([20, -10], 2)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      noWrap: true,
      attribution: '',
    }).addTo(map)

    instanceRef.current = map

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
      .then(r => r.json())
      .then(data => {
        geoDataRef.current = data
        renderAll(map, data, partners, L)
      })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [])

  /* ── Re-render when partners change (e.g. match removed) ── */
  useEffect(() => {
    const L = window.L
    if (!instanceRef.current || !geoDataRef.current || !L) return
    renderAll(instanceRef.current, geoDataRef.current, partners, L)
  }, [partners])
  
  /* ── Re-render when homeCountry changes ── */
  useEffect(() => {
    const L = window.L
    if (!instanceRef.current || !geoDataRef.current || !L) return
    renderAll(instanceRef.current, geoDataRef.current, partners, L)
  }, [homeCountry])

  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
      <div
        ref={mapRef}
        style={{ width: '100%', height: 260, borderRadius: 14, overflow: 'hidden' }}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, zIndex: 500,
        background: 'rgba(255,255,255,0.93)', borderRadius: 9,
        padding: '7px 11px', backdropFilter: 'blur(6px)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.11)', fontSize: 11,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1E3A8A', border: '1.5px solid #fff', flexShrink: 0 }} />
          <span style={{ color: '#1e293b', fontWeight: 600 }}>Your Location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 14, height: 8, borderRadius: 2, background: '#3B5BF5', opacity: 0.55, flexShrink: 0 }} />
          <span style={{ color: '#1e293b', fontWeight: 600 }}>Partner Country</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 2, flexShrink: 0,
            background: 'repeating-linear-gradient(90deg,#3B5BF5 0 5px,transparent 5px 10px)',
          }} />
          <span style={{ color: '#1e293b', fontWeight: 600 }}>Trade Route</span>
        </div>
      </div>
    </div>
  )
}