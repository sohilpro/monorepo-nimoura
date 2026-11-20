export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  try {
    return await adminApiFetch(event, "/promotions/generate-code", {
      method: "POST",
      body,
    });
  } catch {
    const prefix = (body?.prefix || "OFF").toUpperCase().trim();
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let random = "";
    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `${prefix}-${random}`;
    return {
      success: true,
      data: { code },
    };
  }
});
