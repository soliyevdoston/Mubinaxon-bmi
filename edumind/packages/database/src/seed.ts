import { prisma } from './index'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Seeding database...')

  // Admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edumind.uz' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@edumind.uz',
      passwordHash: adminPasswordHash,
      fullName: 'Tizim Administratori',
      role: 'ADMIN',
    },
  })

  // Teacher users
  const teacherPasswordHash = await bcrypt.hash('teacher123', 12)
  const teacher1 = await prisma.user.upsert({
    where: { email: 'sardor.xasanov@edumind.uz' },
    update: { passwordHash: teacherPasswordHash },
    create: {
      email: 'sardor.xasanov@edumind.uz',
      passwordHash: teacherPasswordHash,
      fullName: 'Sardor Xasanov',
      role: 'TEACHER',
    },
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: 'nilufar.toshmatova@edumind.uz' },
    update: { passwordHash: teacherPasswordHash },
    create: {
      email: 'nilufar.toshmatova@edumind.uz',
      passwordHash: teacherPasswordHash,
      fullName: 'Nilufar Toshmatova',
      role: 'TEACHER',
    },
  })

  // Student users
  const studentPasswordHash = await bcrypt.hash('student123', 12)
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'akmal.yusupov@edumind.uz' },
      update: { passwordHash: studentPasswordHash },
      create: {
        email: 'akmal.yusupov@edumind.uz',
        passwordHash: studentPasswordHash,
        fullName: 'Akmal Yusupov',
        role: 'STUDENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'madina.karimova@edumind.uz' },
      update: { passwordHash: studentPasswordHash },
      create: {
        email: 'madina.karimova@edumind.uz',
        passwordHash: studentPasswordHash,
        fullName: 'Madina Karimova',
        role: 'STUDENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jasur.razzaqov@edumind.uz' },
      update: { passwordHash: studentPasswordHash },
      create: {
        email: 'jasur.razzaqov@edumind.uz',
        passwordHash: studentPasswordHash,
        fullName: 'Jasur Razzaqov',
        role: 'STUDENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'zulfiya.mirzayeva@edumind.uz' },
      update: { passwordHash: studentPasswordHash },
      create: {
        email: 'zulfiya.mirzayeva@edumind.uz',
        passwordHash: studentPasswordHash,
        fullName: 'Zulfiya Mirzayeva',
        role: 'STUDENT',
      },
    }),
  ])

  // Subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { slug: 'matematika' },
      update: {},
      create: {
        name: 'Matematika',
        slug: 'matematika',
        description: 'Algebra, geometriya va matematika tahlili',
      },
    }),
    prisma.subject.upsert({
      where: { slug: 'fizika' },
      update: {},
      create: {
        name: 'Fizika',
        slug: 'fizika',
        description: 'Mexanika, termodinamika, elektromagnitizm',
      },
    }),
    prisma.subject.upsert({
      where: { slug: 'informatika' },
      update: {},
      create: {
        name: 'Informatika',
        slug: 'informatika',
        description: "Dasturlash, algoritmlar va ma'lumotlar tuzilmasi",
      },
    }),
    prisma.subject.upsert({
      where: { slug: 'kimyo' },
      update: {},
      create: {
        name: 'Kimyo',
        slug: 'kimyo',
        description: "Organik va noorganik kimyo, kimyoviy reaksiyalar",
      },
    }),
  ])

  const [mathSubject, physicsSubject] = subjects

  // Sample lesson for teacher1
  const existingLesson = await prisma.lesson.findFirst({
    where: { title: 'Algebra: Chiziqli tenglamalar', authorId: teacher1.id },
  })

  if (!existingLesson) {
    const lesson = await prisma.lesson.create({
      data: {
        title: 'Algebra: Chiziqli tenglamalar',
        description: "Bitta va ikki o'zgaruvchili chiziqli tenglamalarni yechish usullari",
        authorId: teacher1.id,
        subjectId: mathSubject!.id,
        isPublished: true,
        rawContent: `Chiziqli tenglamalar — matematikaning asosiy mavzularidan biri.
ax + b = 0 ko'rinishidagi tenglama chiziqli tenglama deyiladi.
Bu erda a va b son koeffitsientlar, x esa noma'lum.

Yechish usullari:
1. x ni ifodalash: x = -b/a (agar a ≠ 0)
2. Tekshirish: topilgan qiymatni tenglamaga qo'yib tekshirish

Ikki o'zgaruvchili chiziqli tenglamalar sistemasi:
a1x + b1y = c1
a2x + b2y = c2

Yechish usullari: qo'shish usuli, almashtirish usuli, Kramer usuli.`,
      },
    })

    const topic1 = await prisma.topic.create({
      data: {
        name: "Bitta o'zgaruvchili chiziqli tenglamalar",
        description: 'ax + b = 0 ko\'rinishidagi tenglamalar',
        lessonId: lesson.id,
        orderIndex: 0,
      },
    })

    const topic2 = await prisma.topic.create({
      data: {
        name: "Ikki o'zgaruvchili chiziqli tenglamalar sistemasi",
        description: 'Ikki tenglamadan iborat sistema',
        lessonId: lesson.id,
        orderIndex: 1,
      },
    })

    await prisma.question.createMany({
      data: [
        {
          text: '2x + 6 = 0 tenglamasining yechi nechaga teng?',
          options: ['x = 3', 'x = -3', 'x = 6', 'x = -6'],
          correctIndex: 1,
          difficulty: 2,
          explanation: '2x = -6, x = -6/2 = -3',
          lessonId: lesson.id,
          topicId: topic1.id,
          generatedByAI: false,
          reviewedByTeacher: true,
        },
        {
          text: "Qaysi holda chiziqli tenglama yechimga ega bo'lmaydi?",
          options: [
            "a = 0 va b ≠ 0 bo'lganda",
            "a ≠ 0 bo'lganda",
            "b = 0 bo'lganda",
            'Har doim yechimga ega',
          ],
          correctIndex: 0,
          difficulty: 4,
          explanation:
            "Agar a = 0 va b ≠ 0 bo'lsa, 0·x = -b tenglamasi hech qachon to'g'ri bo'lmaydi",
          lessonId: lesson.id,
          topicId: topic1.id,
          generatedByAI: false,
          reviewedByTeacher: true,
        },
        {
          text: 'x + y = 5 va x - y = 1 sistemasining yechimi:',
          options: ['x=3, y=2', 'x=2, y=3', 'x=4, y=1', 'x=1, y=4'],
          correctIndex: 0,
          difficulty: 5,
          explanation: 'Qo\'shish usuli: 2x=6, x=3; y=5-3=2',
          lessonId: lesson.id,
          topicId: topic2.id,
          generatedByAI: false,
          reviewedByTeacher: true,
        },
      ],
    })
  }

  // Physics lesson
  const existingPhysicsLesson = await prisma.lesson.findFirst({
    where: { title: 'Mexanika: Nyuton qonunlari', authorId: teacher2.id },
  })

  if (!existingPhysicsLesson) {
    const physicsLesson = await prisma.lesson.create({
      data: {
        title: 'Mexanika: Nyuton qonunlari',
        description: "Nyutonning uchta mexanika qonuni va ularning amaliy tatbiqlari",
        authorId: teacher2.id,
        subjectId: physicsSubject!.id,
        isPublished: true,
        rawContent: `Nyuton qonunlari klassik mexanikaning poydevoridir.

I qonun (inersiya qonuni): Agar jismga kuch ta'sir etmasa yoki ta'sir etuvchi kuchlar muvozanatlashgan bo'lsa, jism tinch holda yoki to'g'ri chiziqli tekis harakat holatida qoladi.

II qonun: F = ma. Jismga ta'sir etuvchi tezlatuvchi kuch, jism massasi va uning tezlanishining ko'paytmasiga teng.

III qonun: Har bir ta'sirga teng va qarama-qarshi yo'nalgan reaksiya mavjud. F1 = -F2.`,
      },
    })

    const topic = await prisma.topic.create({
      data: {
        name: 'Nyuton qonunlari',
        description: 'Klassik mexanikaning asosiy qonunlari',
        lessonId: physicsLesson.id,
        orderIndex: 0,
      },
    })

    await prisma.question.createMany({
      data: [
        {
          text: "Nyutonning ikkinchi qonuniga ko'ra F = ?",
          options: ['F = m/a', 'F = ma', 'F = a/m', 'F = m + a'],
          correctIndex: 1,
          difficulty: 2,
          explanation: 'Nyutonning ikkinchi qonuni: kuch massa va tezlanish ko\'paytmasiga teng',
          lessonId: physicsLesson.id,
          topicId: topic.id,
          generatedByAI: false,
          reviewedByTeacher: true,
        },
        {
          text: 'Massasi 2 kg bo\'lgan jismga 10 N kuch ta\'sir etsa, tezlanish qanchaga teng?',
          options: ['2 m/s²', '5 m/s²', '8 m/s²', '20 m/s²'],
          correctIndex: 1,
          difficulty: 3,
          explanation: 'a = F/m = 10/2 = 5 m/s²',
          lessonId: physicsLesson.id,
          topicId: topic.id,
          generatedByAI: false,
          reviewedByTeacher: true,
        },
      ],
    })
  }

  console.log('Seed completed.')
  console.log('\nTest akkauntlar:')
  console.log('Admin:   admin@edumind.uz / admin123')
  console.log("O'qituvchi: sardor.xasanov@edumind.uz / teacher123")
  console.log('Talaba:  akmal.yusupov@edumind.uz / student123')

  void admin
  void teacher2
  void students
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
