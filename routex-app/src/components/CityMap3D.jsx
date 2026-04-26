'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useMutation, useAction, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import 'maplibre-gl/dist/maplibre-gl.css'

// ─── Dark vector tile style using free OpenFreeMap tiles ──────────────────────
const buildDarkStyle = () => ({
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#050810' } },

    {
      id: 'water-fill', type: 'fill',
      source: 'openmaptiles', 'source-layer': 'water',
      paint: { 'fill-color': '#060f1e' },
    },
    {
      id: 'waterway', type: 'line',
      source: 'openmaptiles', 'source-layer': 'waterway',
      paint: { 'line-color': '#071828', 'line-width': 1.5 },
    },
    {
      id: 'landuse', type: 'fill',
      source: 'openmaptiles', 'source-layer': 'landuse',
      paint: { 'fill-color': '#07101a', 'fill-opacity': 0.8 },
    },
    {
      id: 'road-minor', type: 'line',
      source: 'openmaptiles', 'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track', 'path']]],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#0b1628',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.3, 18, 2.5],
      },
    },
    {
      id: 'road-street', type: 'line',
      source: 'openmaptiles', 'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['street', 'tertiary', 'secondary']]],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#0f1e38',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 18, 5],
      },
    },
    {
      id: 'road-major', type: 'line',
      source: 'openmaptiles', 'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['primary', 'motorway', 'trunk']]],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#162040',
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 18, 9],
      },
    },
    {
      id: 'building-3d', type: 'fill-extrusion',
      source: 'openmaptiles', 'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': [
          'interpolate', ['linear'],
          ['coalesce', ['get', 'render_height'], 0],
          0,  '#0c1524',
          15, '#10213a',
          40, '#162d50',
          80, '#1a3260',
        ],
        'fill-extrusion-height':     ['coalesce', ['get', 'render_height'], 8],
        'fill-extrusion-base':       ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.92,
      },
    },
  ],
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const glass = {
  background: 'rgba(7,10,15,0.9)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(0,217,192,0.18)',
  borderRadius: 6,
}
const mono = { fontFamily: "'JetBrains Mono','Fira Mono',monospace" }
const CYAN = '#00d9c0'

// Generate 5 delivery stops within ~600m of the depot
function generateStops(lat, lng) {
  const offsets = [
    [ 0.003,  0.002],
    [-0.004,  0.005],
    [ 0.005, -0.003],
    [-0.002, -0.006],
    [ 0.006,  0.004],
  ]
  return offsets.map(([dlat, dlng], i) => ({
    id: i, lat: lat + dlat, lng: lng + dlng,
  }))
}

// Build a GeoJSON route from depot → stops → depot
function buildRoute(depotLng, depotLat, stops) {
  const coords = [
    [depotLng, depotLat],
    ...stops.map(s => [s.lng, s.lat]),
    [depotLng, depotLat],
  ]
  return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }
}

// ─── Marker HTML factories ────────────────────────────────────────────────────
function createDepotEl() {
  const el = document.createElement('div')
  el.style.cssText = `
    width:22px;height:22px;border-radius:50%;
    background:rgba(0,217,192,0.9);
    border:3px solid white;
    box-shadow:0 0 16px rgba(0,217,192,0.8),0 0 32px rgba(0,217,192,0.4);
    cursor:pointer;animation:depotPulse 2s ease-in-out infinite;
  `
  return el
}

function createStopEl() {
  const el = document.createElement('div')
  el.style.cssText = `
    width:14px;height:14px;border-radius:50%;
    background:rgba(0,217,192,0.75);
    border:2px solid rgba(0,217,192,0.5);
    box-shadow:0 0 10px rgba(0,217,192,0.6);
  `
  return el
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CityMap3D() {
  const mapRef      = useRef(null)
  const containerRef= useRef(null)
  const markersRef  = useRef([])
  const convexMarkersRef = useRef([])  // Markers from Convex data (separate from local stops)

  const [phase,   setPhase]   = useState('prompt')  // prompt | locating | loading | ready | error
  const [coords,  setCoords]  = useState(null)
  const [errMsg,  setErrMsg]  = useState('')
  const [hovBtn,  setHovBtn]  = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hudMessage, setHudMessage] = useState(null)

  // Convex Hooks
  const createDisruption = useMutation(api.disruptions.createDisruption)
  const triggerReroute = useAction(api.reroutePredict.triggerReroute)
  const activeRoutes = useQuery(api.routes.listActiveRoutes)
  const allOrders = useQuery(api.orders.listOrders, {})

  // ── Init map ──────────────────────────────────────────────────────────────
  const initMap = useCallback(async (lat, lng) => {
    setPhase('loading')
    setCoords({ lat, lng })

    const maplibregl = (await import('maplibre-gl')).default
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildDarkStyle(),
      center: [lng, lat],
      zoom: 15.5,
      pitch: 55,
      bearing: -20,
      antialias: true,
      attributionControl: false,
    })

    mapRef.current = map

    // Add minimal attribution
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), 'bottom-right')

    map.on('load', () => {
      const stops = generateStops(lat, lng)

      // ── Route line ──────────────────────────────────────────────────────
      map.addSource('route', {
        type: 'geojson',
        data: buildRoute(lng, lat, stops),
      })

      // Glow halo
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': CYAN,
          'line-width': 10,
          'line-opacity': 0.12,
          'line-blur': 8,
        },
      })

      // Dashed route
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': CYAN,
          'line-width': 1.8,
          'line-opacity': 0.85,
          'line-dasharray': [4, 3],
        },
      })

      // ── Depot marker ────────────────────────────────────────────────────
      const depotEl  = createDepotEl()
      const depotMkr = new maplibregl.Marker({ element: depotEl })
        .setLngLat([lng, lat])
        .addTo(map)
      markersRef.current.push(depotMkr)

      // ── Stop markers ────────────────────────────────────────────────────
      stops.forEach(s => {
        const el  = createStopEl()
        const mkr = new maplibregl.Marker({ element: el })
          .setLngLat([s.lng, s.lat])
          .addTo(map)
        markersRef.current.push(mkr)
      })

      setPhase('ready')
    })
  }, [])

  // ── Request location ───────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrMsg('Geolocation is not supported by your browser.')
      setPhase('error')
      return
    }
    setPhase('locating')
    navigator.geolocation.getCurrentPosition(
      pos => initMap(pos.coords.latitude, pos.coords.longitude),
      err => {
        setErrMsg(
          err.code === 1
            ? 'Location access denied. Please allow location in browser settings.'
            : 'Could not determine your location. Try again.'
        )
        setPhase('error')
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }, [initMap])

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      markersRef.current.forEach(m => m.remove())
      convexMarkersRef.current.forEach(m => m.remove())
      if (mapRef.current) mapRef.current.remove()
    }
  }, [])

  // ── REACTIVE ROUTE RE-RENDER (watches Convex data) ─────────────────────────
  // When activeRoutes or allOrders change (e.g. after A* reroute),
  // rebuild the route line and markers on the map.
  useEffect(() => {
    const map = mapRef.current
    if (!map || phase !== 'ready') return
    if (!activeRoutes || activeRoutes.length === 0 || !allOrders) return

    // Build an order lookup by ID
    const orderMap = {}
    for (const order of allOrders) {
      orderMap[order._id] = order
    }

    // Take the first active route and get coordinates for its stops
    const route = activeRoutes[0]
    const stopCoords = []
    for (const stop of route.stops) {
      const order = orderMap[stop.orderId]
      if (order) {
        stopCoords.push({ lat: order.lat, lng: order.lng, status: stop.status })
      }
    }

    if (stopCoords.length === 0) {
      setHudMessage('Active route has no mapped stops yet.')
      return
    }

    // Hide synthetic boot route once live Convex route is available
    if (map.getLayer('route-line')) map.setLayoutProperty('route-line', 'visibility', 'none')
    if (map.getLayer('route-glow')) map.setLayoutProperty('route-glow', 'visibility', 'none')

    // Build updated GeoJSON from depot (or first stop) -> stops -> back
    const start = coords || stopCoords[0]
    const routeCoords = [
      [start.lng, start.lat],
      ...stopCoords.map(s => [s.lng, s.lat]),
      [start.lng, start.lat],
    ]
    const routeGeoJSON = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: routeCoords },
    }

    // Update existing source if it exists, otherwise add it
    const routeSource = map.getSource('convex-route')
    if (routeSource) {
      routeSource.setData(routeGeoJSON)
    } else {
      map.addSource('convex-route', { type: 'geojson', data: routeGeoJSON })
      map.addLayer({
        id: 'convex-route-glow', type: 'line', source: 'convex-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff6b35', 'line-width': 8, 'line-opacity': 0.15, 'line-blur': 6 },
      })
      map.addLayer({
        id: 'convex-route-line', type: 'line', source: 'convex-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff6b35', 'line-width': 2.5, 'line-opacity': 0.9, 'line-dasharray': [2, 2] },
      })
    }

    // Clear previous Convex markers and add new ones
    convexMarkersRef.current.forEach(m => m.remove())
    convexMarkersRef.current = []

    // Dynamically import maplibre for markers
    import('maplibre-gl').then(({ default: maplibregl }) => {
      stopCoords.forEach((s) => {
        const el = document.createElement('div')
        const markerColor = s.status === 'completed' ? 'rgba(16,185,129,0.9)' : s.status === 'failed' ? 'rgba(244,63,94,0.95)' : 'rgba(255,107,53,0.85)'
        const markerBorder = s.status === 'completed' ? 'rgba(16,185,129,0.5)' : s.status === 'failed' ? 'rgba(244,63,94,0.5)' : 'rgba(255,107,53,0.5)'
        const markerGlow = s.status === 'completed' ? 'rgba(16,185,129,0.6)' : s.status === 'failed' ? 'rgba(244,63,94,0.7)' : 'rgba(255,107,53,0.6)'
        el.style.cssText = `
          width:12px;height:12px;border-radius:50%;
          background:${markerColor};
          border:2px solid ${markerBorder};
          box-shadow:0 0 10px ${markerGlow};
        `
        const mkr = new maplibregl.Marker({ element: el })
          .setLngLat([s.lng, s.lat])
          .addTo(map)
        convexMarkersRef.current.push(mkr)
      })
    })
  }, [activeRoutes, allOrders, phase, coords])

  // ── Camera reset ───────────────────────────────────────────────────────────
  const resetCamera = useCallback(() => {
    if (!mapRef.current || !coords) return
    mapRef.current.easeTo({ center: [coords.lng, coords.lat], zoom: 15.5, pitch: 55, bearing: -20, duration: 1200 })
  }, [coords])

  // ── Recenter on location ──────────────────────────────────────────────────
  const recenter = useCallback(() => {
    if (!mapRef.current || !coords) return
    mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 16, duration: 1000 })
  }, [coords])

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleDisruption = async (type) => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      await createDisruption({
        type,
        description: `Manual ${type} trigger at dashboard node`,
        lat: coords?.lat,
        lng: coords?.lng,
        priority: 'high'
      })
      alert(`Traffic event logged: ${type.toUpperCase()}`)
      setHudMessage(`Disruption logged: ${type}`)
    } catch (err) {
      console.error(err)
      setHudMessage('Failed to log disruption.')
    } finally {
      setTimeout(() => setHudMessage(null), 2500)
      setIsProcessing(false)
    }
  }

  const handleReroute = async () => {
    if (isProcessing || !activeRoutes?.[0]) {
      if (!activeRoutes?.[0]) alert("No active routes found to re-optimize.")
      return
    }
    setIsProcessing(true)
    try {
      const res = await triggerReroute({ routeId: activeRoutes[0]._id })
      if (res.success) {
        alert(`Route sequencing complete (heuristic). Logged in ${res.computationTimeMs}ms.`)
        setHudMessage(`Sequencing complete in ${res.computationTimeMs}ms.`)
      } else {
        setHudMessage(res.message || 'Reroute did not complete.')
      }
    } catch (err) {
      console.error(err)
      setHudMessage('Reroute failed.')
    } finally {
      setTimeout(() => setHudMessage(null), 2500)
      setIsProcessing(false)
    }
  }

  // ─── Pill button style ────────────────────────────────────────────────────
  const pillStyle = (id, hoverColor = 'rgba(0,217,192,0.55)') => ({
    ...glass,
    padding: '7px 14px',
    fontSize: 11, fontWeight: 600,
    color: hovBtn === id ? '#fff' : 'rgba(255,255,255,0.55)',
    cursor: isProcessing ? 'wait' : 'pointer',
    transition: 'all 0.2s',
    borderColor: hovBtn === id ? hoverColor : 'rgba(255,255,255,0.07)',
    boxShadow: hovBtn === id ? `0 0 12px ${hoverColor}` : 'none',
    whiteSpace: 'nowrap', userSelect: 'none',
    display: 'flex', alignItems: 'center', gap: 5,
    opacity: isProcessing ? 0.5 : 1,
  })

  const iconBtn = (id) => ({
    ...glass,
    width: 34, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 14,
    borderColor: hovBtn === id ? 'rgba(0,217,192,0.6)' : 'rgba(255,255,255,0.07)',
    boxShadow: hovBtn === id ? '0 0 12px rgba(0,217,192,0.35)' : 'none',
    transition: 'all 0.2s',
  })

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 520, background: '#050810', overflow: 'hidden' }}>

      {/* Animation keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes depotPulse {
          0%,100% { box-shadow:0 0 16px rgba(0,217,192,0.8),0 0 32px rgba(0,217,192,0.4); transform:scale(1); }
          50%      { box-shadow:0 0 24px rgba(0,217,192,1),0 0 48px rgba(0,217,192,0.6);   transform:scale(1.15); }
        }
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .maplibregl-ctrl-attrib { background:rgba(5,8,16,0.8)!important; color:rgba(255,255,255,0.3)!important; font-size:9px!important; }
        .maplibregl-ctrl-attrib a { color:rgba(0,217,192,0.5)!important; }
        .maplibregl-ctrl-group { background:rgba(7,10,15,0.9)!important; border:1px solid rgba(0,217,192,0.18)!important; border-radius:6px!important; }
        .maplibregl-ctrl-group button { background:transparent!important; color:rgba(255,255,255,0.6)!important; }
        .maplibregl-ctrl-group button:hover { background:rgba(0,217,192,0.1)!important; }
      `}</style>

      {/* ── Map canvas (hidden until ready) ─────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, opacity: phase === 'ready' ? 1 : 0, transition: 'opacity 0.6s ease' }}
      />

      {/* ─── PROMPT SCREEN ─────────────────────────────────────────────── */}
      {(phase === 'prompt' || phase === 'locating' || phase === 'error') && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 24,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(0,80,70,0.15) 0%, #050810 70%)',
          animation: 'fadein 0.4s ease',
        }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(0,217,192,0.06)',
            border: '1px solid rgba(0,217,192,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
            boxShadow: '0 0 40px rgba(0,217,192,0.1)',
          }}>
            {phase === 'error' ? '⚠' : '🗺'}
          </div>

          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <h3 style={{ ...mono, color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.04em' }}>
              {phase === 'error' ? 'Location Error' : 'Live City Map'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              {phase === 'error'
                ? errMsg
                : phase === 'locating'
                  ? 'Acquiring GPS signal...'
                  : 'Allow location access to render a real-time 3D map of your city with live routing.'}
            </p>
          </div>

          {phase === 'locating' ? (
            <div style={{
              width: 36, height: 36,
              border: '2px solid rgba(0,217,192,0.15)',
              borderTop: '2px solid #00d9c0',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          ) : (
            <button
              onClick={phase === 'error' ? () => setPhase('prompt') : requestLocation}
              style={{
                ...glass,
                padding: '12px 28px',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                color: CYAN, cursor: 'pointer',
                borderColor: 'rgba(0,217,192,0.4)',
                boxShadow: '0 0 20px rgba(0,217,192,0.15)',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,217,192,0.3)'; e.currentTarget.style.borderColor = 'rgba(0,217,192,0.7)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(0,217,192,0.15)'; e.currentTarget.style.borderColor = 'rgba(0,217,192,0.4)' }}
            >
              {phase === 'error' ? '↩ Try Again' : '📍 Enable Location'}
            </button>
          )}
        </div>
      )}

      {/* ─── LOADING OVERLAY ─────────────────────────────────────────────── */}
      {phase === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#050810', flexDirection: 'column', gap: 16,
        }}>
          <div style={{
            width: 44, height: 44,
            border: '2px solid rgba(0,217,192,0.12)',
            borderTop: '2px solid #00d9c0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ ...mono, color: CYAN, fontSize: 11, letterSpacing: '0.14em', opacity: 0.7 }}>
            LOADING CITY TILES...
          </p>
        </div>
      )}

      {/* ─── READY: HUD OVERLAYS ─────────────────────────────────────────── */}
      {phase === 'ready' && (
        <>
          {hudMessage && (
            <div style={{
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              ...glass,
              padding: '8px 14px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              zIndex: 12,
            }}>
              {hudMessage}
            </div>
          )}
          {/* Top-left chips */}
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, pointerEvents: 'none', animation: 'fadein 0.5s ease' }}>
            {[
              { label: 'LAT',   value: coords ? coords.lat.toFixed(4) : '—' },
              { label: 'LONG',  value: coords ? coords.lng.toFixed(4) : '—' },
              { label: 'VECTORS', value: activeRoutes?.length ? `${activeRoutes.length} Active` : 'Scanning...' },
              { label: 'STATUS', value: 'GRID ONLINE' },
            ].map(({ label, value }) => (
              <div key={label} style={{ ...glass, ...mono, padding: '5px 10px', minWidth: 88 }}>
                <div style={{ fontSize: 8, color: 'rgba(0,217,192,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: CYAN, fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Top-right icon buttons */}
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', flexDirection: 'column', gap: 6, animation: 'fadein 0.5s ease' }}>
            {[
              { id: 'b3d',  icon: '⬛', label: '3D Buildings', action: () => {} },
              { id: 'sat',  icon: '🛰', label: 'Satellite',    action: recenter },
              { id: 'rst',  icon: '⟲',  label: 'Reset Camera', action: resetCamera },
            ].map(({ id, icon, label, action }) => (
              <button key={id} title={label} style={iconBtn(id)}
                onMouseEnter={() => setHovBtn(id)} onMouseLeave={() => setHovBtn(null)}
                onClick={action}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
              </button>
            ))}
          </div>

          {/* Bottom pill buttons */}
          <div style={{
            position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 7, animation: 'fadein 0.5s ease',
          }}>
            {[
              { id: 'blk', label: '🚧 Block Road',  color: 'rgba(0,217,192,0.55)', action: () => handleDisruption('blocked-road') },
              { id: 'urg', label: '⚡ Urgent Order', color: 'rgba(255,210,50,0.55)', action: () => handleDisruption('urgent-order') },
              { id: 'dis', label: '🌧 Disruption',   color: 'rgba(255,70,70,0.55)',  action: () => handleDisruption('traffic') },
              { id: 'rer', label: '🔄 Route Sequencing',    color: 'rgba(0,217,192,0.55)', action: handleReroute },
            ].map(({ id, label, color, action }) => (
              <button key={id} style={pillStyle(id, color)}
                onMouseEnter={() => setHovBtn(id)} onMouseLeave={() => setHovBtn(null)}
                onClick={action} disabled={isProcessing}>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
