'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Brain, Zap, Users, BookOpen, BarChart3, Shield, Sparkles,
  ArrowRight, CheckCircle2, Play, Star, GraduationCap, ChevronDown,
  Radio, Trophy, Target, Lightbulb, Lock, Globe, Menu, X
} from 'lucide-react'

const ADMIN_URL   = ''
const TEACHER_URL = ''
const STUDENT_URL = ''

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return
      obs.disconnect()
      let start = 0
      const step = to / 60
      const id = setInterval(() => {
        start = Math.min(start + step, to)
        setVal(Math.floor(start))
        if (start >= to) clearInterval(id)
      }, 16)
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val}{suffix}</span>
}

function RoleCard({ href, gradient, glow, glowBg, icon, title, subtitle, features, btnLabel, featured = false }: {
  href: string; gradient: string; glow: string; glowBg: string; icon: React.ReactNode
  title: string; subtitle: string; features: string[]; btnLabel: string; featured?: boolean
}) {
  return (
    <div className="card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col"
      style={{ background: 'hsl(236 48% 7%)', border: featured ? `1px solid ${glow.replace('0.3','0.5')}` : '1px solid hsl(236 35% 13%)', boxShadow: featured ? `0 0 32px ${glow.replace('0.3','0.12')}` : 'none' }}>
      {featured && (
        <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: gradient }}>Tavsiya</div>
      )}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"
        style={{ background: glowBg.replace('0.08','0.15'), filter: 'blur(24px)' }} />
      <div className="flex items-center gap-3 mb-5 relative">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: gradient, boxShadow: `0 6px 18px ${glow}` }}>{icon}</div>
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-xs" style={{ color: 'hsl(220 15% 52%)' }}>{subtitle}</p>
        </div>
      </div>
      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'hsl(220 15% 65%)' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: glow.replace(' / 0.3','') }} />
            {f}
          </li>
        ))}
      </ul>
      <a href={href} className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
        style={{ background: gradient, boxShadow: `0 4px 16px ${glow}` }}>
        {btnLabel} <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: 'hsl(236 52% 5%)', color: 'hsl(220 20% 95%)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ background: scrolled ? 'hsl(236 52% 5% / 0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid hsl(236 35% 13%)' : '1px solid transparent' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">Edu<span style={{ color: 'hsl(250,85%,70%)' }}>Mind</span></span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'hsl(220 15% 65%)' }}>
            {[{ label: "Imkoniyatlar", href: '#features' }, { label: "Qanday ishlaydi", href: '#how' }, { label: "Statistika", href: '#stats' }, { label: "Kirish", href: '#roles' }].map(l => (
              <a key={l.label} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href={`${STUDENT_URL}/student/login`} className="h-9 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-90" style={{ background: 'hsl(236 42% 12%)', border: '1px solid hsl(236 35% 18%)', color: 'hsl(220 20% 85%)' }}>Kirish</a>
            <a href={`${TEACHER_URL}/teacher/login`} className="h-9 px-4 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))', boxShadow: '0 4px 16px hsl(250 85% 65% / 0.35)' }}>Boshlash</a>
          </div>
          <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'hsl(236 42% 12%)', border: '1px solid hsl(236 35% 18%)' }} onClick={() => setMenuOpen(p => !p)}>
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 pb-5 pt-2 space-y-2" style={{ background: 'hsl(236 52% 5%)', borderBottom: '1px solid hsl(236 35% 13%)' }}>
            {[{ label: "Imkoniyatlar", href: '#features' }, { label: "Qanday ishlaydi", href: '#how' }, { label: "Statistika", href: '#stats' }].map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm" style={{ color: 'hsl(220 15% 65%)' }}>{l.label}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <a href={`${TEACHER_URL}/teacher/login`} className="flex-1 h-10 flex items-center justify-center rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))' }}>Boshlash</a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, hsl(220 20% 95% / 0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute pointer-events-none animate-pulse-glow" style={{ width: 520, height: 520, borderRadius: '50%', top: -120, left: -100, background: 'radial-gradient(circle, hsl(250 85% 65% / 0.12) 0%, transparent 70%)', filter: 'blur(2px)' }} />
        <div className="absolute pointer-events-none animate-pulse-glow" style={{ width: 440, height: 440, borderRadius: '50%', bottom: -80, right: -60, background: 'radial-gradient(circle, hsl(280 75% 65% / 0.10) 0%, transparent 70%)', filter: 'blur(2px)', animationDelay: '1.2s' }} />
        <div className="absolute animate-spin-3d pointer-events-none" style={{ top: '15%', left: '8%', width: 52, height: 52, border: '2px solid hsl(250 85% 65% / 0.35)', borderRadius: 10 }} />
        <div className="absolute animate-spin-3d-alt pointer-events-none" style={{ top: '20%', right: '10%', width: 40, height: 40, border: '2px solid hsl(280 75% 65% / 0.4)', borderRadius: 6, transform: 'rotate(45deg)' }} />
        <div className="absolute animate-float pointer-events-none" style={{ bottom: '25%', left: '12%', width: 32, height: 32, borderRadius: '50%', border: '2px solid hsl(155 60% 55% / 0.4)' }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-medium animate-fade-in"
            style={{ background: 'hsl(250 85% 65% / 0.1)', border: '1px solid hsl(250 85% 65% / 0.25)', color: 'hsl(250 85% 75%)', animationDelay: '0.1s' }}>
            <Sparkles className="w-3.5 h-3.5" /> Anthropic Claude bilan quvvatlangan
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.2s', lineHeight: 1.1 }}>
            <span style={{ color: 'hsl(220 20% 95%)' }}>AI bilan</span>{' '}
            <span style={{ background: 'linear-gradient(135deg, hsl(250,85%,70%), hsl(280,75%,70%))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>kuchaytirilgan</span>
            <br /><span style={{ color: 'hsl(220 20% 95%)' }}>ta&#700;lim platformasi</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-slide-up" style={{ color: 'hsl(220 15% 60%)', lineHeight: 1.7, animationDelay: '0.35s' }}>
            Real-vaqt viktorinalar, AI asosida savollar generatsiyasi va batafsil tahlil — o&#700;qituvchilar va talabalar uchun zamonaviy raqamli ta&#700;lim.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <a href="#roles" className="h-12 px-7 rounded-2xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))', boxShadow: '0 8px 28px hsl(250 85% 65% / 0.4)' }}>
              Boshlash <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how" className="h-12 px-7 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'hsl(236 42% 11%)', border: '1px solid hsl(236 35% 18%)', color: 'hsl(220 20% 85%)' }}>
              <Play className="w-4 h-4" style={{ color: 'hsl(250,85%,70%)' }} /> Qanday ishlaydi
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-in" style={{ color: 'hsl(220 15% 50%)', animationDelay: '0.7s', fontSize: 13 }}>
            {[{ icon: Shield, text: 'Xavfsiz autentifikatsiya' }, { icon: Zap, text: 'Real-vaqt' }, { icon: Globe, text: "O'zbek tiliga mos" }].map(b => (
              <div key={b.text} className="flex items-center gap-1.5"><b.icon className="w-3.5 h-3.5" style={{ color: 'hsl(155,60%,55%)' }} />{b.text}</div>
            ))}
          </div>
        </div>
        <a href="#features" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-float" style={{ color: 'hsl(220 15% 45%)', fontSize: 11 }}>
          <span>Ko&#700;proq</span><ChevronDown className="w-4 h-4" />
        </a>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'hsl(250 85% 65% / 0.1)', border: '1px solid hsl(250 85% 65% / 0.2)', color: 'hsl(250 85% 75%)' }}>
              <Zap className="w-3 h-3" /> Imkoniyatlar
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Platforma nima beradi?</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'hsl(220 15% 55%)' }}>O&#700;qituvchilardan talabalarigacha — har bir qadam avtomatlashtirilgan va real-vaqtda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: 'AI savollar generatsiyasi', desc: 'Dars materialini yuklab bering — Claude AI bir necha soniyada testlar yaratib beradi.', gradient: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))', glow: 'hsl(250 85% 65% / 0.2)' },
              { icon: Radio, title: "Real-vaqt sessiyalar", desc: 'Socket.io orqali sinxron viktorinalar — barcha talabalar bir vaqtda savolga javob beradi.', gradient: 'linear-gradient(135deg, hsl(155,60%,45%), hsl(180,65%,48%))', glow: 'hsl(155 60% 45% / 0.2)' },
              { icon: BarChart3, title: "Batafsil tahlil", desc: "Haftalik sessiyalar, o'rtacha ball, eng yaxshi o'quvchilar — hammasini bir joyda ko'ring.", gradient: 'linear-gradient(135deg, hsl(220,80%,60%), hsl(240,80%,65%))', glow: 'hsl(220 80% 60% / 0.2)' },
              { icon: Target, title: "Bilim kuzatish", desc: "Har bir talabaning har bir mavzu bo'yicha bilim darajasi va dinamikasini kuzating.", gradient: 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))', glow: 'hsl(37 90% 55% / 0.2)' },
              { icon: Trophy, title: "Reyting tizimi", desc: "Sessiya yakunida avtomatik reyting, mukofot tizimi va raqobat muhiti.", gradient: 'linear-gradient(135deg, hsl(45,90%,55%), hsl(37,90%,55%))', glow: 'hsl(45 90% 55% / 0.2)' },
              { icon: Lock, title: "Ko'p rol tizimi", desc: "Admin, O'qituvchi va Talaba rollari — har biri o'z paneli va huquqlari bilan.", gradient: 'linear-gradient(135deg, hsl(0,72%,60%), hsl(340,75%,60%))', glow: 'hsl(0 72% 60% / 0.2)' },
            ].map((f, i) => (
              <div key={f.title} className="card-hover rounded-2xl p-6 relative overflow-hidden" style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)', animationDelay: `${i * 0.08}s` }}>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" style={{ background: f.glow, filter: 'blur(18px)' }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.gradient, boxShadow: `0 4px 14px ${f.glow}` }}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(220 15% 55%)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'hsl(155 60% 45% / 0.1)', border: '1px solid hsl(155 60% 45% / 0.2)', color: 'hsl(155,60%,65%)' }}>
              <Lightbulb className="w-3 h-3" /> Qanday ishlaydi
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">3 qadamda tayyor</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: BookOpen, title: "Dars yarating", desc: "O'qituvchi dars materialini yuklaydi. Mavzular bo'yicha strukturalash avtomatik.", color: 'hsl(250,85%,65%)', bg: 'hsl(250 85% 65% / 0.1)' },
              { step: '02', icon: Brain, title: "AI savollar", desc: "Anthropic Claude material asosida turli qiyinlikdagi savollar va to'g'ri javoblarni yaratadi.", color: 'hsl(280,75%,68%)', bg: 'hsl(280 75% 65% / 0.1)' },
              { step: '03', icon: Users, title: "Sessiya boshlang", desc: "Talabalar kod orqali qo'shiladi, real-vaqtda savol-javob o'tkaziladi, natijalar darhol chiqadi.", color: 'hsl(155,60%,55%)', bg: 'hsl(155 60% 45% / 0.1)' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center text-center animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center" style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
                    <s.icon className="w-10 h-10" style={{ color: s.color }} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: s.color }}>
                    {s.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3">{s.title}</h3>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'hsl(220 15% 55%)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(250 85% 65% / 0.08) 0%, hsl(280 75% 65% / 0.06) 100%)', border: '1px solid hsl(250 85% 65% / 0.2)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, hsl(250 85% 65% / 0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: 200, suffix: '+', label: "Darslar", color: 'hsl(250,85%,70%)' },
                { value: 50,  suffix: '+', label: "O'qituvchilar", color: 'hsl(280,75%,70%)' },
                { value: 1500, suffix: '+', label: "Talabalar", color: 'hsl(155,60%,65%)' },
                { value: 99,  suffix: '%', label: "Ishonchlilik", color: 'hsl(37,90%,65%)' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2" style={{ color: s.color }}>
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm" style={{ color: 'hsl(220 15% 55%)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'hsl(37 90% 58% / 0.1)', border: '1px solid hsl(37 90% 58% / 0.25)', color: 'hsl(37,90%,70%)' }}>
              <Star className="w-3 h-3" /> Rollar bo&#700;yicha kirish
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Siz kim sifatida kirasiz?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleCard href={`${ADMIN_URL}/admin/login`} gradient="linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))" glow="hsl(250 85% 65% / 0.3)" glowBg="hsl(250 85% 65% / 0.08)"
              icon={<Shield className="w-6 h-6 text-white" />} title="Admin" subtitle="Tizim boshqaruvi"
              features={["Foydalanuvchilar boshqaruvi","Tizim sozlamalari","Anthropic API kalit","Umumiy statistika","Barcha sessiyalar"]}
              btnLabel="Admin paneliga kirish" />
            <RoleCard href={`${TEACHER_URL}/teacher/login`} gradient="linear-gradient(135deg, hsl(155,60%,45%), hsl(180,65%,48%))" glow="hsl(155 60% 45% / 0.3)" glowBg="hsl(155 60% 45% / 0.08)"
              icon={<BookOpen className="w-6 h-6 text-white" />} title="O'qituvchi" subtitle="Dars va sessiya boshqaruvi" featured
              features={["Darslar yaratish va tahrirlash","AI savollar generatsiyasi","Sessiya boshqaruvi","Talabalar tahlili","Real-vaqt monitoring"]}
              btnLabel="O'qituvchi paneliga kirish" />
            <RoleCard href={`${STUDENT_URL}/student/login`} gradient="linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))" glow="hsl(37 90% 55% / 0.3)" glowBg="hsl(37 90% 55% / 0.08)"
              icon={<GraduationCap className="w-6 h-6 text-white" />} title="Talaba" subtitle="O'qish va viktorinalar"
              features={["Sessiyalarga qo'shilish","Savollarga javob berish","Reyting va natijalar","Bilim tarixini ko'rish","Shaxsiy tahlil"]}
              btnLabel="Talaba paneliga kirish" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid hsl(236 35% 11%)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))' }}>
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">Edu<span style={{ color: 'hsl(250,85%,70%)' }}>Mind</span></span>
          </div>
          <p className="text-xs text-center" style={{ color: 'hsl(220 15% 40%)' }}>
            © 2025 EduMind. TATU — Axborot texnologiyalari universiteti.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'hsl(220 15% 45%)' }}>
            <a href={`${ADMIN_URL}/admin/login`} className="hover:text-white transition-colors">Admin</a>
            <a href={`${TEACHER_URL}/teacher/login`} className="hover:text-white transition-colors">O&#700;qituvchi</a>
            <a href={`${STUDENT_URL}/student/login`} className="hover:text-white transition-colors">Talaba</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
