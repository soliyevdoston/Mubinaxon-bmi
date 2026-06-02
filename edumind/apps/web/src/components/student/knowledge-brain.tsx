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
function masteryGlow(level: number) {
  if (level >= 0.7) return 'hsl(155 60% 55% / 0.6)'
  if (level >= 0.4) return 'hsl(37 90% 58% / 0.5)'
  return 'hsl(0 72% 60% / 0.5)'
}

const ORBIT_SPEEDS = ['25s', '38s', '52s']
const ORBIT_DIRS = ['normal', 'reverse', 'normal'] as const

export function KnowledgeBrain({ points }: { points: KPData[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const ORBITS = [
    { r: 92,  max: 7 },
    { r: 148, max: 10 },
    { r: 200, max: 14 },
  ]
  const SIZE = 440
  const C = SIZE / 2

  type Placed = { kp: KPData; r: number; idx: number; total: number }
  const placed: Placed[] = []
  let rem = [...points]
  ORBITS.forEach((orb) => {
    if (rem.length === 0) return
    const batch = rem.splice(0, orb.max)
    batch.forEach((kp, i) => placed.push({ kp, r: orb.r, idx: i, total: batch.length }))
  })

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE, maxWidth: '100%', aspectRatio: '1' }}>

          {/* Outer ambient glow */}
          <div className="absolute inset-0 pointer-events-none rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(250 85% 65% / 0.1) 0%, transparent 60%)', filter: 'blur(20px)' }} />

          {/* Animated orbit rings */}
          {ORBITS.map((orb, i) => (
            <div key={i} className="absolute rounded-full pointer-events-none"
              style={{
                width: orb.r * 2, height: orb.r * 2,
                top: C - orb.r, left: C - orb.r,
                border: `1px ${i === 2 ? 'dashed' : 'solid'} hsl(250 85% 65% / ${0.18 - i * 0.04})`,
                animation: `spin ${ORBIT_SPEEDS[i]} linear ${ORBIT_DIRS[i]} infinite`,
              }} />
          ))}

          {/* Secondary glow rings (slower) */}
          {ORBITS.slice(0, 2).map((orb, i) => (
            <div key={`glow-${i}`} className="absolute rounded-full pointer-events-none"
              style={{
                width: orb.r * 2 + 4, height: orb.r * 2 + 4,
                top: C - orb.r - 2, left: C - orb.r - 2,
                border: `1px solid hsl(280 75% 65% / 0.06)`,
                filter: 'blur(1px)',
                animation: `spin ${i === 0 ? '70s' : '100s'} linear ${i === 0 ? 'reverse' : 'normal'} infinite`,
              }} />
          ))}

          {/* Knowledge dots */}
          {placed.map(({ kp, r, idx, total }) => {
            const angle = (idx / total) * 2 * Math.PI - Math.PI / 2
            const x = C + Math.cos(angle) * r
            const y = C + Math.sin(angle) * r
            const dotSize = 10 + kp.masteryLevel * 16
            const color = masteryColor(kp.masteryLevel)
            const glowColor = masteryGlow(kp.masteryLevel)
            const isHov = hovered === kp.id
            const isWeak = kp.masteryLevel < 0.4
            const pct = Math.round(kp.masteryLevel * 100)
            const inUpperHalf = y < C

            return (
              <div key={kp.id}
                className="absolute cursor-pointer"
                style={{
                  width: dotSize, height: dotSize,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: isHov
                    ? `0 0 ${dotSize * 3}px ${glowColor}, 0 0 ${dotSize * 5}px ${glowColor.replace('0.6', '0.25')}`
                    : `0 0 ${dotSize * 1.4}px ${glowColor}`,
                  top: y - dotSize / 2,
                  left: x - dotSize / 2,
                  opacity: 0.4 + kp.masteryLevel * 0.6,
                  transform: isHov ? 'scale(1.7)' : 'scale(1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  zIndex: isHov ? 30 : 20,
                  animation: isWeak ? 'pulse-scale 1.8s ease-in-out infinite' : undefined,
                }}
                onMouseEnter={() => setHovered(kp.id)}
                onMouseLeave={() => setHovered(null)}>

                {isHov && (
                  <div className="absolute z-50 pointer-events-none"
                    style={{
                      [inUpperHalf ? 'top' : 'bottom']: dotSize + 12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'hsl(236 52% 8%)',
                      border: `1.5px solid ${color}66`,
                      borderRadius: 12,
                      padding: '10px 14px',
                      whiteSpace: 'nowrap',
                      boxShadow: `0 12px 36px hsl(0 0% 0% / 0.75), 0 0 24px ${glowColor.replace('0.6', '0.15')}`,
                      minWidth: 155,
                    }}>
                    <p className="text-xs font-bold" style={{ color: 'hsl(220 20% 93%)' }}>{kp.topic.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'hsl(220 15% 55%)' }}>{kp.topic.lesson.subject.name}</p>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px]" style={{ color: 'hsl(220 15% 50%)' }}>Daraja</span>
                        <span className="text-[11px] font-black" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(236 42% 12%)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px]" style={{ color: 'hsl(220 15% 50%)' }}>{kp.attemptsCount} urinish</span>
                        <span className="text-[11px] font-semibold" style={{ color }}>{masteryLabel(kp.masteryLevel)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Brain core */}
          <div className="absolute flex items-center justify-center animate-brain-float animate-brain-glow rounded-full"
            style={{
              width: 110, height: 110,
              top: C - 55, left: C - 55,
              background: 'radial-gradient(circle at 32% 32%, hsl(250 85% 74%), hsl(280 75% 56%))',
              zIndex: 10,
              boxShadow: '0 0 50px hsl(250 85% 65% / 0.45), 0 0 100px hsl(280 75% 65% / 0.22)',
            }}>
            <Brain className="text-white" style={{ width: 54, height: 54, filter: 'drop-shadow(0 0 14px hsl(250 85% 88% / 0.9))' }} />
          </div>

          {/* Center label */}
          <div className="absolute pointer-events-none text-center"
            style={{ top: C + 65, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <p className="text-xs font-bold" style={{ color: 'hsl(250,85%,72%)' }}>{points.length} mavzu</p>
          </div>

        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 text-xs" style={{ color: 'hsl(220 15% 55%)' }}>
        {[
          { color: 'hsl(155,60%,55%)', label: '≥70% Yaxshi' },
          { color: 'hsl(37,90%,58%)',  label: '40–70% O\'rtacha' },
          { color: 'hsl(0,72%,60%)',   label: '<40% Mashq' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
