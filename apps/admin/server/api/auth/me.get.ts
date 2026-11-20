export default defineEventHandler(async (event) => {
  const {
    public: { apiBasePublic },
  } = useRuntimeConfig();

  const token = getCookie(event, "accesstoken");
  if (!token) {
    return null;
  }
  try {
    const data = await $fetch(`${apiBasePublic}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch {
    deleteCookie(event, "accesstoken", { path: "/" });
    return null;
  }
});
