// composables/useCategoryVisuals.ts
import { useCategoryIcon } from './useCategoryIcon';

export interface CategoryVisualMeta {
  image: string;
  badge?: string;
  keywords?: string;
  gradientClass: string;
  glowColor: string;
}

const VISUAL_REGISTRY: Record<string, CategoryVisualMeta> = {
  // ۱. لوازم آرایشی و آرایش صورت
  cosmetics: {
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
    badge: 'محبوب‌ترین',
    keywords: 'رژ لب، کرم‌پودر، رژگونه',
    gradientClass: 'from-[#b76e79]/15 to-[#d9c6e2]/10',
    glowColor: 'rgba(183, 110, 121, 0.25)',
  },
  'lwzm-arishi': {
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
    badge: 'محبوب‌ترین',
    keywords: 'رژ لب، کرم‌پودر، رژگونه',
    gradientClass: 'from-[#b76e79]/15 to-[#d9c6e2]/10',
    glowColor: 'rgba(183, 110, 121, 0.25)',
  },
  // آرایش چشم
  'arish-chshm': {
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    badge: 'پرفروش',
    keywords: 'ریمل، خط چشم، سایه',
    gradientClass: 'from-[#2e2636]/10 to-[#b76e79]/12',
    glowColor: 'rgba(46, 38, 54, 0.25)',
  },
  // ۲. مراقبت پوستی
  skincare: {
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    badge: 'روتین پوستی',
    keywords: 'آبرسان، ضد آفتاب، سرم',
    gradientClass: 'from-[#2fb57e]/12 to-[#fff8f4]',
    glowColor: 'rgba(47, 181, 126, 0.25)',
  },
  'mrghbt-pwsti': {
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    badge: 'روتین پوستی',
    keywords: 'آبرسان، ضد آفتاب، سرم',
    gradientClass: 'from-[#2fb57e]/12 to-[#fff8f4]',
    glowColor: 'rgba(47, 181, 126, 0.25)',
  },
  // ۳. مراقبت از مو
  haircare: {
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80',
    badge: 'درمان و تقویت',
    keywords: 'شامپو تخصصی، ماسک مو',
    gradientClass: 'from-amber-500/12 to-[#fff8f4]',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
  'mrghbt-w-zibii-mw': {
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80',
    badge: 'درمان و تقویت',
    keywords: 'شامپو تخصصی، ماسک مو',
    gradientClass: 'from-amber-500/12 to-[#fff8f4]',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
  'mrghbt-az-mw': {
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80',
    badge: 'درمان و تقویت',
    keywords: 'شامپو تخصصی، ماسک مو',
    gradientClass: 'from-amber-500/12 to-[#fff8f4]',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
  // ۴. مراقبت شخصی و بدن
  'personal-care': {
    image: 'https://images.unsplash.com/photo-1608248597359-2e11894a4c6a?auto=format&fit=crop&w=400&q=80',
    badge: 'بهداشت روزانه',
    keywords: 'ضد تعریق، لوسیون، بهداشت',
    gradientClass: 'from-sky-500/12 to-[#fff8f4]',
    glowColor: 'rgba(14, 165, 233, 0.25)',
  },
  'mrghbt-shkhsi': {
    image: 'https://images.unsplash.com/photo-1608248597359-2e11894a4c6a?auto=format&fit=crop&w=400&q=80',
    badge: 'بهداشت روزانه',
    keywords: 'ضد تعریق، لوسیون، بهداشت',
    gradientClass: 'from-sky-500/12 to-[#fff8f4]',
    glowColor: 'rgba(14, 165, 233, 0.25)',
  },
  // ۵. عطر و ادکلن
  perfume: {
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    badge: 'رایحه ماندگار',
    keywords: 'ادوپرفیوم، بادی اسپلش، میست',
    gradientClass: 'from-purple-500/12 to-[#d9c6e2]/15',
    glowColor: 'rgba(168, 85, 247, 0.25)',
  },
  'bhdshti-aatr-w-spri': {
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    badge: 'رایحه ماندگار',
    keywords: 'ادوپرفیوم، بادی اسپلش، میست',
    gradientClass: 'from-purple-500/12 to-[#d9c6e2]/15',
    glowColor: 'rgba(168, 85, 247, 0.25)',
  },
  'atr-w-adkln': {
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    badge: 'رایحه ماندگار',
    keywords: 'ادوپرفیوم، بادی اسپلش، میست',
    gradientClass: 'from-purple-500/12 to-[#d9c6e2]/15',
    glowColor: 'rgba(168, 85, 247, 0.25)',
  },
};

const DEFAULT_META: CategoryVisualMeta = {
  image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  badge: 'زیبایی و سلامت',
  keywords: 'محصولات برگزیده نیمورا',
  gradientClass: 'from-nimoura-primary/10 to-nimoura-accent/15',
  glowColor: 'rgba(183, 110, 121, 0.2)',
};

/**
 * دریافت اطلاعات بصری (عکس باکیفیت، گرادینت، بج، کلمات کلیدی، آیکون) برای یک دسته‌بندی
 * با اولویت اول برای داده‌های ذخیره‌شده در دیتابیس توسط ادمین (image / badge / icon)
 */
export function useCategoryVisuals(
  slug?: string | null,
  name?: string | null,
  overrides?: {
    image?: string | null;
    badge?: string | null;
    icon?: string | null;
  },
) {
  const normalizedSlug = (slug ?? '').trim().toLowerCase();
  const normalizedName = (name ?? '').trim();

  // جستجو بر اساس اسلاگ
  let meta = VISUAL_REGISTRY[normalizedSlug];

  // جستجو بر اساس کلمات کلیدی نام دسته‌بندی
  if (!meta) {
    if (normalizedName.includes('آرایش') || normalizedName.includes('ارایش') || normalizedName.includes('لب') || normalizedName.includes('صورت')) {
      meta = VISUAL_REGISTRY['lwzm-arishi'];
    } else if (normalizedName.includes('چشم') || normalizedName.includes('ریمل')) {
      meta = VISUAL_REGISTRY['arish-chshm'];
    } else if (normalizedName.includes('پوست') || normalizedName.includes('ضد آفتاب') || normalizedName.includes('آبرسان')) {
      meta = VISUAL_REGISTRY['mrghbt-pwsti'];
    } else if (normalizedName.includes('مو') || normalizedName.includes('شامپو')) {
      meta = VISUAL_REGISTRY['mrghbt-w-zibii-mw'];
    } else if (normalizedName.includes('عطر') || normalizedName.includes('ادکلن') || normalizedName.includes('اسپری')) {
      meta = VISUAL_REGISTRY['bhdshti-aatr-w-spri'];
    } else if (normalizedName.includes('شخصی') || normalizedName.includes('بهداشت')) {
      meta = VISUAL_REGISTRY['mrghbt-shkhsi'];
    }
  }

  const baseMeta = meta ?? DEFAULT_META;

  // اعمال داده‌های داینامیک ثبت‌شده از پنل ادمین با بالاترین اولویت
  const finalMeta: CategoryVisualMeta = {
    ...baseMeta,
    image: overrides?.image?.trim() || baseMeta.image,
    badge: overrides?.badge?.trim() || baseMeta.badge,
  };

  const iconComponent = useCategoryIcon(normalizedSlug);

  return {
    meta: finalMeta,
    icon: iconComponent,
  };
}
