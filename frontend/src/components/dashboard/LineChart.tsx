import { useState } from 'react'

interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  color?: string
  gradientFrom?: string
  gradientTo?: string
  height?: number
  formatValue?: (v: number) => string
}

export default function LineChart({
  data,
  color = '#6366f1',
  gradientFrom = 'rgba(99,102,241,0.18)',
  gradientTo = 'rgba(99,102,241,0)',
  height = 220,
  formatValue = (v) => v.toLocaleString(),
}: LineChartProps) {
  const [tooltip, setTooltip] = useState<{ index: number } | null>(null)

  const W = 600
  const H = height
  const PAD = { top: 24, right: 16, bottom: 40, left: 52 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const values = data.map(d => d.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const range = maxV - minV || 1

  const xStep = chartW / (data.length - 1)

  function px(i: number) { return PAD.left + i * xStep }
  function py(v: number) { return PAD.top + chartH - ((v - minV) / range) * chartH }

  const points = data.map((d, i) => `${px(i).toFixed(1)},${py(d.value).toFixed(1)}`)
  const linePath = `M ${points.join(' L ')}`
  const areaPath = `M ${px(0).toFixed(1)},${py(data[0].value).toFixed(1)} L ${points.slice(1).join(' L ')} L ${px(data.length - 1).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L ${px(0).toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`

  const gridCount = 4
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const t = i / gridCount
    return {
      y: PAD.top + chartH - t * chartH,
      label: formatValue(Math.round(minV + t * range)),
    }
  })

  const gradId = `grad-${color.replace(/[^a-z0-9]/gi, '')}`

  const activePoint = tooltip !== null ? data[tooltip.index] : null

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        className="overflow-visible"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={g.y}
              x2={PAD.left + chartW} y2={g.y}
              stroke="#e2e8f0" strokeWidth="1"
              strokeDasharray={i === 0 ? '0' : '4 4'}
            />
            <text
              x={PAD.left - 8} y={g.y + 4}
              textAnchor="end" fontSize="10" fill="#94a3b8"
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* Vertical line at hovered point */}
        {tooltip !== null && (
          <line
            x1={px(tooltip.index)} y1={PAD.top}
            x2={px(tooltip.index)} y2={PAD.top + chartH}
            stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.4"
          />
        )}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots + invisible hover rects */}
        {data.map((d, i) => (
          <g key={i}>
            <rect
              x={px(i) - xStep / 2}
              y={PAD.top}
              width={i === 0 || i === data.length - 1 ? xStep / 2 : xStep}
              height={chartH + 8}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setTooltip({ index: i })}
            />
            <circle
              cx={px(i)} cy={py(d.value)} r={tooltip?.index === i ? 5.5 : 4}
              fill="white"
              stroke={color}
              strokeWidth="2.5"
              style={{ transition: 'r 0.1s' }}
            />
            {/* X-axis label */}
            <text
              x={px(i)} y={PAD.top + chartH + 22}
              textAnchor="middle" fontSize="11" fill="#94a3b8"
            >
              {d.label}
            </text>
          </g>
        ))}

        {/* Tooltip bubble */}
        {tooltip !== null && activePoint && (() => {
          const tx = px(tooltip.index)
          const ty = py(activePoint.value)
          const bw = 90
          const bh = 38
          const bx = Math.min(Math.max(tx - bw / 2, PAD.left), PAD.left + chartW - bw)
          const by = ty - bh - 10
          return (
            <g>
              <rect x={bx} y={by} width={bw} height={bh} rx="8" fill="#1e293b" />
              <polygon
                points={`${tx - 5},${by + bh} ${tx + 5},${by + bh} ${tx},${by + bh + 7}`}
                fill="#1e293b"
              />
              <text x={bx + bw / 2} y={by + 15} textAnchor="middle" fontSize="11" fontWeight="600" fill="white">
                {formatValue(activePoint.value)}
              </text>
              <text x={bx + bw / 2} y={by + 29} textAnchor="middle" fontSize="10" fill="#94a3b8">
                {activePoint.label}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
