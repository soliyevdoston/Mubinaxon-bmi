// Neon serverless pauses after inactivity. First request gets P1001/P1008/P2024.
// This utility retries DB operations automatically.
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2500): Promise<T> {
  const RETRYABLE = new Set(['P1001', 'P1008', 'P1017', 'P2024'])
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (i < retries && code && RETRYABLE.has(code)) {
        await new Promise(r => setTimeout(r, delayMs))
        continue
      }
      throw err
    }
  }
  throw new Error('unreachable')
}
