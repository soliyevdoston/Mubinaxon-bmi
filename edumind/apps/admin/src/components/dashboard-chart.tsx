'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  date: string
  sessions: number
}

export function DashboardChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(240 4% 40%)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(240 4% 40%)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ border: '1px solid hsl(240 6% 90%)', borderRadius: '6px', fontSize: 12, boxShadow: 'none' }}
          cursor={{ stroke: 'hsl(240 6% 90%)' }}
        />
        <Line type="monotone" dataKey="sessions" stroke="hsl(240 60% 25%)" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
