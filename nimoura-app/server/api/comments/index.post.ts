export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = getCookie(event, "accesstoken") ?? getHeader(event, "authorization");
  const { apiBase } = useRuntimeConfig();

  return await $fetch(`${apiBase}/comments`, {
    method: "POST",
    body,
    headers: { Authorization: `Bearer ${token}` },
  });
});
