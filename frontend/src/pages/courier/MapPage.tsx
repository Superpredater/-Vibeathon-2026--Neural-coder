import { useState, useEffect, useRef } from 'react'
import { MapPin, Clock, Package, Navigation } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import clsx from 'clsx'

// Bengaluru lat/lng pairs for demo routes
const ROUTES = [
  {
    id: 'ORD-101',
    customer: 'Customer A',
    status: 'in_transit' as const,
    origin:      { lat: 12.9716, lng: 77.5946, label: 'DS-North Dark Store', area: 'Rajajinagar' },
    destination: { lat: 12.9784, lng: 77.6408, label: '12 MG Road, Bengaluru', area: 'MG Road' },
    items: 3,
  },
  {
    id: 'ORD-102',
    customer: 'Customer B',
    status: 'pending' as const,
    origin:      { lat: 12.9716, lng: 77.5946, label: 'DS-North Dark Store', area: 'Rajajinagar' },
    destination: { lat: 12.9352, lng: 77.6245, label: '45 Park St, Bengaluru', area: 'Koramangala' },
    items: 2,
  },
]

const STATUS_COLOR: Record<string, string> = {
  in_transit: 'bg-sky-50 text-sky-700',
  pending:    'bg-amber-50 text-amber-700',
  delivered:  'bg-emerald-50 text-emerald-700',
}

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Project lat/lng to SVG x/y within a viewBox
function project(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, W: number, H: number) {
  const pad = 60
  const x = pad + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (W - pad * 2)
  const y = pad + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (H - pad * 2)
  return { x, y }
}

// Intermediate waypoints to make the route look like a road path
function buildPath(ox: number, oy: number, dx: number, dy: number) {
  const mx = (ox + dx) / 2
  const my = (oy + dy) / 2
  // slight curve via control point offset
  const cx = mx + (dy - oy) * 0.15
  const cy = my - (dx - ox) * 0.15
  return `M ${ox.toFixed(1)} ${oy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${dx.toFixed(1)} ${dy.toFixed(1)}`
}

// Fake street grid lines for map feel
function StreetGrid({ W, H }: { W: number; H: number }) {
  const lines = []
  for (let x = 40; x < W; x += 55) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#e8edf2" strokeWidth="1" />)
  }
  for (let y = 40; y < H; y += 45) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#e8edf2" strokeWidth="1" />)
  }
  return <>{lines}</>
}

export default function MapPage() {
  const [selected, setSelected] = useState(ROUTES[0])
  const [elapsed, setElapsed] = useState(0)
  const [animPct, setAnimPct] = useState(0)

  const dist = haversine(
    selected.origin.lat, selected.origin.lng,
    selected.destination.lat, selected.destination.lng
  )
  const calcMin = Math.round((dist / 25) * 60) // avg 25 km/h

  // Timer
  useEffect(() => {
    setElapsed(0)
    setAnimPct(0)
    const t = setInterval(() => {
      setElapsed(e => e + 1)
      setAnimPct(p => Math.min(100, p + 100 / (calcMin * 60)))
    }, 1000)
    return () => clearInterval(t)
  }, [selected.id, calcMin])

  const elapsedMin = Math.floor(elapsed / 60)
  const elapsedSec = elapsed % 60
  const remaining  = Math.max(0, calcMin * 60 - elapsed)
  const remMin     = Math.floor(remaining / 60)
  const remSec     = remaining % 60

  // SVG map dimensions
  const W = 600, H = 380

  // Compute bounds with padding
  const lats = [selected.origin.lat, selected.destination.lat]
  const lngs = [selected.origin.lng, selected.destination.lng]
  const latPad = (Math.max(...lats) - Math.min(...lats)) * 0.4 || 0.02
  const lngPad = (Math.max(...lngs) - Math.min(...lngs)) * 0.4 || 0.02
  const bounds = {
    minLat: Math.min(...lats) - latPad,
    maxLat: Math.max(...lats) + latPad,
    minLng: Math.min(...lngs) - lngPad,
    maxLng: Math.max(...lngs) + lngPad,
  }

  const op = project(selected.origin.lat, selected.origin.lng, bounds, W, H)
  const dp = project(selected.destination.lat, selected.destination.lng, bounds, W, H)
  const routePath = buildPath(op.x, op.y, dp.x, dp.y)

  // Animated courier dot position along the quadratic bezier
  const t2 = animPct / 100
  const mx = (op.x + dp.x) / 2
  const my = (op.y + dp.y) / 2
  const cx = mx + (dp.y - op.y) * 0.15
  const cy = my - (dp.x - op.x) * 0.15
  const courierX = (1 - t2) ** 2 * op.x + 2 * (1 - t2) * t2 * cx + t2 ** 2 * dp.x
  const courierY = (1 - t2) ** 2 * op.y + 2 * (1 - t2) * t2 * cy + t2 ** 2 * dp.y

  const pathId = `route-${selected.id}`

  return (
    <DashboardLayout>
      <SectionHeader title="Delivery Map" subtitle="Live route from dark store to customer." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Active Routes</h2>
          {ROUTES.map(r => (
            <button key={r.id} onClick={() => setSelected(r)}
              className={clsx(
                'w-full rounded-2xl border p-4 text-left transition-all duration-150',
                selected.id === r.id
                  ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-slate-700">{r.id}</span>
                <span className={clsx('text-xs font-medium rounded-full px-2 py-0.5', STATUS_COLOR[r.status])}>
                  {r.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900">{r.customer}</p>
              <p className="text-xs text-slate-400 mt-0.5">{r.destination.label}</p>
              <p className="text-xs text-slate-500 mt-1">{r.items} items</p>
            </button>
          ))}

          {/* Route details */}
          <div className="rounded-2xl bg-white shadow-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Route Details</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-brand-500 flex-shrink-0 ring-2 ring-brand-200" />
                <div>
                  <p className="text-xs text-slate-400">Start</p>
                  <p className="text-sm font-medium text-slate-800">{selected.origin.label}</p>
                  <p className="text-xs text-slate-400">{selected.origin.area}</p>
                </div>
              </div>
              <div className="ml-1.5 border-l-2 border-dashed border-slate-200 h-5" />
              <div className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0 ring-2 ring-emerald-200" />
                <div>
                  <p className="text-xs text-slate-400">Destination</p>
                  <p className="text-sm font-medium text-slate-800">{selected.destination.label}</p>
                  <p className="text-xs text-slate-400">{selected.destination.area}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold text-slate-900">{dist.toFixed(1)} km</p>
                <p className="text-xs text-slate-400 mt-0.5">Distance</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold text-slate-900">{calcMin} min</p>
                <p className="text-xs text-slate-400 mt-0.5">Est. Time</p>
              </div>
            </div>

            {/* Live timer */}
            <div className="rounded-xl bg-gradient-to-r from-brand-600 to-indigo-700 p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-brand-200">Elapsed</p>
                  <p className="text-xl font-bold tabular-nums">
                    {String(elapsedMin).padStart(2,'0')}:{String(elapsedSec).padStart(2,'0')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-200">Remaining</p>
                  <p className="text-xl font-bold tabular-nums">
                    {String(remMin).padStart(2,'0')}:{String(remSec).padStart(2,'0')}
                  </p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/20">
                <div className="h-1.5 rounded-full bg-white transition-all duration-1000"
                  style={{ width: `${animPct}%` }} />
              </div>
              <p className="text-xs text-brand-200 mt-1.5">{animPct.toFixed(0)}% of route completed</p>
            </div>
          </div>
        </div>

        {/* SVG Map */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden shadow-card border border-slate-100 bg-[#f8fafc]">
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
              {/* Background */}
              <rect width={W} height={H} fill="#f1f5f9" />

              {/* Street grid */}
              <StreetGrid W={W} H={H} />

              {/* Route shadow */}
              <path d={routePath} fill="none" stroke="#c7d2fe" strokeWidth="8" strokeLinecap="round" />

              {/* Animated route progress */}
              <path
                d={routePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset={1000 - animPct * 10}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />

              {/* Dashed full route */}
              <path d={routePath} fill="none" stroke="#a5b4fc" strokeWidth="2"
                strokeLinecap="round" strokeDasharray="6 5" opacity="0.6" />

              {/* Origin marker */}
              <circle cx={op.x} cy={op.y} r="10" fill="#6366f1" opacity="0.15" />
              <circle cx={op.x} cy={op.y} r="6" fill="#6366f1" stroke="white" strokeWidth="2.5" />
              <rect x={op.x + 10} y={op.y - 18} width={selected.origin.area.length * 6.5 + 12} height={22} rx="6" fill="#1e293b" opacity="0.85" />
              <text x={op.x + 16} y={op.y - 3} fontSize="10" fill="white" fontWeight="600">{selected.origin.area}</text>

              {/* Destination marker */}
              <circle cx={dp.x} cy={dp.y} r="10" fill="#10b981" opacity="0.15" />
              <circle cx={dp.x} cy={dp.y} r="6" fill="#10b981" stroke="white" strokeWidth="2.5" />
              <rect x={dp.x + 10} y={dp.y - 18} width={selected.destination.area.length * 6.5 + 12} height={22} rx="6" fill="#1e293b" opacity="0.85" />
              <text x={dp.x + 16} y={dp.y - 3} fontSize="10" fill="white" fontWeight="600">{selected.destination.area}</text>

              {/* Animated courier dot */}
              {animPct > 0 && animPct < 100 && (
                <g>
                  <circle cx={courierX} cy={courierY} r="12" fill="#6366f1" opacity="0.2" />
                  <circle cx={courierX} cy={courierY} r="7" fill="#6366f1" stroke="white" strokeWidth="2.5" />
                  <text x={courierX} y={courierY + 4} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">🛵</text>
                </g>
              )}

              {/* Distance label on route midpoint */}
              <rect x={cx - 28} y={cy - 14} width={56} height={20} rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" />
              <text x={cx} y={cy + 2} textAnchor="middle" fontSize="10" fill="#6366f1" fontWeight="700">
                {dist.toFixed(1)} km
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-6 text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-brand-500" /> Start (Dark Store)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" /> Destination
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-brand-400 opacity-60" /> Courier
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
