'use client'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts'

interface ChartData {
  date: string
  sessions: number
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'hsl(236 48% 8%)',
        border: '1px solid hsl(250 85% 65% / 0.25)',
        borderRadius: 12,
        padding: '8px 12px',
        boxShadow: '0 8px 24px hsl(250 85% 65% / 0.15)',
      }}>
        <p style={{ fontSize: 11, color: 'hsl(220 10% 55%)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(250 85% 75%)' }}>{payload[0]?.value} sessiya</p>
      </div>
    )
  }
  return null
}

export function DashboardChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(250 85% 68%)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(250 85% 68%)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(236 35% 12%)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(220 10% 48%)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(220 10% 48%)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(250 85% 65% / 0.3)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="sessions"
          stroke="hsl(250 85% 68%)"
          strokeWidth={2}
          fill="url(#sessionGradient)"
          dot={false}
          activeDot={{ r: 4, fill: 'hsl(250 85% 70%)', stroke: 'hsl(236 48% 8%)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
