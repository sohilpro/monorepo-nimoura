export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, 'accesstoken');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ورود ادمین الزامی است',
    });
  }

  const parts = await readMultipartFormData(event);
  const filePart = parts?.find((p) => p.name === 'file');

  if (!filePart || !filePart.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'فایلی ارسال نشده است',
    });
  }

  const formData = new FormData();
  formData.append(
    'file',
    new Blob([new Uint8Array(filePart.data)], {
      type: filePart.type || 'application/octet-stream',
    }),
    filePart.filename || 'attachment',
  );

  try {
    const response: any = await $fetch('/tickets/upload', {
      baseURL: config.apiBase,
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 502,
      statusMessage:
        error?.data?.message || 'خطا در آپلود فایل ضمیمه تیکت توسط ادمین',
    });
  }
});
