// server/api/admin/upload.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, 'accesstoken');

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'ورود ادمین الزامی است' });
  }

  const parts = await readMultipartFormData(event);
  const filePart = parts?.find((p) => p.name === 'file');
  const ownerTypePart = parts?.find((p) => p.name === 'ownerType');
  const ownerIdPart = parts?.find((p) => p.name === 'ownerId');

  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'فایلی ارسال نشده است' });
  }

  const ownerType = ownerTypePart?.data ? ownerTypePart.data.toString() : 'article_content';
  const ownerId = ownerIdPart?.data ? ownerIdPart.data.toString() : 'general';

  const formData = new FormData();
  formData.append(
    'file',
    new Blob([filePart.data], { type: filePart.type || 'application/octet-stream' }),
    filePart.filename || 'upload.webp',
  );
  formData.append('ownerType', ownerType);
  formData.append('ownerId', ownerId);

  try {
    // ارسال به بک‌اند NestJS (مسیر /media/upload)
    const response: any = await $fetch('/media/upload', {
      baseURL: config.apiBase,
      method: 'POST',
      body: formData,
      headers: { 
        Authorization: `Bearer ${token}` 
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
      statusMessage: error?.data?.message || 'خطا در ارتباط با سرور برای آپلود فایل',
    });
  }
});