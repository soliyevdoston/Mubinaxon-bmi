'use client'
import { useState, useTransition } from 'react'
import { setDefaultTime, updateApiKey } from '@/actions/settings'
import { Key, Check, Loader2, Eye, EyeOff } from 'lucide-react'

export function SettingsClient({ defaultTime, savedKey }: { defaultTime: number; savedKey: string | null }) {
  const [activeTime, setActiveTime] = useState(defaultTime)
  const [showKey, setShowKey] = useState(false)
  const [keyMsg, setKeyMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [timePending, startTime] = useTransition()
  const [keyPending, startKey] = useTransition()

  function handleTimeClick(sec: number) {
    setActiveTime(sec)
    startTime(async () => {
      await setDefaultTime(sec)
    })
  }

  async function handleKeySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setKeyMsg(null)
    const fd = new FormData(e.currentTarget)
    startKey(async () => {
      const res = await updateApiKey(fd)
      if (res?.error) {
        setKeyMsg({ type: 'err', text: res.error })
      } else {
        setKeyMsg({ type: 'ok', text: 'API kalit saqlandi' })
        setTimeout(() => setKeyMsg(null), 3000)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Time buttons */}
      <div>
        <div className="flex gap-2">
          {[15, 30, 60].map((sec) => (
            <button
              key={sec}
              onClick={() => handleTimeClick(sec)}
              disabled={timePending}
              className="h-10 px-5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              style={activeTime === sec ? {
                background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))',
                color: 'white',
                boxShadow: '0 4px 16px hsl(250 85% 65% / 0.35)',
              } : {
                background: 'hsl(236 42% 10%)',
                color: 'hsl(var(--muted-foreground))',
                border: '1px solid hsl(236 35% 14%)',
              }}>
              {timePending && activeTime === sec && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {activeTime === sec && !timePending && <Check className="w-3.5 h-3.5" />}
              {sec} soniya
            </button>
          ))}
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
          Hozir tanlangan: <span className="font-semibold text-[hsl(var(--foreground))]">{activeTime} soniya</span>
        </p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid hsl(236 35% 13%)' }} />

      {/* API key */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))' }}>
            <Key className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Anthropic API kalit</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">AI savollar generatsiyasi uchun</p>
          </div>
        </div>

        <form onSubmit={handleKeySubmit} className="space-y-3">
          <div className="relative">
            <input
              name="apiKey"
              type={showKey ? 'text' : 'password'}
              defaultValue={savedKey ?? ''}
              placeholder="sk-ant-..."
              className="w-full h-11 rounded-xl px-4 pr-11 text-sm font-mono outline-none transition-all
                bg-[hsl(var(--input))] border border-[hsl(var(--border))]
                placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary)/0.4)]
                focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
            />
            <button type="button" onClick={() => setShowKey(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {keyMsg && (
            <p className={`text-xs px-3 py-2 rounded-lg ${keyMsg.type === 'ok'
              ? 'text-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.25)]'
              : 'text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)]'
            }`}>
              {keyMsg.text}
            </p>
          )}

          <button type="submit" disabled={keyPending}
            className="h-10 px-5 rounded-xl text-sm font-semibold text-white transition-all
              disabled:opacity-50 disabled:pointer-events-none hover:opacity-90 active:scale-95
              flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))', boxShadow: '0 4px 16px hsl(37 90% 55% / 0.3)' }}>
            {keyPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Saqlash
          </button>
        </form>
      </div>
    </div>
  )
}
