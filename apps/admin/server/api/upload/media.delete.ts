// server/api/upload/media.delete.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const urls = body?.urls || (body?.url ? [body.url] : []);

  if (!Array.isArray(urls) || urls.length === 0) {
    return { success: true, message: 'هیچ فایلی برای حذف مشخص نشده است' };
  }

  return await adminApiFetch(event, '/media/urls', {
    method: 'DELETE',
    body: { urls },
  });
});
