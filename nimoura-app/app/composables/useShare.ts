// composables/useShare.ts
export function useShare() {
  const toast = useAppToast();

  async function copyToClipboard(text: string): Promise<boolean> {
    // روش مدرن (نیاز به HTTPS/secure context داره)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // ادامه می‌دیم سراغ fallback
      }
    }

    // fallback قدیمی: یک input موقت بساز، متن رو انتخاب کن، execCommand بزن
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // جلوگیری از اسکرول/کیبورد ناخواسته موبایل
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);

      textarea.select();
      textarea.setSelectionRange(0, text.length); // برای سافاری/آی‌اواس

      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      return success;
    } catch {
      return false;
    }
  }

  async function share(options: { title: string; text?: string; url: string }) {
    // اگه مرورگر از Web Share API پشتیبانی کنه
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(options);
        return;
      } catch (err: any) {
        // کاربر خودش کنسل کرد → هیچ کاری نکن
        if (err?.name === "AbortError") return;
        // هر خطای دیگه‌ای (مثلاً NotAllowedError) → برو سراغ فالبک کپی، به‌جای فقط نمایش خطا
      }
    }

    // fallback: کپی لینک در کلیپ‌بورد
    const copied = await copyToClipboard(options.url);

    if (copied) {
      toast.success("لینک محصول کپی شد");
    } else {
      toast.error("امکان کپی لینک وجود ندارد");
    }
  }

  return { share };
}