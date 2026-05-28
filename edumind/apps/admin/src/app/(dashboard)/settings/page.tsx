import { Settings, Key, Clock } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sozlamalar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Tizim konfiguratsiyasi</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-[6px] border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h2 className="text-sm font-semibold">Savol vaqti (standart)</h2>
          </div>
          <div className="flex gap-2">
            {[15, 30, 60].map((sec) => (
              <button key={sec} className="h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
                {sec} soniya
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[6px] border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h2 className="text-sm font-semibold">Anthropic API kalit</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              defaultValue="sk-ant-••••••••••••"
              className="flex-1 h-9 rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20"
            />
            <button className="h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
              Yangilash
            </button>
          </div>
        </div>

        <div className="rounded-[6px] border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h2 className="text-sm font-semibold">Tizim holati</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
            <span className="text-sm">Barcha tizimlar ishlayapti</span>
          </div>
        </div>
      </div>
    </div>
  )
}
