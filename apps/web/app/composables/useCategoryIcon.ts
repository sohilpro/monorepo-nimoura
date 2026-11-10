import IconsCategoryCosmetics from '~/components/Icons/Category/Cosmetics.vue';
import IconsCategorySkincare from '~/components/Icons/Category/Skincare.vue';
import IconsCategoryHaircare from '~/components/Icons/Category/Haircare.vue';
import IconsCategoryPerfume from '~/components/Icons/Category/Perfume.vue';

const ICON_MAP: Record<string, any> = {
  'lwzm-arishi': IconsCategoryCosmetics,
  'mrghbt-pwsti': IconsCategorySkincare,
  'mrghbt-w-zibii-mw': IconsCategoryHaircare,
  'bhdshti-aatr-w-spri': IconsCategoryPerfume,
};

export function useCategoryIcon(slug?: string | null) {
  return ICON_MAP[slug ?? ''];
}
