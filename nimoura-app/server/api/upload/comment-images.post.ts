// server/api/upload/comment-image.post.ts
// پراکسی آپلود عکس کامنت — یه فایل تکی
export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig();
  const token =
    getCookie(event, "accesstoken") ?? getHeader(event, "authorization") ?? "";

  const form = await readFormData(event);

  return await $fetch<{ success: boolean; url: string }>(
    `${apiBase}/upload/comment-image`,
    {
      method: "POST",
      body: form,
      headers: { Authorization: `Bearer ${token}` },
    },
  );
});
