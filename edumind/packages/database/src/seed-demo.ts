/**
 * Demo data seed — tekshiruvchi uchun tayyor ma'lumotlar
 * Ishga tushirish: pnpm --filter @edumind/database seed:demo
 */
import { prisma } from './index'
import bcrypt from 'bcryptjs'

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(d: number) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000)
}

async function main() {
  console.log('🌱 Demo seed boshlandi...')

  // ─── PAROLLAR ─────────────────────────────────────────────────────────────
  const [adminHash, teacherHash, studentHash] = await Promise.all([
    bcrypt.hash('admin123', 12),
    bcrypt.hash('teacher123', 12),
    bcrypt.hash('student123', 12),
  ])

  // ─── FOYDALANUVCHILAR ──────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edumind.uz' },
    update: { passwordHash: adminHash },
    create: { email: 'admin@edumind.uz', passwordHash: adminHash, fullName: 'Tizim Administratori', role: 'ADMIN' },
  })

  const t1 = await prisma.user.upsert({
    where: { email: 'sardor.xasanov@edumind.uz' },
    update: { passwordHash: teacherHash },
    create: { email: 'sardor.xasanov@edumind.uz', passwordHash: teacherHash, fullName: 'Sardor Xasanov', role: 'TEACHER' },
  })

  const t2 = await prisma.user.upsert({
    where: { email: 'nilufar.toshmatova@edumind.uz' },
    update: { passwordHash: teacherHash },
    create: { email: 'nilufar.toshmatova@edumind.uz', passwordHash: teacherHash, fullName: 'Nilufar Toshmatova', role: 'TEACHER' },
  })

  const t3 = await prisma.user.upsert({
    where: { email: 'bobur.rahimov@edumind.uz' },
    update: { passwordHash: teacherHash },
    create: { email: 'bobur.rahimov@edumind.uz', passwordHash: teacherHash, fullName: 'Bobur Rahimov', role: 'TEACHER' },
  })

  const studentData = [
    { email: 'akmal.yusupov@edumind.uz',    fullName: 'Akmal Yusupov' },
    { email: 'madina.karimova@edumind.uz',   fullName: 'Madina Karimova' },
    { email: 'jasur.razzaqov@edumind.uz',    fullName: 'Jasur Razzaqov' },
    { email: 'zulfiya.mirzayeva@edumind.uz', fullName: 'Zulfiya Mirzayeva' },
    { email: 'sherzod.aliyev@edumind.uz',    fullName: 'Sherzod Aliyev' },
    { email: 'mohira.nazarova@edumind.uz',   fullName: 'Mohira Nazarova' },
    { email: 'dilshod.tursunov@edumind.uz',  fullName: 'Dilshod Tursunov' },
    { email: 'feruza.qosimova@edumind.uz',   fullName: 'Feruza Qosimova' },
  ]
  const students = await Promise.all(
    studentData.map(s =>
      prisma.user.upsert({
        where: { email: s.email },
        update: { passwordHash: studentHash },
        create: { email: s.email, passwordHash: studentHash, fullName: s.fullName, role: 'STUDENT' },
      })
    )
  )

  // ─── FANLAR ───────────────────────────────────────────────────────────────
  const subjectList = [
    { name: 'Matematika',  slug: 'matematika',  description: 'Algebra, geometriya, analiz' },
    { name: 'Fizika',      slug: 'fizika',      description: 'Mexanika, termodinamika, elektr' },
    { name: 'Informatika', slug: 'informatika', description: 'Dasturlash, algoritmlar, tarmoqlar' },
    { name: 'Kimyo',       slug: 'kimyo',       description: 'Organik va noorganik kimyo' },
    { name: 'Biologiya',   slug: 'biologiya',   description: 'Hujayra, genetika, ekologiya' },
    { name: 'Tarix',       slug: 'tarix',       description: "O'zbekiston va jahon tarixi" },
  ]
  const subjects = await Promise.all(
    subjectList.map(s =>
      prisma.subject.upsert({
        where: { slug: s.slug },
        update: {},
        create: s,
      })
    )
  )
  const [math, physics, cs, , , history] = subjects

  // ─── DARSLAR VA SAVOLLAR ───────────────────────────────────────────────────

  // --- DARS 1: Algebra (Sardor o'qituvchi) ---
  const lesson1 = await prisma.lesson.upsert({
    where: { id: (await prisma.lesson.findFirst({ where: { title: 'Algebra: Chiziqli tenglamalar', authorId: t1.id } }))?.id ?? 'new-1' },
    update: { isPublished: true },
    create: {
      title: 'Algebra: Chiziqli tenglamalar',
      description: "Bitta va ikki o'zgaruvchili chiziqli tenglamalar",
      authorId: t1.id,
      subjectId: math!.id,
      isPublished: true,
      rawContent: 'Chiziqli tenglama: ax + b = 0. Yechim: x = -b/a',
    },
  })

  const l1topics = await ensureTopics(lesson1.id, [
    { name: "Bitta o'zgaruvchili tenglamalar", description: 'ax + b = 0', orderIndex: 0 },
    { name: 'Tenglamalar sistemasi',           description: 'Ikki tenglamali sistema', orderIndex: 1 },
  ])

  await ensureQuestions(lesson1.id, [
    { text: '2x + 6 = 0 tenglamasining yechimi?', options: ['x = 3','x = -3','x = 2','x = -2'], correctIndex: 1, difficulty: 2, explanation: 'x = -6/2 = -3', topicId: l1topics[0]!.id },
    { text: '5x - 15 = 0 bo\'lsa x = ?',          options: ['x = 5','x = -5','x = 3','x = -3'], correctIndex: 2, difficulty: 2, explanation: 'x = 15/5 = 3',   topicId: l1topics[0]!.id },
    { text: 'x + y = 7 va x - y = 3 bo\'lsa x = ?', options: ['x = 4','x = 5','x = 3','x = 6'], correctIndex: 1, difficulty: 4, explanation: '2x=10, x=5',    topicId: l1topics[1]!.id },
    { text: 'ax + b = 0 da a = 0, b ≠ 0 bo\'lsa?', options: ['x = 0','x = ∞','Yechim yo\'q','x = b'], correctIndex: 2, difficulty: 4, explanation: '0·x = -b mumkin emas', topicId: l1topics[0]!.id },
    { text: '3x + 2y = 12 va x = 2 bo\'lsa y = ?', options: ['y = 3','y = 4','y = 6','y = 2'], correctIndex: 0, difficulty: 3, explanation: '6 + 2y = 12, y = 3', topicId: l1topics[1]!.id },
  ])

  // --- DARS 2: Nyuton qonunlari (Nilufar o'qituvchi) ---
  const lesson2 = await prisma.lesson.upsert({
    where: { id: (await prisma.lesson.findFirst({ where: { title: 'Mexanika: Nyuton qonunlari', authorId: t2.id } }))?.id ?? 'new-2' },
    update: { isPublished: true },
    create: {
      title: 'Mexanika: Nyuton qonunlari',
      description: "Nyutonning uchta mexanika qonuni",
      authorId: t2.id,
      subjectId: physics!.id,
      isPublished: true,
      rawContent: 'F = ma. Nyuton II qonuni. Kuch, massa, tezlanish.',
    },
  })

  const l2topics = await ensureTopics(lesson2.id, [
    { name: 'Nyuton qonunlari', description: 'I, II, III qonunlar', orderIndex: 0 },
    { name: 'Kuch va harakat',  description: 'Kuch formulalari',    orderIndex: 1 },
  ])

  await ensureQuestions(lesson2.id, [
    { text: 'F = ?',                                   options: ['m/a','ma','a/m','m+a'],         correctIndex: 1, difficulty: 1, explanation: 'Nyuton II qonuni: F = ma', topicId: l2topics[0]!.id },
    { text: 'm=2kg, F=10N bo\'lsa a=?',                options: ['2','5','8','20'],                correctIndex: 1, difficulty: 2, explanation: 'a = F/m = 10/2 = 5 m/s²', topicId: l2topics[1]!.id },
    { text: 'Inersiya qonuni — Nyutonning nechinchi qonuni?', options: ['I','II','III','IV'],       correctIndex: 0, difficulty: 1, explanation: 'I qonun inersiya qonuni', topicId: l2topics[0]!.id },
    { text: 'Agar F1 = 20N bo\'lsa, F2 = ?',           options: ['-20N','20N','10N','-10N'],       correctIndex: 0, difficulty: 3, explanation: 'III qonun: F1 = -F2',    topicId: l2topics[0]!.id },
    { text: 'm=5kg, a=4m/s² bo\'lsa kuch F=?',         options: ['1.25N','9N','20N','25N'],        correctIndex: 2, difficulty: 2, explanation: 'F = 5×4 = 20 N',          topicId: l2topics[1]!.id },
    { text: 'Kuch birligi SI da?',                     options: ['kg','m/s','N','Pa'],             correctIndex: 2, difficulty: 1, explanation: 'Nyuton (N)',               topicId: l2topics[1]!.id },
  ])

  // --- DARS 3: Python asoslari (Bobur o'qituvchi) ---
  const lesson3 = await prisma.lesson.upsert({
    where: { id: (await prisma.lesson.findFirst({ where: { title: 'Python: Asosiy tushunchalar', authorId: t3.id } }))?.id ?? 'new-3' },
    update: { isPublished: true },
    create: {
      title: 'Python: Asosiy tushunchalar',
      description: 'O\'zgaruvchilar, sikllar, funksiyalar',
      authorId: t3.id,
      subjectId: cs!.id,
      isPublished: true,
      rawContent: 'Python — yuqori darajali dasturlash tili. print(), for, while, def.',
    },
  })

  const l3topics = await ensureTopics(lesson3.id, [
    { name: "O'zgaruvchilar va turlar", description: 'int, str, float, bool', orderIndex: 0 },
    { name: 'Sikllar',                 description: 'for, while',            orderIndex: 1 },
    { name: 'Funksiyalar',             description: 'def, return',            orderIndex: 2 },
  ])

  await ensureQuestions(lesson3.id, [
    { text: 'Python da chop etish uchun qaysi funksiya?', options: ['echo','print','write','show'],      correctIndex: 1, difficulty: 1, explanation: 'print() funksiyasi',     topicId: l3topics[0]!.id },
    { text: "x = '5' — x ning turi?",                    options: ['int','float','str','bool'],         correctIndex: 2, difficulty: 2, explanation: 'Qo\'shtirnoq = str',      topicId: l3topics[0]!.id },
    { text: 'for i in range(5): — bu necha marta takrorlanadi?', options: ['4','5','6','3'],            correctIndex: 1, difficulty: 2, explanation: 'range(5) = 0,1,2,3,4',   topicId: l3topics[1]!.id },
    { text: 'while True: — bu nima?', options: ['Bir marta','Cheksiz sikl','5 marta','Xato'],            correctIndex: 1, difficulty: 2, explanation: 'True shartli cheksiz',   topicId: l3topics[1]!.id },
    { text: 'def greet(): — bu nima?',                    options: ['O\'zgaruvchi','Funksiya','Sinf','Modul'], correctIndex: 1, difficulty: 1, explanation: 'def funksiya aniqlaydi', topicId: l3topics[2]!.id },
    { text: 'Funksiyadan qiymat qaytarish uchun?',         options: ['give','yield','return','send'],    correctIndex: 2, difficulty: 2, explanation: 'return kalit so\'zi',     topicId: l3topics[2]!.id },
    { text: 'len("salom") = ?',                           options: ['4','5','6','3'],                   correctIndex: 1, difficulty: 2, explanation: 's-a-l-o-m = 5 harf',     topicId: l3topics[0]!.id },
  ])

  // --- DARS 4: O'zbekiston tarixi (Sardor o'qituvchi) ---
  const lesson4 = await prisma.lesson.upsert({
    where: { id: (await prisma.lesson.findFirst({ where: { title: "O'zbekiston: Mustaqillik davri", authorId: t1.id } }))?.id ?? 'new-4' },
    update: { isPublished: true },
    create: {
      title: "O'zbekiston: Mustaqillik davri",
      description: '1991-yildan hozirgi kungacha',
      authorId: t1.id,
      subjectId: history!.id,
      isPublished: true,
      rawContent: "O'zbekiston 1991-yil 31-avgustda mustaqillik e'lon qildi.",
    },
  })

  const l4topics = await ensureTopics(lesson4.id, [
    { name: 'Mustaqillik', description: '1991-yil voqealari', orderIndex: 0 },
    { name: 'Islohotlar',  description: 'Siyosiy va iqtisodiy o\'zgarishlar', orderIndex: 1 },
  ])

  await ensureQuestions(lesson4.id, [
    { text: "O'zbekiston qachon mustaqillik e'lon qildi?",     options: ['1990','1991','1992','1993'],          correctIndex: 1, difficulty: 1, explanation: '1991-yil 31-avgust', topicId: l4topics[0]!.id },
    { text: "Mustaqillik kuni qaysi sana?",                    options: ['1-sentabr','31-avgust','9-may','8-dekabr'], correctIndex: 0, difficulty: 1, explanation: '1-sentabr bayram sifatida nishonlanadi', topicId: l4topics[0]!.id },
    { text: "O'zbekiston birinchi Prezidenti?",                options: ['Shavkat Mirziyoyev','Islam Karimov','Nigmatilla Yuldoshev','Ziyod Pulatov'], correctIndex: 1, difficulty: 2, explanation: 'Islam Karimov 1991-2016', topicId: l4topics[0]!.id },
    { text: "O'zbekiston qaysi tashkilotning a'zosi?",         options: ['NATO','EU','MDH','ASEAN'],            correctIndex: 2, difficulty: 3, explanation: 'Mustaqil Davlatlar Hamdo\'stligi', topicId: l4topics[1]!.id },
    { text: "O'zbekiston milliy valyutasi?",                   options: ['Rubl','Dollar','So\'m','Tanga'],      correctIndex: 2, difficulty: 1, explanation: 'O\'zbek so\'mi 1994-yildan', topicId: l4topics[1]!.id },
  ])

  console.log('✅ Darslar va savollar yaratildi')

  // ─── TUGATILGAN SESSIYALAR ─────────────────────────────────────────────────
  // Har bir session uchun: session → participations → answers → knowledge points

  const allLessons = [
    { lesson: lesson1, topics: l1topics, teacher: t1 },
    { lesson: lesson2, topics: l2topics, teacher: t2 },
    { lesson: lesson3, topics: l3topics, teacher: t3 },
    { lesson: lesson4, topics: l4topics, teacher: t1 },
  ]

  // 8 ta o'tgan sessiya yaratamiz (hafta davomida)
  const sessionConfigs = [
    { lessonIdx: 0, daysBack: 6, studentCount: 6 },
    { lessonIdx: 1, daysBack: 5, studentCount: 5 },
    { lessonIdx: 2, daysBack: 4, studentCount: 7 },
    { lessonIdx: 3, daysBack: 3, studentCount: 4 },
    { lessonIdx: 0, daysBack: 2, studentCount: 6 },
    { lessonIdx: 1, daysBack: 2, studentCount: 5 },
    { lessonIdx: 2, daysBack: 1, studentCount: 8 },
    { lessonIdx: 3, daysBack: 0, studentCount: 3 },
  ]

  for (const cfg of sessionConfigs) {
    const { lesson, topics, teacher } = allLessons[cfg.lessonIdx]!
    const sessionDate = daysAgo(cfg.daysBack)
    const endDate = new Date(sessionDate.getTime() + 20 * 60 * 1000)

    // Sessiya allaqachon mavjudmi tekshir
    const existingSession = await prisma.quizSession.findFirst({
      where: { hostId: teacher.id, lessonId: lesson.id, status: 'FINISHED', createdAt: { gte: daysAgo(cfg.daysBack + 1) } },
    })
    if (existingSession) continue

    const questions = await prisma.question.findMany({ where: { lessonId: lesson.id } })
    if (questions.length === 0) continue

    const lastQuestion = questions[questions.length - 1]!

    const session = await prisma.quizSession.create({
      data: {
        code: randomCode(),
        hostId: teacher.id,
        lessonId: lesson.id,
        status: 'FINISHED',
        startedAt: sessionDate,
        endedAt: endDate,
        currentQuestionId: lastQuestion.id,
        timePerQuestionSec: 30,
        createdAt: sessionDate,
      },
    })

    // Tasodifiy talabalar tanlash
    const shuffled = [...students].sort(() => Math.random() - 0.5)
    const participants = shuffled.slice(0, cfg.studentCount)

    // Har bir talaba uchun javoblar va ball hisoblash
    const participantScores: { userId: string; score: number }[] = []

    for (const student of participants) {
      let totalScore = 0

      for (const q of questions) {
        // 60-90% to'g'ri javob berish ehtimoli
        const correct = Math.random() > 0.35
        const selectedIndex = correct ? q.correctIndex : (q.correctIndex + randInt(1, 3)) % 4
        const responseMs = randInt(3000, 25000)
        // Ball: to'g'ri bo'lsa vaqtga qarab 100-1000
        const points = correct ? Math.max(100, Math.floor(1000 - responseMs / 30)) : 0

        await prisma.answer.create({
          data: {
            userId: student.id,
            questionId: q.id,
            sessionId: session.id,
            selectedIndex,
            isCorrect: correct,
            responseTimeMs: responseMs,
            pointsEarned: points,
          },
        })

        totalScore += points
      }

      participantScores.push({ userId: student.id, score: totalScore })
    }

    // Rank tartiblash
    participantScores.sort((a, b) => b.score - a.score)

    for (let i = 0; i < participantScores.length; i++) {
      const p = participantScores[i]!
      await prisma.participation.create({
        data: {
          userId: p.userId,
          sessionId: session.id,
          totalScore: p.score,
          rank: i + 1,
          joinedAt: sessionDate,
          leftAt: endDate,
        },
      })
    }

    // KnowledgePoints yangilash
    for (const student of participants) {
      for (const topic of topics) {
        const topicQuestions = questions.filter(q => q.topicId === topic.id)
        if (topicQuestions.length === 0) continue

        const answers = await prisma.answer.findMany({
          where: { userId: student.id, sessionId: session.id, questionId: { in: topicQuestions.map(q => q.id) } },
        })

        const correctCount = answers.filter(a => a.isCorrect).length
        const mastery = correctCount / topicQuestions.length

        await prisma.knowledgePoint.upsert({
          where: { userId_topicId: { userId: student.id, topicId: topic.id } },
          update: {
            attemptsCount: { increment: topicQuestions.length },
            correctCount: { increment: correctCount },
            masteryLevel: mastery,
            lastPracticedAt: sessionDate,
          },
          create: {
            userId: student.id,
            topicId: topic.id,
            masteryLevel: mastery,
            attemptsCount: topicQuestions.length,
            correctCount,
            lastPracticedAt: sessionDate,
          },
        })
      }
    }
  }

  console.log('✅ Sessiyalar va natijalar yaratildi')

  // ─── SYSTEM CONFIG ─────────────────────────────────────────────────────────
  await prisma.systemConfig.upsert({
    where: { key: 'defaultTimePerQuestion' },
    update: {},
    create: { key: 'defaultTimePerQuestion', value: '30' },
  })

  // ─── NATIJA ────────────────────────────────────────────────────────────────
  const stats = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.quizSession.count({ where: { status: 'FINISHED' } }),
    prisma.participation.count(),
  ])

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Demo data tayyor!')
  console.log(`   Foydalanuvchilar: ${stats[0]}`)
  console.log(`   Darslar: ${stats[1]}`)
  console.log(`   Tugatilgan sessiyalar: ${stats[2]}`)
  console.log(`   Ishtiroklar: ${stats[3]}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📋 Kirish ma\'lumotlari:')
  console.log('┌─────────────────────────────────────────────┐')
  console.log('│  ADMIN                                      │')
  console.log('│  Email:  admin@edumind.uz                   │')
  console.log('│  Parol:  admin123                           │')
  console.log('├─────────────────────────────────────────────┤')
  console.log("│  O'QITUVCHILAR  (parol: teacher123)         │")
  console.log('│  sardor.xasanov@edumind.uz                  │')
  console.log('│  nilufar.toshmatova@edumind.uz              │')
  console.log('│  bobur.rahimov@edumind.uz                   │')
  console.log('├─────────────────────────────────────────────┤')
  console.log('│  TALABALAR  (parol: student123)             │')
  console.log('│  akmal.yusupov@edumind.uz                   │')
  console.log('│  madina.karimova@edumind.uz                 │')
  console.log('│  jasur.razzaqov@edumind.uz                  │')
  console.log('└─────────────────────────────────────────────┘')

  void admin
}

// ─── YORDAMCHI FUNKSIYALAR ────────────────────────────────────────────────────

async function ensureTopics(lessonId: string, topicDefs: { name: string; description: string; orderIndex: number }[]) {
  const existing = await prisma.topic.findMany({ where: { lessonId }, orderBy: { orderIndex: 'asc' } })
  const existingNames = new Set(existing.map(t => t.name))
  const missing = topicDefs.filter(t => !existingNames.has(t.name))
  if (missing.length > 0) {
    await Promise.all(missing.map(t => prisma.topic.create({ data: { ...t, lessonId } })))
  }
  return prisma.topic.findMany({ where: { lessonId }, orderBy: { orderIndex: 'asc' } })
}

async function ensureQuestions(
  lessonId: string,
  questions: { text: string; options: string[]; correctIndex: number; difficulty: number; explanation: string; topicId: string }[]
) {
  const existingTexts = new Set(
    (await prisma.question.findMany({ where: { lessonId }, select: { text: true } })).map(q => q.text)
  )
  const missing = questions.filter(q => !existingTexts.has(q.text))
  if (missing.length === 0) return
  await prisma.question.createMany({
    data: missing.map(q => ({
      ...q,
      lessonId,
      generatedByAI: true,
      reviewedByTeacher: true,
    })),
  })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
