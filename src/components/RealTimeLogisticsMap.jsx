import { useState, useEffect, useMemo, useRef } from 'react'

// Demo Active Fleet Logistics Routes
const DEMO_FLEET_ROUTES = [
  {
    id: 'ORD-9021',
    orderNumber: '#ORD-9021',
    driver: {
      name: 'Marcus Thorne',
      rating: '4.9',
      phone: '+251 91 234 5678',
      vehicle: 'Electric Motorbike',
      vehicleIcon: 'two_wheeler',
      avatarBg: 'bg-indigo-100 text-indigo-700',
    },
    brand: { name: 'Verde Kitchen', category: 'Healthy Bowls', color: '#16a34a' },
    pickup: { name: 'Verde Kitchen - Downtown', x: 280, y: 190 },
    destination: { line1: '224 Baker Street, Apt 4B', district: 'Downtown Central', x: 140, y: 340 },
    // Route path coordinates from pickup to destination
    waypoints: [
      { x: 280, y: 190, heading: 225 },
      { x: 235, y: 230, heading: 215 },
      { x: 195, y: 275, heading: 205 },
      { x: 165, y: 310, heading: 190 },
      { x: 140, y: 340, heading: 180 },
    ],
    pathD: 'M 280 190 Q 220 230 195 275 T 140 340',
    status: 'On the way',
    statusVariant: 'blue',
    initialProgress: 0.65,
    etaText: '12 mins',
    speed: '38 km/h',
    distance: '2.4 miles',
  },
  {
    id: 'ORD-8944',
    orderNumber: '#ORD-8944',
    driver: {
      name: 'Sofia Chen',
      rating: '5.0',
      phone: '+251 92 888 1234',
      vehicle: 'Express Scooter',
      vehicleIcon: 'two_wheeler',
      avatarBg: 'bg-teal-100 text-teal-700',
    },
    brand: { name: 'Oishi Sushi', category: 'Japanese Cuisine', color: '#0f172a' },
    pickup: { name: 'Oishi Sushi - Bole', x: 580, y: 220 },
    destination: { line1: 'The Grand Hotel, Lobby', district: 'Bole Commercial', x: 690, y: 260 },
    waypoints: [
      { x: 580, y: 220, heading: 110 },
      { x: 620, y: 235, heading: 105 },
      { x: 655, y: 250, heading: 110 },
      { x: 690, y: 260, heading: 115 },
    ],
    pathD: 'M 580 220 Q 630 235 690 260',
    status: 'Arrived',
    statusVariant: 'green',
    initialProgress: 0.98,
    etaText: 'Arrived',
    speed: '0 km/h (At Venue)',
    distance: '0.1 miles',
  },
  {
    id: 'ORD-9055',
    orderNumber: '#ORD-9055',
    driver: {
      name: 'James Wilson',
      rating: '4.8',
      phone: '+251 93 456 7890',
      vehicle: 'Eco Courier Bike',
      vehicleIcon: 'pedal_bike',
      avatarBg: 'bg-orange-100 text-orange-700',
    },
    brand: { name: 'Burger Theory', category: 'Gourmet Burgers', color: '#ea580c' },
    pickup: { name: 'Burger Theory - Kazanchis', x: 420, y: 150 },
    destination: { line1: '99 Silicon Valley Dr.', district: 'Kazanchis Tech Park', x: 560, y: 80 },
    waypoints: [
      { x: 420, y: 150, heading: 45 },
      { x: 460, y: 125, heading: 40 },
      { x: 510, y: 100, heading: 55 },
      { x: 560, y: 80, heading: 50 },
    ],
    pathD: 'M 420 150 Q 470 115 560 80',
    status: 'Picked up',
    statusVariant: 'muted',
    initialProgress: 0.28,
    etaText: '28 mins',
    speed: '34 km/h',
    distance: '4.1 miles',
  },
  {
    id: 'ORD-9102',
    orderNumber: '#ORD-9102',
    driver: {
      name: 'Dawit Mengistu',
      rating: '4.95',
      phone: '+251 94 112 3344',
      vehicle: 'Fast Fleet Motor',
      vehicleIcon: 'two_wheeler',
      avatarBg: 'bg-emerald-100 text-emerald-700',
    },
    brand: { name: 'Bella Pasta & Grill', category: 'Italian Artisanal', color: '#dc2626' },
    pickup: { name: 'Bella Pasta - Piassa', x: 220, y: 110 },
    destination: { line1: 'Churchill Ave Business Tower', district: 'Piassa Hub', x: 340, y: 160 },
    waypoints: [
      { x: 220, y: 110, heading: 68 },
      { x: 260, y: 128, heading: 65 },
      { x: 300, y: 145, heading: 68 },
      { x: 340, y: 160, heading: 70 },
    ],
    pathD: 'M 220 110 Q 280 135 340 160',
    status: 'On the way',
    statusVariant: 'blue',
    initialProgress: 0.52,
    etaText: '8 mins',
    speed: '42 km/h',
    distance: '1.8 miles',
  },
  {
    id: 'ORD-9140',
    orderNumber: '#ORD-9140',
    driver: {
      name: 'Bethlehem Tefera',
      rating: '4.9',
      phone: '+251 95 667 8899',
      vehicle: 'Courier Scooter',
      vehicleIcon: 'two_wheeler',
      avatarBg: 'bg-purple-100 text-purple-700',
    },
    brand: { name: 'Golden Roast Cafe', category: 'Specialty Coffee', color: '#ca8a04' },
    pickup: { name: 'Golden Roast - Meskel Sq', x: 360, y: 280 },
    destination: { line1: 'Bole Medhanialem Cathedral Rd', district: 'Bole Corridor', x: 540, y: 350 },
    waypoints: [
      { x: 360, y: 280, heading: 115 },
      { x: 410, y: 305, heading: 110 },
      { x: 475, y: 330, heading: 120 },
      { x: 540, y: 350, heading: 115 },
    ],
    pathD: 'M 360 280 Q 450 315 540 350',
    status: 'On the way',
    statusVariant: 'blue',
    initialProgress: 0.40,
    etaText: '15 mins',
    speed: '36 km/h',
    distance: '3.2 miles',
  },
  {
    id: 'ORD-9188',
    orderNumber: '#ORD-9188',
    driver: {
      name: 'Henok Assefa',
      rating: '4.85',
      phone: '+251 91 777 5522',
      vehicle: 'Fleet Van 03',
      vehicleIcon: 'local_shipping',
      avatarBg: 'bg-blue-100 text-blue-700',
    },
    brand: { name: 'Habesha Delight', category: 'Traditional & Fusion', color: '#b45309' },
    pickup: { name: 'Habesha Delight - Sarbet', x: 390, y: 360 },
    destination: { line1: 'Embassy Row Residence #12', district: 'Sarbet Quarters', x: 260, y: 440 },
    waypoints: [
      { x: 390, y: 360, heading: 235 },
      { x: 345, y: 390, heading: 230 },
      { x: 305, y: 415, heading: 240 },
      { x: 260, y: 440, heading: 235 },
    ],
    pathD: 'M 390 360 Q 330 400 260 440',
    status: 'On the way',
    statusVariant: 'blue',
    initialProgress: 0.72,
    etaText: '19 mins',
    speed: '31 km/h',
    distance: '3.7 miles',
  },
  {
    id: 'ORD-9215',
    orderNumber: '#ORD-9215',
    driver: {
      name: 'Meron Kebede',
      rating: '4.92',
      phone: '+251 92 333 4411',
      vehicle: 'Express Motorcycle',
      vehicleIcon: 'two_wheeler',
      avatarBg: 'bg-rose-100 text-rose-700',
    },
    brand: { name: 'Artisan Pastry & Bakery', category: 'Patisserie', color: '#db2777' },
    pickup: { name: 'Artisan Bakery - Old Airport', x: 500, y: 260 },
    destination: { line1: 'Golf Club Residence Villa 4', district: 'Old Airport Residential', x: 620, y: 410 },
    waypoints: [
      { x: 500, y: 260, heading: 140 },
      { x: 535, y: 310, heading: 135 },
      { x: 580, y: 365, heading: 145 },
      { x: 620, y: 410, heading: 140 },
    ],
    pathD: 'M 500 260 Q 550 330 620 410',
    status: 'On the way',
    statusVariant: 'blue',
    initialProgress: 0.82,
    etaText: '5 mins',
    speed: '40 km/h',
    distance: '1.2 miles',
  },
  {
    id: 'ORD-9240',
    orderNumber: '#ORD-9240',
    driver: {
      name: 'Yared Tadesse',
      rating: '4.78',
      phone: '+251 93 999 4433',
      vehicle: 'Urban Scooter',
      vehicleIcon: 'two_wheeler',
      avatarBg: 'bg-amber-100 text-amber-700',
    },
    brand: { name: 'Downtown Grill Club', category: 'Steak & BBQ', color: '#7c2d12' },
    pickup: { name: 'Downtown Grill - Central', x: 290, y: 260 },
    destination: { line1: 'Ras Abebe Aregay Ave #80', district: 'Stadium Corridor', x: 410, y: 230 },
    waypoints: [
      { x: 290, y: 260, heading: 345 },
      { x: 330, y: 250, heading: 340 },
      { x: 370, y: 240, heading: 345 },
      { x: 410, y: 230, heading: 350 },
    ],
    pathD: 'M 290 260 Q 350 245 410 230',
    status: 'Picked up',
    statusVariant: 'muted',
    initialProgress: 0.18,
    etaText: '22 mins',
    speed: '29 km/h',
    distance: '2.9 miles',
  },
]

// Interpolate position along waypoints array given progress (0 to 1)
function interpolateWaypoint(waypoints, progress) {
  if (!waypoints || waypoints.length === 0) return { x: 0, y: 0, heading: 0 }
  if (waypoints.length === 1) return waypoints[0]
  const clamped = Math.max(0, Math.min(1, progress))
  const totalSegments = waypoints.length - 1
  const exactSegment = clamped * totalSegments
  const index = Math.min(Math.floor(exactSegment), totalSegments - 1)
  const segmentProgress = exactSegment - index
  const p1 = waypoints[index]
  const p2 = waypoints[index + 1]

  const x = p1.x + (p2.x - p1.x) * segmentProgress
  const y = p1.y + (p2.y - p1.y) * segmentProgress

  // Angle in degrees between p1 and p2
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  let heading = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  if (heading < 0) heading += 360

  return { x, y, heading }
}

export default function RealTimeLogisticsMap({
  selectedOrderId = null,
  onSelectOrder = null,
  className = '',
}) {
  const [routes, setRoutes] = useState(DEMO_FLEET_ROUTES)
  const [internalActiveRouteId, setInternalActiveRouteId] = useState('ORD-9021')
  const activeRouteId = selectedOrderId || internalActiveRouteId
  const [isSimulating, setIsSimulating] = useState(true)
  const [simulationSpeed, setSimulationSpeed] = useState(1) // 1x, 2x, 5x
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, TRANSIT, ARRIVED, PICKED_UP
  const [showDirectionArrows, setShowDirectionArrows] = useState(true)
  const [showDistrictLabels, setShowDistrictLabels] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  // Real-time GPS movement simulation
  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setRoutes((prevRoutes) =>
        prevRoutes.map((r) => {
          if (r.status === 'Arrived') return r // Arrived stays at destination
          const step = 0.015 * simulationSpeed
          let nextProgress = (r.currentProgress ?? r.initialProgress) + step
          if (nextProgress > 1) {
            nextProgress = 0.05 // loop back around for continuous demo
          }
          return {
            ...r,
            currentProgress: nextProgress,
          }
        })
      )
    }, 600)

    return () => clearInterval(interval)
  }, [isSimulating, simulationSpeed])

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (statusFilter === 'TRANSIT') return r.status === 'On the way'
      if (statusFilter === 'ARRIVED') return r.status === 'Arrived'
      if (statusFilter === 'PICKED_UP') return r.status === 'Picked up'
      return true
    })
  }, [routes, statusFilter])

  // Currently inspected route
  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === activeRouteId) || routes[0]
  }, [routes, activeRouteId])

  const handleSelectRoute = (id) => {
    setInternalActiveRouteId(id)
    if (onSelectOrder) onSelectOrder(id)
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-[24px] border border-slate-800 bg-[#090D16] text-white shadow-2xl transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 rounded-2xl ring-1 ring-emerald-500/30'
          : `h-[520px] ${className}`
      }`}
    >
      {/* Top Map Header & Live HUD Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 bg-[#090D16]/95 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <span className="material-symbols-outlined text-lg">explore</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-white tracking-tight">
                Real-time Fleet Logistics Map
              </h3>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 ring-1 ring-emerald-500/30">
                {routes.length} Active Direction Routes
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live GPS direction arrows, multi-route courier navigation & arrival telemetry
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Pills */}
          <div className="hidden sm:flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                statusFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({routes.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('TRANSIT')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                statusFilter === 'TRANSIT'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              On The Way (5)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ARRIVED')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                statusFilter === 'ARRIVED'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Arrived (1)
            </button>
          </div>

          {/* Green Map Arrow Toggle */}
          <button
            type="button"
            onClick={() => setShowDirectionArrows((v) => !v)}
            title="Toggle Green Direction Arrows along routes"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              showDirectionArrows
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-emerald-400">navigation</span>
            <span className="hidden md:inline">Green Arrows:</span>
            <span className="font-bold">{showDirectionArrows ? 'ON' : 'OFF'}</span>
          </button>

          {/* District Labels Toggle */}
          <button
            type="button"
            onClick={() => setShowDistrictLabels((v) => !v)}
            title="Toggle district labels"
            className={`hidden sm:inline-flex items-center gap-1 rounded-xl border px-2 py-1.5 text-xs font-semibold transition ${
              showDistrictLabels
                ? 'border-slate-700 bg-slate-800/80 text-slate-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined text-xs">label</span>
            <span>Districts</span>
          </button>

          {/* GPS Simulation Toggle */}
          <button
            type="button"
            onClick={() => setIsSimulating((v) => !v)}
            title="Simulate live GPS movement along routes"
            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              isSimulating
                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isSimulating ? 'pause' : 'play_arrow'}
            </span>
            <span className="hidden lg:inline">{isSimulating ? 'Simulating Live GPS' : 'Paused'}</span>
          </button>

          {/* Speed Selector */}
          <button
            type="button"
            onClick={() => setSimulationSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
            title="Cycle simulation speed"
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1.5 text-[11px] font-mono font-bold text-slate-300 hover:text-white"
          >
            {simulationSpeed}x
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Open Presentation Fullscreen'}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport & SVG Routing Canvas */}
      <div className="relative flex-1 overflow-hidden select-none bg-[#070A12]">
        {/* Stylized Dark Cartographic Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 500">
            <defs>
              {/* City Grid Pattern */}
              <pattern id="streetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.6" />
              </pattern>
              {/* Major Roads Pattern */}
              <pattern id="majorGrid" width="160" height="160" patternUnits="userSpaceOnUse">
                <path d="M 160 0 L 0 0 0 160" fill="none" stroke="#334155" strokeWidth="1.2" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#streetGrid)" />
            <rect width="100%" height="100%" fill="url(#majorGrid)" />

            {/* River / Water Canal Curve */}
            <path
              d="M 0 380 Q 250 360 420 420 T 800 460"
              fill="none"
              stroke="#0369a1"
              strokeWidth="24"
              opacity="0.25"
            />
            {/* Expressways */}
            <path
              d="M 60 0 Q 300 180 750 160"
              fill="none"
              stroke="#475569"
              strokeWidth="8"
              opacity="0.3"
            />
            <path
              d="M 120 480 Q 400 300 700 0"
              fill="none"
              stroke="#475569"
              strokeWidth="8"
              opacity="0.3"
            />
            <path
              d="M 380 0 L 380 500"
              fill="none"
              stroke="#334155"
              strokeWidth="6"
              opacity="0.35"
            />
          </svg>
        </div>

        {/* Ambient Map Glow Overlays */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        {/* District Zones & Landmarks */}
        {showDistrictLabels && (
          <div className="pointer-events-none absolute inset-0 text-[10px] font-extrabold uppercase tracking-widest text-slate-500/60">
            <span className="absolute top-12 left-14">Piassa Old Quarter</span>
            <span className="absolute top-10 left-[48%]">Kazanchis Financial Hub</span>
            <span className="absolute top-24 right-16">Bole Commercial District</span>
            <span className="absolute top-[48%] left-24">Downtown Central Square</span>
            <span className="absolute bottom-20 left-32">Sarbet Diplomatic Zone</span>
            <span className="absolute bottom-16 right-28">Old Airport Residential</span>
          </div>
        )}

        {/* Interactive SVG Layer: Routes, Polyline Paths & Direction Arrows */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Emerald glow filter for active route */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Bright Green Map Arrow Marker Def */}
            <marker
              id="greenArrowHead"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
            </marker>

            {/* Neon Green Arrow Marker Def */}
            <marker
              id="neonGreenArrow"
              viewBox="0 0 12 12"
              refX="7"
              refY="6"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path d="M 1 2 L 10 6 L 1 10 L 4 6 z" fill="#22C55E" stroke="#10B981" strokeWidth="1" />
            </marker>

            {/* Cyan Arrow Marker Def */}
            <marker
              id="cyanArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#06B6D4" />
            </marker>
          </defs>

          {/* 1. All Route Polylines */}
          {filteredRoutes.map((route) => {
            const isSelected = route.id === activeRouteId
            return (
              <g
                key={`route-path-${route.id}`}
                onClick={() => handleSelectRoute(route.id)}
                className="cursor-pointer group"
              >
                {/* Wider Invisible Hit Target */}
                <path
                  d={route.pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                />

                {/* Outer route glow */}
                <path
                  d={route.pathD}
                  fill="none"
                  stroke={isSelected ? '#10B981' : '#059669'}
                  strokeWidth={isSelected ? '6' : '3'}
                  strokeOpacity={isSelected ? '0.4' : '0.15'}
                  filter={isSelected ? 'url(#routeGlow)' : undefined}
                />

                {/* Primary Route Line with Dash Effect */}
                <path
                  d={route.pathD}
                  fill="none"
                  stroke={isSelected ? '#34D399' : '#10B981'}
                  strokeWidth={isSelected ? '3' : '2'}
                  strokeDasharray={isSelected ? 'none' : '6 4'}
                  strokeOpacity={isSelected ? '1' : '0.65'}
                  className="transition-all duration-300"
                />

                {/* Intermediate Green Direction Arrows along the polyline path */}
                {showDirectionArrows &&
                  route.waypoints.slice(1, -1).map((wp, wIdx) => (
                    <g
                      key={`arrow-${route.id}-${wIdx}`}
                      transform={`translate(${wp.x}, ${wp.y}) rotate(${wp.heading - 90})`}
                      className="pointer-events-none"
                    >
                      {/* Direction Arrow Symbol (Green Map Arrow) */}
                      <polygon
                        points="-5,-7 7,0 -5,7 -2,0"
                        fill="#22C55E"
                        stroke="#090D16"
                        strokeWidth="1.2"
                        opacity={isSelected ? 1 : 0.85}
                      />
                    </g>
                  ))}
              </g>
            )
          })}

          {/* 2. Restaurant Pickup Points */}
          {filteredRoutes.map((route) => {
            const isSelected = route.id === activeRouteId
            return (
              <g
                key={`pickup-${route.id}`}
                transform={`translate(${route.pickup.x}, ${route.pickup.y})`}
                onClick={() => handleSelectRoute(route.id)}
                className="cursor-pointer group"
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <circle r="16" fill="#F97316" fillOpacity="0.25" className="animate-ping" />
                )}
                <circle
                  r={isSelected ? '10' : '7'}
                  fill="#F97316"
                  stroke="#090D16"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
                <circle r="3" fill="#FFFFFF" />
              </g>
            )
          })}

          {/* 3. Destination Points */}
          {filteredRoutes.map((route) => {
            const isSelected = route.id === activeRouteId
            return (
              <g
                key={`dest-${route.id}`}
                transform={`translate(${route.destination.x}, ${route.destination.y})`}
                onClick={() => handleSelectRoute(route.id)}
                className="cursor-pointer group"
              >
                {/* Destination Beacon */}
                <circle
                  r={isSelected ? '11' : '8'}
                  fill={route.status === 'Arrived' ? '#10B981' : '#3B82F6'}
                  stroke="#090D16"
                  strokeWidth="2.5"
                />
                <circle r="3.5" fill="#FFFFFF" />
              </g>
            )
          })}

          {/* 4. Couriers with PROMINENT GREEN MAP ARROWS & Direction Headings */}
          {filteredRoutes.map((route) => {
            const isSelected = route.id === activeRouteId
            const curProg = route.currentProgress ?? route.initialProgress
            const currentPos = interpolateWaypoint(route.waypoints, curProg)

            return (
              <g
                key={`courier-${route.id}`}
                transform={`translate(${currentPos.x}, ${currentPos.y})`}
                onClick={() => handleSelectRoute(route.id)}
                className="cursor-pointer"
              >
                {/* Pulsing Green Radar Wave Ring */}
                <circle
                  r={isSelected ? '24' : '18'}
                  fill="#10B981"
                  fillOpacity={isSelected ? '0.35' : '0.2'}
                  className="animate-ping"
                />

                {/* Courier Badge Outer Halo */}
                <circle
                  r={isSelected ? '18' : '14'}
                  fill="#064E3B"
                  stroke="#10B981"
                  strokeWidth={isSelected ? '2.5' : '1.8'}
                  filter="url(#routeGlow)"
                />

                {/* Inner Base */}
                <circle r={isSelected ? '13' : '10'} fill="#090D16" />

                {/* THE GREEN DIRECTION ARROW: Rotated to match vehicle direction / heading */}
                {showDirectionArrows && (
                  <g transform={`rotate(${currentPos.heading})`}>
                    {/* Directional navigation pointer (Arrow Cone) */}
                    <path
                      d="M 0 -11 L 6 7 L 0 4 L -6 7 Z"
                      fill="#22C55E"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="drop-shadow-[0_0_8px_rgba(34,197,94,0.9)]"
                    />
                  </g>
                )}

                {/* Center Core Dot if arrows off */}
                {!showDirectionArrows && (
                  <circle r="4" fill="#22C55E" />
                )}

                {/* Selected Float Badge with Driver Name & Green Direction Arrow Icon */}
                {isSelected && (
                  <g transform="translate(0, -32)" className="pointer-events-none">
                    <rect
                      x="-70"
                      y="-12"
                      width="140"
                      height="24"
                      rx="12"
                      fill="#064E3B"
                      stroke="#10B981"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="system-ui"
                    >
                      ➤ {route.driver.name} ({route.etaText})
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>

        {/* Selected Route Info Drawer & Telemetry Card (Bottom Left Overlay) */}
        {activeRoute && (
          <div className="absolute bottom-4 left-4 z-30 max-w-sm rounded-2xl border border-slate-700/80 bg-[#0B1120]/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40">
                  <span
                    className="material-symbols-outlined text-xl text-emerald-400"
                    style={{
                      transform: `rotate(${interpolateWaypoint(
                        activeRoute.waypoints,
                        activeRoute.currentProgress ?? activeRoute.initialProgress
                      ).heading}deg)`,
                      transition: 'transform 0.4s ease',
                    }}
                  >
                    navigation
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {activeRoute.orderNumber}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        activeRoute.status === 'Arrived'
                          ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                      }`}
                    >
                      {activeRoute.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{activeRoute.driver.name}</h4>
                </div>
              </div>
              <span className="text-right">
                <span className="block text-sm font-extrabold text-emerald-400">
                  {activeRoute.etaText}
                </span>
                <span className="text-[10px] text-slate-400">{activeRoute.distance}</span>
              </span>
            </div>

            {/* Route Waypoint Steps */}
            <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                <span className="truncate">
                  <span className="font-semibold text-orange-400">Pickup:</span> {activeRoute.pickup.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">
                  <span className="font-semibold text-emerald-400">Delivery:</span> {activeRoute.destination.line1}
                </span>
              </div>
            </div>

            {/* Vehicle & Telemetry Badges */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-mono text-slate-300">
                <span className="material-symbols-outlined text-sm text-emerald-400">speed</span>
                {activeRoute.speed}
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="material-symbols-outlined text-sm text-[#FF6B35]">
                  {activeRoute.driver.vehicleIcon}
                </span>
                {activeRoute.driver.vehicle}
              </span>
              <a
                href={`tel:${activeRoute.driver.phone}`}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
              >
                <span className="material-symbols-outlined text-xs">call</span>
                Call Driver
              </a>
            </div>
          </div>
        )}

        {/* Map Legend Overlay (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 rounded-xl border border-slate-800/80 bg-[#090D16]/90 p-2.5 text-[11px] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <span className="material-symbols-outlined text-xs">navigation</span>
            </span>
            <span className="text-slate-300 font-semibold">Green Map Direction Arrow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-slate-400">Pickup Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-400">Delivery Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-4 bg-emerald-400" />
            <span className="text-slate-400">Active Live Route</span>
          </div>
        </div>

        {/* Bottom Quick Courier Switcher Ribbon */}
        <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-1.5 rounded-xl border border-slate-800/90 bg-[#090D16]/90 p-1.5 backdrop-blur-md">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Routes:
          </span>
          {filteredRoutes.slice(0, 6).map((r) => {
            const isSelected = r.id === activeRouteId
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectRoute(r.id)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {isSelected ? 'near_me' : 'two_wheeler'}
                </span>
                <span>{r.orderNumber.replace('#ORD-', '#')}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
