<template>
  <Teleport to="body">

    <!-- Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-60 bg-black/50 lg:hidden"
        @click="close"
      />
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
      leave-active-class="transition-transform duration-250 ease-[cubic-bezier(0.55,0,1,0.45)]"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-70 flex flex-col lg:hidden"
        style="background: var(--color-nimoura-base)"
      >

        <!-- ══ Header ══ -->
        <div
          class="relative flex h-16 shrink-0 items-center justify-between px-4"
          style="background: linear-gradient(135deg, var(--color-nimoura-primary) 0%, var(--color-nimoura-base) 100%)"
        >
          <!-- Logo -->
           <span
        class="font-modam font-bold text-4xl text-nimoura-primary flex items-center"
      >
        نیمورا
      </span>

          <!-- Close -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            style="background: rgba(255,255,255,0.1)"
            aria-label="بستن"
            @click="close"
          >
            <i class="pi pi-times text-white/80 text-sm" />
          </button>

          <!-- Decorative arc -->
          <svg
            class="absolute -bottom-px left-0 right-0 w-full"
            height="12" viewBox="0 0 390 12" preserveAspectRatio="none"
            style="fill: var(--color-nimoura-base)"
          >
            <path d="M0 12 Q195 0 390 12 L390 12 L0 12 Z"/>
          </svg>
        </div>

        <!-- ══ Parent category chips (horizontal scroll) ══ -->
        <div class="shrink-0 pt-4 pb-2">
          <div class="hide-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1">
<button
  v-for="cat in categories"
  :key="cat.id"
  type="button"
  class="chip flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-4 py-3 transition-all duration-250"
  :class="selectedParent?.id === cat.id ? 'chip--active' : 'chip--idle'"
  @click="selectParent(cat)"
>
  <component :is="useCategoryIcon(cat.slug)" class="size-[40px]" />
   <!-- <span style="font-size: 48px; font-family: 'Apple Color Emoji', sans-serif;">
   🛁
</span> -->
<!-- <img src="https://emojicdn.elk.sh/🛁?style=apple" width="64" height="64" alt="Bathtub"> -->
  <span class="whitespace-nowrap text-[11px] font-medium font-vazir leading-none">
    {{ cat.name }}
  </span>
</button>
          </div>
        </div>

        <!-- Divider -->
        <div class="mx-4 mb-3 h-px" style="background: color-mix(in srgb, var(--color-nimoura-primary) 15%, transparent)" />

        <!-- ══ Sub-categories panel ══ -->
        <div class="min-h-0 flex-1 overflow-hidden">
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-250 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 translate-y-2"
            leave-to-class="opacity-0"
          >
            <div
              v-if="selectedParent"
              :key="selectedParent.id"
              class="hide-scrollbar h-full overflow-y-auto px-4 pb-24"
            >
              <!-- Section title + "see all" -->
              <div class="mb-4 flex items-center justify-between">
                <span class="text-[13px] font-semibold font-vazir" style="color: var(--color-nimoura-text-900)">
                  {{ selectedParent.name }}
                </span>
                <NuxtLink
                  :to="`/categories/${selectedParent.id}/${createSlug(selectedParent.name)}`"
                  class="flex items-center gap-1 text-[12px] no-underline font-vazir"
                  style="color: var(--color-nimoura-primary)"
                  @click="close"
                >
                  همه محصولات
                  <i class="pi pi-arrow-left text-[11px]" />
                </NuxtLink>
              </div>

              <!-- Children grid -->
              <div class="space-y-2">
                <div
                  v-for="child in selectedParent.children"
                  :key="child.id"
                  class="overflow-hidden rounded-2xl"
                  style="border: 1px solid color-mix(in srgb, var(--color-nimoura-primary) 14%, transparent); background: #fff"
                >
                  <!-- Child row -->
                  <button
                    v-if="child.children?.length"
                    type="button"
                    class="flex w-full items-center justify-between px-4 py-3.5 transition-colors duration-150 hover-surface"
                    :class="openSubId === child.id ? 'sub-open' : ''"
                    @click="toggleSub(child.id)"
                  >
                    <span
                      class="text-sm font-medium font-vazir"
                      :style="openSubId === child.id ? 'color: var(--color-nimoura-primary)' : 'color: var(--color-nimoura-text-800)'"
                    >
                      {{ child.name }}
                    </span>
                    <span
                      class="flex h-6 w-6 items-center justify-center rounded-full transition-all duration-250"
                      :style="openSubId === child.id
                        ? 'background: color-mix(in srgb, var(--color-nimoura-primary) 15%, transparent); transform: rotate(180deg)'
                        : 'background: #f3f4f6'"
                    >
                      <i
                        class="pi pi-angle-down text-xs text-nimoura-primary"
                      />
                    </span>
                  </button>

                  <NuxtLink
                    v-else
                   :to="`/categories/${child.id}/${createSlug(child.name)}`"
                    class="flex w-full items-center justify-between px-4 py-3.5 no-underline transition-colors duration-150 hover-surface"
                    style="color: var(--color-nimoura-text-800)"
                    @click="close"
                  >
                    <span class="text-sm font-medium font-vazir">{{ child.name }}</span>
                    <i class="pi pi-angle-left text-xs" style="color: var(--color-nimoura-primary); opacity: .6" />
                  </NuxtLink>

                  <!-- Grandchildren -->
                  <Transition
                    enter-active-class="overflow-hidden transition-all duration-300 ease-out"
                    leave-active-class="overflow-hidden transition-all duration-200 ease-in"
                    @enter="onAccordionEnter"
                    @after-enter="onAccordionAfterEnter"
                    @before-leave="onAccordionBeforeLeave"
                    @leave="onAccordionLeave"
                  >
                    <div
                      v-if="openSubId === child.id && child.children?.length"
                      style="border-top: 1px solid color-mix(in srgb, var(--color-nimoura-primary) 10%, transparent);"
                    >
                      <div class="grid grid-cols-2 gap-px p-2">
                        <NuxtLink
                          v-for="gc in child.children"
                          :key="gc.id"
                          :to="`/categories/${gc.id}/${createSlug(gc.name)}`"
                          class="flex items-center gap-2 rounded-xl px-3 py-2.5 no-underline transition-colors duration-150 hover:bg-white"
                          style="color: var(--color-nimoura-text-700)"
                          @click="close"
                        >
                          <span
                            class="h-1.5 w-1.5 shrink-0 rounded-full"
                            style="background: var(--color-nimoura-primary); opacity: .6"
                          />
                          <span class="text-[12px] font-vazir leading-tight">{{ gc.name }}</span>
                        </NuxtLink>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <!-- Empty / initial state -->
            <div v-else key="empty" class="flex h-full flex-col items-center justify-center gap-3 pb-16">
              <div
                class="flex h-20 w-20 items-center justify-center rounded-full"
                style="background: color-mix(in srgb, var(--color-nimoura-primary) 8%, transparent)"
              >
                <i class="pi pi-sparkles text-3xl" style="color: var(--color-nimoura-primary); opacity: .5" />
              </div>
              <p class="text-sm font-vazir" style="color: var(--color-nimoura-text-400)">
                یک دسته‌بندی انتخاب کن
              </p>
            </div>
          </Transition>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Category {
  id: number
  name: string
  slug: string
  parentId: number | null
  icon?: string
  children: Category[]
}

const props = defineProps<{
  modelValue: boolean
  categories?: Category[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const selectedParent = ref<Category | null>(null)
const openSubId      = ref<number | null>(null)

function selectParent(cat: Category) {
  if (selectedParent.value?.id === cat.id) return
  selectedParent.value = cat
  openSubId.value      = null
}

function toggleSub(id: number) {
  openSubId.value = openSubId.value === id ? null : id
}

function close() {
  emit('update:modelValue', false)
}

// ─── Accordion hooks ──────────────────────────
function onAccordionEnter(el: HTMLElement) {
  el.style.maxHeight = '0'
  window.requestAnimationFrame(() => {
    el.style.maxHeight = el.scrollHeight + 'px'
  })
}
function onAccordionAfterEnter(el: HTMLElement) {
  el.style.maxHeight = 'none'
}
function onAccordionBeforeLeave(el: HTMLElement) {
  el.style.maxHeight = el.scrollHeight + 'px'
}
function onAccordionLeave(el: HTMLElement) {
  el.style.maxHeight = '0'
}

watch(() => props.modelValue, (open) => {
  if (open && props.categories?.length && !selectedParent.value) {
    selectedParent.value = props.categories[0]
  }
  if (!open) {
    openSubId.value = null
  }
})
</script>

<style scoped>
.hide-scrollbar            { scrollbar-width: none; -ms-overflow-style: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }

/* Parent chips */
.chip--idle {
  background: #fff;
  color: var(--color-nimoura-text-500);
  border: 1px solid var(--color-nimoura-base);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-nimoura-base) 20%, transparent);
}
.chip--idle:hover {
  background: var(--color-nimoura-base);
  border-color: color-mix(in srgb, var(--color-nimoura-primary) 70%, transparent);
}
.chip--active {
  background: linear-gradient(135deg, #fff 100%, var(--color-nimoura-velvet) 0%);
  color: var(--color-nimoura-primary);
  border: 1px solid var(--color-nimoura-primary);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-nimoura-primary) 20%, transparent);
  transform: translateY(1px);
}

/* Generic subtle hover surface for rows (replaces the old hover:bg-rose-50/30) */
.hover-surface:hover {
  background: color-mix(in srgb, var(--color-nimoura-base) 6%, white);
}

/* Open sub row */
.sub-open {
  background: color-mix(in srgb, var(--color-nimoura-base) 5%, transparent);
}
</style>