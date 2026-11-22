// server/api/media/upload.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, 'accesstoken');

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'ورود ادمین الزامی است' });
  }

  const parts = await readMultipartFormData(event);
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'فایلی ارسال نشده است' });
  }

  const fileParts = parts.filter(
    (p) => (p.name === 'file' || p.name === 'files') && p.filename && p.data?.length,
  );

  if (fileParts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'هیچ فایلی برای آپلود یافت نشد' });
  }

  const ownerTypePart = parts.find((p) => p.name === 'ownerType');
  const ownerIdPart = parts.find((p) => p.name === 'ownerId');

  const ownerType = ownerTypePart?.data?.toString() || 'banner';
  const ownerId = ownerIdPart?.data?.toString() || 'general';

  const formData = new FormData();
  formData.append('ownerType', ownerType);
  formData.append('ownerId', ownerId);

  const isMultiple = fileParts.length > 1;
  const targetEndpoint = isMultiple ? '/media/upload-many' : '/media/upload';

  for (const part of fileParts) {
    formData.append(
      isMultiple ? 'files' : 'file',
      new Blob([part.data], { type: part.type || 'application/octet-stream' }),
      part.filename || 'upload.webp',
    );
  }

  try {
    const response: any = await $fetch(targetEndpoint, {
      baseURL: config.apiBase,
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: response?.data || response,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 502,
      statusMessage: error?.data?.message || error?.message || 'خطا در آپلود فایل',
      data: error?.data || error?.response?._data,
    });
  }
});
