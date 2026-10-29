const numberFormatter = new Intl.NumberFormat("fa-IR");

function numberFormat(value: number | string): string {
  const numericValue =
    typeof value === "string" ? Number(value.replace(/[^\d.-]/g, "")) : value;
  // if (isNaN(numericValue)) return value.toString();
  return numberFormatter.format(numericValue);
}

function buildCategoryBreadcrumb(category: any) {
  const items: { label: string; href?: string }[] = [
    { label: "خانه", href: "/" },
  ];
  

  const chain: any[] = [];
  const visited = new Set<number>();

  // از دسته‌ی فعلی به سمت والدها بالا می‌ریم (برای جلوگیری از حلقه‌ی بی‌نهایت
  // در صورت دیتای خراب، شناسه‌ها رو track می‌کنیم)
  let current = category;
  while (current) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    chain.push(current);
    current = current.parent;
  }

  // حالا از ریشه به سمت برگ مرتبش می‌کنیم
  chain.reverse();

  chain.forEach((cat, index) => {
    const isLast = index === chain.length - 1;

    items.push({
      label: cat?.name ?? "",
      // آخرین آیتم (دسته‌ی جاری) لینک نداره، فقط متن نمایشیه
      href: isLast
        ? undefined
        : `/categories/${cat?.id}/${createSlug(cat?.name)}`,
    });
  });

  return items;
}

function createSlug(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FF0-9a-zA-Z\-]/g, "")
    .replace(/\-+/g, "-")
    .toLowerCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fa-IR");
}

export { numberFormat, createSlug, buildCategoryBreadcrumb, formatDate };
