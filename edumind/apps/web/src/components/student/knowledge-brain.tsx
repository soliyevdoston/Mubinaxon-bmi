'use client'
import { Brain } from 'lucide-react'
import { useState } from 'react'

interface KPData {
  id: string
  masteryLevel: number
  attemptsCount: number
  correctCount: number
  topic: { name: string; lesson: { title: string; subject: { name: string } } }
}

function masteryColor(level: number) {
  if (level >= 0.7) return 'hsl(155,60%,55%)'
  if (level >= 0.4) return 'hsl(37,90%,58%)'
  return 'hsl(0,72%,60%)'
}
function masteryLabel(level: number) {
  if (level >= 0.7) return 'Yaxshi'
  if (level >= 0.4) return "O'rtacha"
  return 'Mashq kerak'
}

export function KnowledgeBrain({ points }: { points: KPData[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const ORBITS = [
    { r: 92,  max: 7 },
    { r: 148, max: 10 },
    { r: 200, max: 14 },
  ]
  const SIZE = 440
  const C = SIZE / 2

  // distribute into orbits
  type Placed = { kp: KPData; r: number; idx: number; total: number }
  const placed: Placed[] = []
  let rem = [...points]
  for (const orb of ORBITS) {
    if (rem.length === 0) break
    const batch = rem.splice(0, orb.max)
    batch.forEach((kp, i) => placed.push({ kp, r: orb.r, idx: i, total: batch.length }))
  }

  const mastered  = points.filter(p => p.masteryLevel >= 0.7).length
  const mid       = points.filter(p => p.masteryLevel >= 0.4 && p.masteryLevel < 0.7).length
  const weak      = points.filter(p => p.masteryLevel < 0.4).length

  return (
    <div className="space-y-6">
      {/* summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Yaxshi',     count: mastered, color: 'hsl(155,60%,55%)' },
          { label: "O'rtacha",   count: mid,      color: 'hsl(37,90%,58%)' },
          { label: 'Mashq kerak',count: weak,     color: 'hsl(0,72%,60%)' },
        ].map(s => (
          <div key={s.label} className="rounded-[8px] border border-[hsl(var(--border))] p-3 text-center">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* brain visualization */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE, maxWidth: '100%', aspectRatio: '1' }}>

          {/* ambient glow */}
          <div className="absolute inset-0 pointer-events-none rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(250 85% 65% / 0.12) 0%, transparent 65%)', filter: 'blur(16px)' }} />

          {/* orbit rings */}
          {ORBITS.map((orb, i) => (
            <div key={i} className="absolute rounded-full pointer-events-none"
              style={{
                width: orb.r * 2, height: orb.r * 2,
                top: C - orb.r, left: C - orb.r,
                border: `1px ${i === 2 ? 'dashed' : 'solid'} hsl(250 85% 65% / ${0.14 - i * 0.03})`,
              }} />
          ))}

          {/* knowledge dots */}
          {placed.map(({ kp, r, idx, total }) => {
            const angle = (idx / total) * 2 * Math.PI - Math.PI / 2
            const x = C + Math.cos(angle) * r
            const y = C + Math.sin(angle) * r
            const dotSize = 10 + kp.masteryLevel * 14
            const color = masteryColor(kp.masteryLevel)
            const isHov = hovered === kp.id
            const pct = Math.round(kp.masteryLevel * 100)
            const inUpperHalf = y < C

            return (
              <div key={kp.id}
                className="absolute cursor-pointer"
                style={{
                  width: dotSize, height: dotSize,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 ${isHov ? dotSize * 2.5 : dotSize * 1.2}px ${color}`,
                  top: y - dotSize / 2,
                  left: x - dotSize / 2,
                  opacity: 0.35 + kp.masteryLevel * 0.65,
                  transform: isHov ? 'scale(1.5)' : 'scale(1)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  zIndex: 20,
                }}
                onMouseEnter={() => setHovered(kp.id)}
                onMouseLeave={() => setHovered(null)}>

                {isHov && (
                  <div className="absolute z-50 pointer-events-none"
                    style={{
                      [inUpperHalf ? 'top' : 'bottom']: dotSize + 10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'hsl(236 52% 8%)',
                      border: `1px solid ${color}55`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 8px 24px hsl(0 0% 0% / 0.6)',
                      minWidth: 140,
                    }}>
                    <p className="text-xs font-semibold" style={{ color: 'hsl(220 20% 92%)' }}>{kp.topic.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(220 15% 55%)' }}>{kp.topic.lesson.subject.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                      <span className="text-xs" style={{ color: 'hsl(220 15% 50%)' }}>{kp.attemptsCount} urinish</span>
                      <span className="text-xs font-medium" style={{ color: 'hsl(220 15% 55%)' }}>{masteryLabel(kp.masteryLevel)}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* brain core */}
          <div className="absolute flex items-center justify-center animate-brain-float animate-brain-glow rounded-full"
            style={{
              width: 100, height: 100,
              top: C - 50, left: C - 50,
              background: 'radial-gradient(circle at 35% 35%, hsl(250 85% 72%), hsl(280 75% 58%))',
              zIndex: 10,
            }}>
            <Brain className="w-12 h-12 text-white"
              style={{ filter: 'drop-shadow(0 0 10px hsl(250 85% 80% / 0.9))' }} />
          </div>

          {/* center label */}
          <div className="absolute pointer-events-none text-center"
            style={{ top: C + 58, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <p className="text-xs font-semibold" style={{ color: 'hsl(250,85%,72%)' }}>{points.length} ta mavzu</p>
          </div>

        </div>
      </div>

      {/* legend */}
      <div className="flex items-center justify-center gap-5 text-xs" style={{ color: 'hsl(220 15% 55%)' }}>
        {[
          { color: 'hsl(155,60%,55%)', label: '≥ 70% — Yaxshi' },
          { color: 'hsl(37,90%,58%)',  label: '40–70% — O\'rtacha' },
          { color: 'hsl(0,72%,60%)',   label: '< 40% — Mashq kerak' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
