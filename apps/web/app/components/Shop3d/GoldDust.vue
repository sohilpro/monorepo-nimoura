<!-- app/components/shop3d/GoldDust.vue -->
<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import {
  AdditiveBlending, BufferAttribute, BufferGeometry,
  DynamicDrawUsage, Points, PointsMaterial,
} from 'three'
import { useLoop } from '@tresjs/core'

const props = withDefaults(defineProps<{ count?: number }>(), { count: 240 })

const theme = getTheme3D()
const { width: W, depth: D, height: H } = STORE

const positions = new Float32Array(props.count * 3)
const speeds = new Float32Array(props.count)
const phases = new Float32Array(props.count)
for (let i = 0; i < props.count; i++) {
  positions[i * 3] = (Math.random() - 0.5) * (W - 1)
  positions[i * 3 + 1] = 0.2 + Math.random() * (H - 0.6)
  positions[i * 3 + 2] = (Math.random() - 0.5) * (D - 1)
  speeds[i] = 0.015 + Math.random() * 0.035 // متر بر ثانیه
  phases[i] = Math.random() * Math.PI * 2
}

const attr = new BufferAttribute(positions, 3)
attr.setUsage(DynamicDrawUsage)
const geometry = new BufferGeometry()
geometry.setAttribute('position', attr)

// شامپاینی-رزگلد (مشتق از پالت)
const dustColor = theme.color.primary.clone().lerp(theme.color.base, 0.6)

const material = new PointsMaterial({
  map: getSoftSpriteTexture(),
  color: dustColor,
  size: 0.05,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
  blending: AdditiveBlending,
})

const points = new Points(geometry, material)
points.frustumCulled = false

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta, elapsed }) => {
  for (let i = 0; i < props.count; i++) {
    const ix = i * 3
    positions[ix + 1]! += speeds[i]! * delta
    if (positions[ix + 1]! > H - 0.1) positions[ix + 1] = 0.2
    positions[ix]! += Math.sin(elapsed * 0.35 + phases[i]!) * 0.04 * delta
    positions[ix + 2]! += Math.cos(elapsed * 0.3 + phases[i]!) * 0.04 * delta
  }
  attr.needsUpdate = true
})

onBeforeUnmount(() => {
  geometry.dispose()
  material.dispose()
})
</script>

<template>
  <primitive :object="points" />
</template>