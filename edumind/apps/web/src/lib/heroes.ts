export type HeroClass = 'WARRIOR' | 'WIZARD' | 'SCOUT'
export type SkillType = 'freeze' | 'eliminate' | 'double'

export interface HeroConfig {
  name: string
  emoji: string
  gradient: string
  glowColor: string
  bgColor: string
  borderColor: string
  skill: string
  skillDesc: string
  skillType: SkillType
  description: string
}

export const HEROES: Record<HeroClass, HeroConfig> = {
  WARRIOR: {
    name: 'Jangchi',
    emoji: '⚔️',
    gradient: 'linear-gradient(135deg, hsl(0,75%,52%), hsl(20,85%,58%))',
    glowColor: 'hsl(0 75% 52% / 0.4)',
    bgColor: 'hsl(0 75% 52% / 0.1)',
    borderColor: 'hsl(0 75% 52% / 0.35)',
    skill: 'Vaqt Sovg\'asi',
    skillDesc: 'Timer 20 soniyaga to\'xtatiladi',
    skillType: 'freeze',
    description: 'Bosim ostida sovuqqon. Vaqti oz bo\'lganda timerni muzlatib oladi.',
  },
  WIZARD: {
    name: 'Sehrgar',
    emoji: '🔮',
    gradient: 'linear-gradient(135deg, hsl(265,75%,58%), hsl(285,70%,63%))',
    glowColor: 'hsl(265 75% 58% / 0.4)',
    bgColor: 'hsl(265 75% 58% / 0.1)',
    borderColor: 'hsl(265 75% 58% / 0.35)',
    skill: '50/50',
    skillDesc: '2 ta noto\'g\'ri variant yo\'qoladi',
    skillType: 'eliminate',
    description: 'Bilim sehrgari. Noto\'g\'ri javoblarni yo\'qotib, to\'g\'risini topadi.',
  },
  SCOUT: {
    name: 'Razvedchi',
    emoji: '🏹',
    gradient: 'linear-gradient(135deg, hsl(155,65%,40%), hsl(175,70%,46%))',
    glowColor: 'hsl(155 65% 40% / 0.4)',
    bgColor: 'hsl(155 65% 40% / 0.1)',
    borderColor: 'hsl(155 65% 40% / 0.35)',
    skill: '2× Ball',
    skillDesc: 'Keyingi to\'g\'ri javob ikki barobar ball beradi',
    skillType: 'double',
    description: 'Yuqori risk, yuqori mukofot. Bir zarbada ikki barobar ball.',
  },
}

export const STREAK_BONUS: Record<number, number> = {
  3: 0.25,
  5: 0.5,
  7: 0.75,
}

export function getStreakBonus(streak: number): number {
  if (streak >= 7) return 0.75
  if (streak >= 5) return 0.5
  if (streak >= 3) return 0.25
  return 0
}

export function calcLevel(totalScore: number): number {
  const thresholds = [0, 800, 2000, 4000, 7000, 11000, 16000, 22000, 30000, 40000]
  let level = 1
  for (let i = 0; i < thresholds.length; i++) {
    if (totalScore >= thresholds[i]!) level = i + 1
  }
  return Math.min(level, 10)
}

export function levelProgress(totalScore: number): { level: number; progress: number; nextThreshold: number } {
  const thresholds = [0, 800, 2000, 4000, 7000, 11000, 16000, 22000, 30000, 40000]
  const level = calcLevel(totalScore)
  const currentThreshold = thresholds[level - 1] ?? 0
  const nextThreshold = thresholds[level] ?? 40000
  const progress = Math.min(100, ((totalScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
  return { level, progress, nextThreshold }
}
