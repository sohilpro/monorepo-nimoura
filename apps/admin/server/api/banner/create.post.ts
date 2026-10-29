export default defineEventHandler(async (event) => {
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  const token = getCookie(event, "accesstoken");
  const formParts: any = await readMultipartFormData(event);
  const formData = new FormData();

  for (const part of formParts || []) {
    if (part.filename && part.type) {
      // ساخت Blob برای فایل‌ها
      const file = new Blob([part.data], { type: part.type });
      formData.append(part.name, file, part.filename);
    } else {
      // رشته‌ها
      formData.append(part.name, part.data.toString());
    }
  }
console.log(apiBase);
console.log(formData);


  try {
    const data = await $fetch(`${apiBase}/banners`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return data;
  } catch (error) {
    return error;
  }
});
