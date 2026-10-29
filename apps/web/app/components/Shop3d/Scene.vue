<!-- app/components/shop3d/Scene.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { OrbitControls, Stats } from '@tresjs/cientos'

defineProps<{ debug?: boolean; colliders?: boolean; fps?: boolean }>()

const q = useShopQuality()
const perf = useShopPerf()
const [sx, sz] = START_VIEW.position
const cameraPosition: [number, number, number] = [sx, STORE.eyeHeight, sz]
const cameraRef = shallowRef<any>(null)

const stage = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []

onMounted(() => {
  // بعد از چند فریم اول، تا اتاق فوراً دیده شود
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      stage.value = 1
      timers.push(setTimeout(() => (stage.value = 2), 350))
    }),
  )
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  disposeSharedTextures()
})
</script>

<template>
  <!-- :fov="62" -->
  <TresPerspectiveCamera ref="cameraRef" :position="cameraPosition"  :near="0.1" :far="60" />

  <OrbitControls v-if="debug" :target="[0, 1.4, -1]" make-default />
  <Shop3dPlayerController v-else :camera="cameraRef" />
  <Shop3dPerfMonitor />

  <!-- مرحله ۰: پوسته -->
  <Shop3dEnvironment :intensity="0.6" />
  <Shop3dLights />
  <Shop3dStaticBatch :enabled="q.batch">
    <Shop3dRoom />
    <Shop3dCove />
    <Shop3dEntranceFrame />
    <Shop3dOutside />
    <Shop3dFurniture />
  </Shop3dStaticBatch>

  <!-- مرحله ۱: محتوا -->
  <template v-if="stage >= 1">
    <Shop3dProducts />
    <Shop3dProductInteraction :camera="cameraRef" />
    <Shop3dStaticBatch :enabled="q.batch">
      <Shop3dChandelier />
    </Shop3dStaticBatch>
  </template>

  <!-- مرحله ۲: تزئینات -->
  <template v-if="stage >= 2">
    <Shop3dStaticBatch :enabled="q.batch">
      <Shop3dContactShadows />
    </Shop3dStaticBatch>
    <Shop3dGoldDust v-if="q.dust > 0 && !perf.dustOff.value" :count="q.dust" />
    <LazyShop3dEffects v-if="q.bloom" />
  </template>

  <LazyShop3dDebugColliders v-if="colliders" />
  <Stats v-if="fps" />
</template>