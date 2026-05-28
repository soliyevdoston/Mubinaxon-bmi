import { Settings, Clock, Database, Users, BookOpen, Radio, CheckCircle2 } from 'lucide-react'
import { getDefaultTime, getSystemStats, getConfig } from '@/actions/admin/settings'
import { SettingsClient } from './settings-client'

export default async function AdminSettingsPage() {
  const [defaultTime, stats, savedKey] = await Promise.all([
    getDefaultTime(),
    getSystemStats(),
    getConfig('anthropicApiKey'),
  ])

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sozlamalar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Tizim konfiguratsiyasi</p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))' }}>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Standart savol vaqti</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Har bir savol uchun ajratilgan vaqt</p>
          </div>
        </div>
        <SettingsClient defaultTime={defaultTime} savedKey={savedKey} />
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(155,60%,45%), hsl(180,65%,48%))' }}>
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Tizim holati</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Hozirgi statistika</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl"
          style={{ background: 'hsl(155 60% 45% / 0.1)', border: '1px solid hsl(155 60% 45% / 0.25)' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(155,60%,55%)' }} />
          <span className="text-sm font-medium" style={{ color: 'hsl(155,60%,55%)' }}>Barcha tizimlar ishlayapti</span>
          <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(155,60%,55%)' }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Foydalanuvchilar', value: stats.userCount, icon: Users, color: 'hsl(250,85%,65%)' },
            { label: 'Darslar', value: stats.lessonCount, icon: BookOpen, color: 'hsl(220,85%,65%)' },
            { label: 'Jami sessiyalar', value: stats.sessionCount, icon: Database, color: 'hsl(280,75%,65%)' },
            { label: 'Faol sessiyalar', value: stats.activeCount, icon: Radio, color: 'hsl(155,60%,55%)' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'hsl(236 42% 9%)', border: '1px solid hsl(236 35% 12%)' }}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: s.color }} />
                <div>
                  <p className="text-lg font-bold tracking-tight">{s.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
