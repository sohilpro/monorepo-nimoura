export default defineEventHandler(async (event) => {
  const {
     apiBase ,
  } = useRuntimeConfig();
  const body = await readBody(event);
  if (!body?.referralCode) {
    const cookieRef = getCookie(event, 'nimoura_ref');
    if (cookieRef) {
      body.referralCode = cookieRef;
    }
  }

  try {
    const data: any = await apiFetch(event, '/auth/check-otp', {
      method: "POST",
      body,
    });

    if (data?.data.accessToken) {
      setCookie(event, "accesstoken", data?.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // فقط در HTTPS برای محیط production
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 day
        path: "/",
      });
    }

    return data;
  } catch (error: any) {
    return sendError(
      event,
      createError({
        statusCode: error?.statusCode || 500,
        statusMessage: error?.data?.message || "خطای داخلی سرور",
      })
    );
  }
});
