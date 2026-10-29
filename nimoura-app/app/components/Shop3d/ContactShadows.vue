<!-- app/components/shop3d/ContactShadows.vue -->
<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import type { CanvasTexture } from 'three'

const theme = getTheme3D()
const HALF_PI = Math.PI / 2
const MARGIN = 0.2
const Y = 0.013 // بالاتر از فرش‌ها (۰.۰۰۹)

interface Item {
  key: string
  x: number
  z: number
  rotY: number
  w: number
  d: number
  round: boolean
  opacity: number
}

const { island, counter } = FURNITURE

const items: Item[] = [
  ...ALL_SHELVES.map((s) => ({
    key: s.id, x: s.position[0], z: s.position[2], rotY: s.rotationY,
    w: s.width, d: s.depth, round: false, opacity: 0.5,
  })),
  {
    key: 'island', x: island.position[0], z: island.position[2], rotY: 0,
    w: island.radius * 2, d: island.radius * 2, round: true, opacity: 0.55,
  },
  {
    key: 'counter', x: counter.position[0], z: counter.position[2], rotY: counter.rotationY,
    w: counter.size[0] + 0.1, d: counter.size[2] + 0.1, round: false, opacity: 0.5,
  },
  ...POUFS.map((p) => ({
    key: p.id, x: p.position[0], z: p.position[2], rotY: 0, w: 0.68, d: 0.68, round: true, opacity: 0.45,
  })),
  ...PLANTS.map((p) => ({
    key: p.id, x: p.position[0], z: p.position[2], rotY: 0,
    w: 0.32 * p.scale, d: 0.32 * p.scale, round: true, opacity: 0.4,
  })),
]

// تکسچرهای هم‌اندازه به اشتراک گذاشته می‌شوند
const cache = new Map<string, CanvasTexture>()
function textureFor(i: Item) {
  const k = `${i.w.toFixed(2)}x${i.d.toFixed(2)}${i.round ? 'r' : 'b'}`
  let t = cache.get(k)
  if (!t) {
    t = createContactShadowTexture(i.w, i.d, i.round, MARGIN)
    cache.set(k, t)
  }
  return t
}

const entries = items.map((i) => ({
  ...i,
  map: textureFor(i),
  size: [i.w + MARGIN * 2, i.d + MARGIN * 2] as [number, number],
}))

onBeforeUnmount(() => cache.forEach((t) => t.dispose()))
</script>

<template>
  <TresGroup name="contact-shadows">
    <TresGroup v-for="e in entries" :key="e.key" :position="[e.x, Y, e.z]" :rotation="[0, e.rotY, 0]">
      <TresMesh :rotation="[-HALF_PI, 0, 0]">
        <TresPlaneGeometry :args="e.size" />
        <TresMeshBasicMaterial
          :map="e.map"
          :color="theme.hex['text-900']"
          :transparent="true"
          :opacity="e.opacity"
          :depth-write="false"
        />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>