# EduMind

Ta'lim platformasi — o'qituvchilar dars yuklaydi, AI savollar yaratadi, talabalar real-time quiz o'ynaydi.

## Arxitektura

```
apps/admin    → localhost:3000  (admin.edumind.uz)
apps/teacher  → localhost:3001  (teacher.edumind.uz)
apps/student  → localhost:3002  (student.edumind.uz)
apps/api      → localhost:4000  (Socket.io server)
```

## Boshlash

### 1. Muhit o'zgaruvchilarini sozlash

Har bir app uchun `.env.local` faylini to'ldiring:

**Neon PostgreSQL** (neon.tech) dan database URL oling:
```
DATABASE_URL="postgresql://..."
```

**Anthropic API** kalitini oling:
```
ANTHROPIC_API_KEY="sk-ant-..."
```

**NextAuth secret** generatsiya qiling:
```bash
openssl rand -base64 32
```

### 2. Dependencylarni o'rnatish

```bash
cd edumind
pnpm install
```

### 3. Database sozlash

```bash
# Schema push
pnpm db:push

# Test ma'lumotlar
pnpm db:seed
```

Test akkauntlar:
- Admin: `admin@edumind.uz` / `admin123`
- O'qituvchi: `sardor.xasanov@edumind.uz` / `teacher123`
- Talaba: `akmal.yusupov@edumind.uz` / `student123`

### 4. Ishga tushirish

```bash
# Barcha applarni bir vaqtda
pnpm dev

# Yoki alohida
pnpm --filter @edumind/admin dev
pnpm --filter @edumind/teacher dev
pnpm --filter @edumind/student dev
pnpm --filter @edumind/api dev
```

## Deploy (Vercel + Railway)

### Next.js applar → Vercel

Har bir app uchun alohida Vercel project:

1. Vercel dashboard → New Project
2. Root directory: `apps/admin` (yoki `teacher`, `student`)
3. Environment variables qo'shing
4. Custom domain: `admin.edumind.uz`

### Socket.io server → Railway

```bash
# apps/api papkasida
railway up
```

## Texnologiyalar

- Next.js 15 (App Router)
- TypeScript strict
- Tailwind CSS v4
- Prisma + PostgreSQL (Neon)
- NextAuth v5
- Socket.io
- Anthropic Claude SDK
- Turborepo + pnpm workspaces
