// server/api/shop-img.get.ts
const ALLOWED_HOSTS = new Set(['storage.nimoura.shop'])

export default defineEventHandler(async (event) => {
  const raw = getQuery(event).url
  if (typeof raw !== 'string') throw createError({ statusCode: 400, statusMessage: 'url required' })

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'bad url' })
  }
  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    throw createError({ statusCode: 403, statusMessage: 'host not allowed' })
  }

   const res = await fetch(target, { redirect: 'error', signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw createError({ statusCode: 502, statusMessage: 'upstream error' })

  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) throw createError({ statusCode: 415, statusMessage: 'not an image' })

  setHeader(event, 'content-type', type)
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  return new Uint8Array(await res.arrayBuffer())
})