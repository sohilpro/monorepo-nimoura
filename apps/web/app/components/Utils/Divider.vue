<script setup lang="ts">
interface Props {
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'line' | 'dashed' | 'dot' | 'subtle' | 'space-only'
  maxWidth?: 'full' | 'boxed' | 'narrow'
}

const props = withDefaults(defineProps<Props>(), {
  spacing: 'md',
  variant: 'line',
  maxWidth: 'boxed',
})

// فاصله عمودی بالا و پایین (پشتیبانی ریسپانسیو موبایل به دسکتاپ)
const spacingClasses = computed(() => {
  const map: Record<NonNullable<Props['spacing']>, string> = {
    'none': 'py-0',
    'xs': 'py-2 sm:py-3',
    'sm': 'py-3 sm:py-5',
    'md': 'py-5 sm:py-8',
    'lg': 'py-8 sm:py-12',
    'xl': 'py-12 sm:py-16',
  }
  return map[props.spacing]
})

// محدودیت عرض
const widthClasses = computed(() => {
  const map: Record<NonNullable<Props['maxWidth']>, string> = {
    full: 'w-full',
    boxed: 'mx-auto max-w-7xl px-3 sm:px-6 lg:px-8',
    narrow: 'mx-auto max-w-3xl px-4',
  }
  return map[props.maxWidth]
})
</script>

<template>
  <div :class="['w-full', spacingClasses]" role="separator" aria-orientation="horizontal">
    <div :class="widthClasses">
      <!-- حالت خط ساده هماهنگ با بوردر وکارو -->
      <hr
        v-if="variant === 'line'"
        class="border-0 border-t border-[#d9dee5]"
      />

      <!-- حالت خط‌چین صنعتی -->
      <hr
        v-else-if="variant === 'dashed'"
        class="border-0 border-t border-dashed border-[#d9dee5]"
      />

      <!-- خط ملایم محو شونده از طرفین -->
      <div
        v-else-if="variant === 'subtle'"
        class="h-px w-full bg-gradient-to-r from-transparent via-[#d9dee5] to-transparent"
      />

      <!-- نشانگر نقطه‌ای وسط -->
      <div
        v-else-if="variant === 'dot'"
        class="relative flex items-center justify-center"
      >
        <div class="h-px w-full bg-[#d9dee5]" />
        <span class="absolute flex size-2 items-center justify-center rounded-full bg-[#17324d] ring-4 ring-[#f7f8fa]" />
      </div>

      <!-- فقط فضای خالی بدون هیچ خط بصری -->
      <div v-else-if="variant === 'space-only'" class="h-0" />
    </div>
  </div>
</template>