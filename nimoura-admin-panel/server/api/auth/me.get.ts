export default defineEventHandler(async (event) => {
  const {
    public: { apiBasePublic },
  } = useRuntimeConfig();
  // setCookie(
  //   event,
  //   "accesstoken",
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU1MDE3NjYzLCJleHAiOjE3NTc2MDk2NjN9.pn7cz8oGifZXT8otO2LqH_gTWXDSgtpYCY0ydX5EgCY",
  //   {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production", // فقط در HTTPS برای محیط production
  //     sameSite: "lax",
  //     maxAge: 60 * 60 * 24 * 7, // 7 day
  //     path: "/",
  //   }
  // );
  // return "data";
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
  } catch (error) {
    return error;
  }
});
