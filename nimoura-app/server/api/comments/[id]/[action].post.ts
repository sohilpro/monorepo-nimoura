export default defineEventHandler(async (event) => {
  const id     = getRouterParam(event, 'id')
  const action = getRouterParam(event, 'action')   // like | dislike | recommend
  const body   = await readBody(event).catch(() => ({}))
  const token  = getCookie(event, 'accesstoken') ?? getHeader(event, 'authorization')
  const {apiBase} = useRuntimeConfig()
 
  return await $fetch(`${apiBase}/comments/${id}/${action}`, {
    method:  'POST',
    body,
    headers: { Authorization: `Bearer ${token}` },
  })
})