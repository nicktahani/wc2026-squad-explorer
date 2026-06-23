// SVG coordinate constants
const W = 400, H = 600
const L = 30, R = 370, T = 30, B = 570
const CX = 200, CY = 300

// Penalty areas (distance from goal line inward)
const PA_W = 220, PA_H = 90
const PA_X = CX - PA_W / 2  // 90

// Goal areas
const GA_W = 86, GA_H = 30
const GA_X = CX - GA_W / 2  // 157

// Goals
const GOAL_W = 60, GOAL_D = 10
const GOAL_X = CX - GOAL_W / 2  // 170

// Penalty spot distance from goal line, center circle / arc radius
const PS_D = 56
const CR = 47

// Penalty arc: intersection x-offset where the arc exits the penalty area
// distance from penalty spot to far edge of penalty area = PA_H - PS_D
const PA_ARC_DX = Math.round(Math.sqrt(CR ** 2 - (PA_H - PS_D) ** 2))  // ≈32

const line = { fill: 'none', stroke: 'rgba(255,255,255,0.8)', strokeWidth: 1.5 }

export default function Pitch() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-label="Football pitch"
    >
      {/* Grass background */}
      <rect width={W} height={H} fill="#2d7a3a" rx={4} />

      {/* Alternating grass stripes */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={i}
          x={L} y={T + i * (B - T) / 9}
          width={R - L} height={(B - T) / 9}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent'}
        />
      ))}

      {/* Pitch outline */}
      <rect x={L} y={T} width={R - L} height={B - T} {...line} />

      {/* Halfway line */}
      <line x1={L} y1={CY} x2={R} y2={CY} {...line} />

      {/* Center circle + spot */}
      <circle cx={CX} cy={CY} r={CR} {...line} />
      <circle cx={CX} cy={CY} r={3} fill="rgba(255,255,255,0.8)" />

      {/* Top penalty area */}
      <rect x={PA_X} y={T} width={PA_W} height={PA_H} {...line} />
      {/* Top goal area */}
      <rect x={GA_X} y={T} width={GA_W} height={GA_H} {...line} />
      {/* Top goal */}
      <rect x={GOAL_X} y={T - GOAL_D} width={GOAL_W} height={GOAL_D} {...line} />
      {/* Top penalty spot */}
      <circle cx={CX} cy={T + PS_D} r={2.5} fill="rgba(255,255,255,0.8)" />
      {/* Top penalty arc (only portion outside penalty area) */}
      <path
        d={`M ${CX - PA_ARC_DX} ${T + PA_H} A ${CR} ${CR} 0 0 1 ${CX + PA_ARC_DX} ${T + PA_H}`}
        {...line}
      />

      {/* Bottom penalty area */}
      <rect x={PA_X} y={B - PA_H} width={PA_W} height={PA_H} {...line} />
      {/* Bottom goal area */}
      <rect x={GA_X} y={B - GA_H} width={GA_W} height={GA_H} {...line} />
      {/* Bottom goal */}
      <rect x={GOAL_X} y={B} width={GOAL_W} height={GOAL_D} {...line} />
      {/* Bottom penalty spot */}
      <circle cx={CX} cy={B - PS_D} r={2.5} fill="rgba(255,255,255,0.8)" />
      {/* Bottom penalty arc (only portion outside penalty area) */}
      <path
        d={`M ${CX - PA_ARC_DX} ${B - PA_H} A ${CR} ${CR} 0 0 0 ${CX + PA_ARC_DX} ${B - PA_H}`}
        {...line}
      />

      {/* Corner arcs */}
      <path d={`M ${L + 6} ${T} A 6 6 0 0 1 ${L} ${T + 6}`} {...line} />
      <path d={`M ${R - 6} ${T} A 6 6 0 0 0 ${R} ${T + 6}`} {...line} />
      <path d={`M ${L} ${B - 6} A 6 6 0 0 1 ${L + 6} ${B}`} {...line} />
      <path d={`M ${R} ${B - 6} A 6 6 0 0 0 ${R - 6} ${B}`} {...line} />
    </svg>
  )
}
