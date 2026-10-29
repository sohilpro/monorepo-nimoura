// server/api/health.get.ts
export default defineEventHandler(() => ({ ok: true, t: Date.now() }))