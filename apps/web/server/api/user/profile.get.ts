export default defineEventHandler(async (event) => {
  const token = getCookie(event, "accesstoken");

  return await apiFetch(event, "/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
