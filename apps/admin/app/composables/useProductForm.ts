import {
  VARIANT_KIND_ATTRIBUTE_NAMES,
  type BundleItemPayload,
  type CreateProductPayload,
  type CreateVariantPayload,
  type Product,
  type ProductBundleItem,
  type ProductType,
  type ProductVariant,
  type VariantKind,
} from '@nimoura/shared-types';
import {
  calculateDiscountPercentage,
  normalizeHex,
  toEnglishDigits,
  toPersianDigits,
} from '@nimoura/utils';

export const VARIANT_KIND_OPTIONS: Array<{
  value: VariantKind;
  label: string;
  hint: string;
}> = [
  { value: 'volume', label: 'حجمی', hint: 'مثل ۵۰ یا ۱۰۰ میلی‌لیتر' },
  { value: 'weight', label: 'وزنی', hint: 'مثل ۱۰۰ یا ۵۰۰ گرم' },
  { value: 'color', label: 'رنگی', hint: 'مثل رزگلد یا قرمز کلاسیک' },
];

export const VARIANT_UNITS: Record<'volume' | 'weight', string[]> = {
  volume: ['میلی‌لیتر', 'لیتر', 'سی‌سی'],
  weight: ['گرم', 'کیلوگرم', 'میلی‌گرم'],
};

export const VARIANT_PRESETS: Record<'volume' | 'weight', Array<{ amount: string; unit: string }>> = {
  volume: [
    { amount: '30', unit: 'میلی‌لیتر' },
    { amount: '50', unit: 'میلی‌لیتر' },
    { amount: '100', unit: 'میلی‌لیتر' },
    { amount: '200', unit: 'میلی‌لیتر' },
    { amount: '500', unit: 'میلی‌لیتر' },
  ],
  weight: [
    { amount: '50', unit: 'گرم' },
    { amount: '100', unit: 'گرم' },
    { amount: '250', unit: 'گرم' },
    { amount: '500', unit: 'گرم' },
    { amount: '1', unit: 'کیلوگرم' },
  ],
};

export interface FormVariant {
  uid: string;
  id?: number;
  sku: string;
  /** volume / weight */
  amount: string;
  unit: string;
  /** color */
  colorName: string;
  colorHex: string;
  /** once the admin edits the color name we stop auto-suggesting it */
  nameTouched: boolean;
  price: string;
  priceDiscount: string;
  stock: string;
  isAvailable: boolean;
  images: string[];
}

export interface FormBundleItem {
  uid: string;
  productId: number;
  variantId: number | null;
  title: string;
  thumbnail: string | null;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

let uidSeq = 0;
const nextUid = (prefix: string) => `${prefix}-${++uidSeq}`;

const toInt = (value: string | number | null | undefined): number =>
  Math.max(0, Math.trunc(Number(toEnglishDigits(String(value ?? ''))) || 0));

const effectivePrice = (item: { price?: number; priceDiscount?: number }): number => {
  const price = Number(item.price) || 0;
  const discount = Number(item.priceDiscount) || 0;
  return discount > 0 && discount < price ? discount : price;
};

export function variantLabel(v: FormVariant, kind: VariantKind): string {
  if (kind === 'color') return v.colorName.trim();
  const amount = toPersianDigits(toEnglishDigits(v.amount).trim());
  return `${amount} ${v.unit}`.trim();
}

function kindOfVariant(variant: ProductVariant): VariantKind | null {
  const attr = variant.attributeValues?.[0];
  const kind = attr?.attribute?.kind;
  if (kind === 'volume' || kind === 'weight' || kind === 'color') return kind;

  const name = attr?.attribute?.name ?? attr?.attributeName;
  const match = (Object.keys(VARIANT_KIND_ATTRIBUTE_NAMES) as VariantKind[]).find(
    (k) => VARIANT_KIND_ATTRIBUTE_NAMES[k] === name,
  );
  return match ?? null;
}

export function useProductForm() {
  const form = reactive({
    title: '',
    englishTitle: '',
    introduce: '',
    howToUse: '',
    shortDescription: '',
    sku: '',
    type: 'simple' as ProductType,
    price: '0',
    priceDiscount: '0',
    stock: '1',
    categoryId: null as number | null,
    brandId: null as number | null,
    subBrandId: null as number | null,
    isAmazingOffer: false,
    isAvailable: true,
    thumbnail: null as string | null,
    images: [] as string[],
    specifications: [{ key: '', value: '' }],
    tagIds: [] as number[],
    lowStockThreshold: '5',
    variantKind: 'volume' as VariantKind,
    variants: [] as FormVariant[],
    bundleItems: [] as FormBundleItem[],
  });

  /* ------------------------------ variants ------------------------------ */

  function createVariant(partial: Partial<FormVariant> = {}): FormVariant {
    return {
      uid: nextUid('variant'),
      sku: '',
      amount: '',
      unit: form.variantKind === 'weight' ? VARIANT_UNITS.weight[0]! : VARIANT_UNITS.volume[0]!,
      colorName: '',
      colorHex: '#B76E79',
      nameTouched: false,
      price: form.type === 'variant' ? form.price : '0',
      priceDiscount: '0',
      stock: '10',
      isAvailable: true,
      images: [],
      ...partial,
    };
  }

  function addVariant(partial: Partial<FormVariant> = {}) {
    const lastPriced = [...form.variants].reverse().find((v) => toInt(v.price) > 0);
    form.variants.push(createVariant({ price: lastPriced?.price ?? '0', ...partial }));
  }

  function removeVariant(uid: string) {
    form.variants = form.variants.filter((v) => v.uid !== uid);
  }

  function setVariantKind(kind: VariantKind) {
    if (form.variantKind === kind) return;
    form.variantKind = kind;
    if (kind === 'color') return;

    const units = VARIANT_UNITS[kind];
    for (const v of form.variants) {
      if (!units.includes(v.unit)) v.unit = units[0]!;
    }
  }

  /* ------------------------------ bundles ------------------------------- */

  function addBundleItem(item: Omit<FormBundleItem, 'uid' | 'quantity'> & { quantity?: number }) {
    const existing = form.bundleItems.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );
    if (existing) {
      existing.quantity += item.quantity ?? 1;
      return;
    }
    form.bundleItems.push({ ...item, uid: nextUid('bundle'), quantity: item.quantity ?? 1 });
  }

  function removeBundleItem(uid: string) {
    form.bundleItems = form.bundleItems.filter((i) => i.uid !== uid);
  }

  /* ------------------------------ summaries ----------------------------- */

  const discountPercent = computed(() =>
    calculateDiscountPercentage(Number(form.price) || 0, Number(form.priceDiscount) || 0),
  );

  const variantSummary = computed(() => {
    const rows = form.variants.map((v) => ({
      price: toInt(v.price),
      priceDiscount: toInt(v.priceDiscount),
      stock: toInt(v.stock),
      sellable: v.isAvailable && toInt(v.stock) > 0,
    }));
    if (!rows.length) return { min: 0, max: 0, stock: 0, cheapest: null as null | (typeof rows)[number] };

    const pool = rows.some((r) => r.sellable) ? rows.filter((r) => r.sellable) : rows;
    const prices = pool.map(effectivePrice);
    const cheapest = pool.reduce((a, b) => (effectivePrice(a) <= effectivePrice(b) ? a : b));

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      stock: rows.reduce((sum, r) => sum + r.stock, 0),
      cheapest,
    };
  });

  const bundleComponentsTotal = computed(() =>
    form.bundleItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
  );

  /* ----------------------------- validation ----------------------------- */

  function validateVariant(v: FormVariant): string[] {
    const errors: string[] = [];
    const kind = form.variantKind;
    const price = toInt(v.price);
    const discount = toInt(v.priceDiscount);

    if (kind === 'color') {
      if (!v.colorName.trim()) errors.push('نام رنگ را وارد کنید.');
      if (!normalizeHex(v.colorHex)) errors.push('کد رنگ معتبر نیست.');
    } else if (!v.amount.trim()) {
      errors.push(kind === 'volume' ? 'مقدار حجم را وارد کنید.' : 'مقدار وزن را وارد کنید.');
    }

    const label = variantLabel(v, kind);
    if (label && form.variants.some((o) => o.uid !== v.uid && variantLabel(o, kind) === label)) {
      errors.push('این تنوع تکراری است.');
    }

    const sku = v.sku.trim();
    if (sku && form.variants.some((o) => o.uid !== v.uid && o.sku.trim() === sku)) {
      errors.push('SKU تکراری است.');
    }

    if (price <= 0) errors.push('قیمت باید بزرگ‌تر از صفر باشد.');
    if (discount > 0 && discount >= price) errors.push('قیمت با تخفیف باید کمتر از قیمت اصلی باشد.');

    return errors;
  }

  function validate(): string[] {
    const errors: string[] = [];

    if (!form.title.trim()) errors.push('عنوان فارسی محصول را وارد کنید.');
    if (!form.englishTitle.trim()) errors.push('عنوان انگلیسی محصول را وارد کنید.');
    if (!form.sku.trim()) errors.push('شناسه SKU را وارد کنید.');
    if (!form.categoryId) errors.push('دسته‌بندی محصول را انتخاب کنید.');
    if (!form.brandId) errors.push('برند محصول را انتخاب کنید.');

    if (form.type === 'variant') {
      if (!form.variants.length) errors.push('حداقل یک تنوع اضافه کنید.');
      else if (form.variants.some((v) => validateVariant(v).length)) {
        errors.push('اطلاعات برخی تنوع‌ها کامل یا معتبر نیست.');
      }
    } else {
      const price = toInt(form.price);
      const discount = toInt(form.priceDiscount);
      if (price <= 0) errors.push('قیمت اصلی باید بزرگ‌تر از صفر باشد.');
      if (discount > 0 && discount >= price) {
        errors.push('قیمت پس از تخفیف باید کمتر از قیمت اصلی باشد.');
      }
    }

    if (form.type === 'bundle' && !form.bundleItems.length) {
      errors.push('حداقل یک محصول برای پک انتخاب کنید.');
    }

    return errors;
  }

  /* ------------------------------ mapping ------------------------------- */

  function loadFromProduct(existing: Product) {
    form.title = existing.title || '';
    form.englishTitle = existing.englishTitle || '';
    form.shortDescription = existing.shortDescription || '';
    form.introduce = existing.introduce || '';
    form.howToUse = existing.howToUse || '';
    form.sku = existing.sku || '';
    form.type = existing.type || (existing.variants?.length ? 'variant' : 'simple');
    form.price = String(existing.price || 0);
    form.priceDiscount = String(existing.priceDiscount || 0);
    form.stock = String(existing.stock ?? 1);
    form.categoryId = existing.categoryId || existing.category?.id || null;
    form.brandId = existing.brandId || existing.brand?.id || null;
    form.subBrandId = existing.subBrandId || existing.subBrand?.id || null;
    form.isAmazingOffer = !!existing.isAmazingOffer;
    form.isAvailable = existing.isAvailable !== false;
    form.specifications = existing.specifications?.length
      ? existing.specifications.map((s) => ({ key: s.key, value: s.value }))
      : [{ key: '', value: '' }];
    form.tagIds = (existing.tags || []).map((t) => t.id);
    form.lowStockThreshold = String(existing.lowStockThreshold ?? 5);

    if (existing.variants?.length) {
      form.variantKind = kindOfVariant(existing.variants[0]!) ?? 'color';
      form.variants = existing.variants.map((v) => mapVariant(v, form.variantKind));
    }

    if (existing.bundleItems?.length) {
      form.bundleItems = existing.bundleItems.map(mapBundleItem);
    }
  }

  function mapVariant(v: ProductVariant, kind: VariantKind): FormVariant {
    const attr = v.attributeValues?.[0];
    const label = attr?.value ?? '';
    const base = createVariant({
      uid: nextUid('variant'),
      id: v.id,
      sku: v.sku || '',
      price: String(v.price ?? 0),
      priceDiscount: String(v.priceDiscount ?? 0),
      stock: String(v.stock ?? 0),
      isAvailable: v.isAvailable !== false,
      images: v.images ?? [],
    });

    if (kind === 'color') {
      return { ...base, colorName: label, colorHex: normalizeHex(attr?.colorHex) ?? '#B76E79', nameTouched: true };
    }

    const unit = VARIANT_UNITS[kind].find((u) => label.endsWith(u));
    return unit
      ? { ...base, amount: toEnglishDigits(label.slice(0, -unit.length).trim()), unit }
      : { ...base, amount: toEnglishDigits(label), unit: '' };
  }

  function mapBundleItem(item: ProductBundleItem): FormBundleItem {
    const variantLabelText = item.variant?.attributeValues?.map((a) => a.value).join(' / ') ?? '';
    return {
      uid: nextUid('bundle'),
      productId: item.product.id,
      variantId: item.variant?.id ?? null,
      title: item.product.title,
      thumbnail: item.product.thumbnail ?? null,
      variantLabel: variantLabelText,
      unitPrice: effectivePrice(item.variant ?? item.product),
      quantity: item.quantity,
    };
  }

  function buildVariantsPayload(): CreateVariantPayload[] {
    const kind = form.variantKind;
    return form.variants.map((v) => ({
      id: v.id,
      sku: v.sku.trim() || undefined,
      price: toInt(v.price),
      priceDiscount: toInt(v.priceDiscount),
      stock: toInt(v.stock),
      isAvailable: v.isAvailable,
      images: v.images,
      attributeValues: [
        {
          attributeName: VARIANT_KIND_ATTRIBUTE_NAMES[kind],
          kind,
          value: variantLabel(v, kind),
          colorHex: kind === 'color' ? (normalizeHex(v.colorHex) ?? undefined) : undefined,
        },
      ],
    }));
  }

  function buildBundlePayload(): BundleItemPayload[] {
    return form.bundleItems.map((i) => ({
      productId: i.productId,
      variantId: i.variantId ?? undefined,
      quantity: Math.max(1, i.quantity),
    }));
  }

  function buildPayload(): CreateProductPayload {
    const isVariant = form.type === 'variant';
    const summary = variantSummary.value;

    return {
      title: form.title.trim(),
      englishTitle: form.englishTitle.trim(),
      shortDescription: form.shortDescription.trim(),
      introduce: form.introduce,
      howToUse: form.howToUse,
      sku: form.sku.trim(),
      type: form.type,
      price: isVariant ? (summary.cheapest?.price ?? 0) : toInt(form.price),
      priceDiscount: isVariant ? (summary.cheapest?.priceDiscount ?? 0) : toInt(form.priceDiscount),
      stock: isVariant ? summary.stock : toInt(form.stock),
      isAmazingOffer: form.isAmazingOffer,
      isAvailable: form.isAvailable,
      categoryId: Number(form.categoryId),
      brandId: Number(form.brandId),
      subBrandId: form.subBrandId ? Number(form.subBrandId) : null,
      thumbnail: form.thumbnail || undefined,
      images: form.images.length ? form.images : undefined,
      specifications: form.specifications.filter((s) => s.key && s.key.trim()),
      tagIds: form.tagIds,
      lowStockThreshold: toInt(form.lowStockThreshold),
      ...(isVariant ? { variants: buildVariantsPayload() } : {}),
      ...(form.type === 'bundle' ? { bundleItems: buildBundlePayload() } : {}),
    };
  }

  return {
    form,
    discountPercent,
    variantSummary,
    bundleComponentsTotal,
    createVariant,
    addVariant,
    removeVariant,
    setVariantKind,
    addBundleItem,
    removeBundleItem,
    validateVariant,
    validate,
    loadFromProduct,
    buildPayload,
  };
}
