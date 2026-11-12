export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, 'accesstoken');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'برای آپلود تصویر ابتدا وارد حساب کاربری خود شوید',
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
    filePart.filename || 'comment-image.webp',
  );

  try {
    const response: any = await $fetch('/media/comment-image', {
      baseURL: config.apiBase,
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      url: response?.data?.publicUrl || response?.publicUrl,
      data: response?.data || response,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 502,
      statusMessage:
        error?.data?.message || 'خطا در ارتباط با سرور برای آپلود تصویر',
    });
  }
});
