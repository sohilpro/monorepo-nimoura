<!-- app/components/shop3d/Plant.vue -->
<script setup lang="ts">
import { DoubleSide, Vector2 } from 'three'
import type { Vec3 } from '~/utils/storeDimensions'

defineProps<{ color?: string }>()

const theme = getTheme3D()

// پروفایل گلدان (نصف مقطع که حول محور Y چرخانده می‌شود)
const profile = (
  [
    [0, 0], [0.1, 0], [0.14, 0.05], [0.16, 0.18],
    [0.12, 0.34], [0.07, 0.42], [0.085, 0.46],
  ] as [number, number][]
).map(([x, y]) => new Vector2(x, y))

// ۹ شاخه با پراکندگی ثابت (زاویه طلایی)، بدون Math.random تا هر بار یکسان باشد
const stems = Array.from({ length: 9 }, (_, i) => {
  const angle = i * 2.399963
  const tilt = 0.1 + (i % 4) * 0.07
  return {
    rot: [Math.sin(angle) * tilt, 0, Math.cos(angle) * tilt] as Vec3,
    len: 0.75 + (i % 3) * 0.14,
    blossom: i % 2 === 0 ? theme.hex.accent : theme.hex.primary,
  }
})
</script>

<template>
  <TresGroup>
    <TresMesh>
      <TresLatheGeometry :args="[profile, 32]" />
      <TresMeshStandardMaterial
        :color="color ?? theme.hex.accent"
        :roughness="0.35"
        :metalness="0.1"
        :side="DoubleSide"
      />
    </TresMesh>

    <TresGroup v-for="(s, i) in stems" :key="i" :position="[0, 0.44, 0]" :rotation="s.rot">
      <TresMesh :position="[0, s.len / 2, 0]">
        <TresCylinderGeometry :args="[0.004, 0.004, s.len, 6]" />
        <TresMeshStandardMaterial :color="theme.hex['text-500']" :roughness="0.9" />
      </TresMesh>
      <TresMesh :position="[0, s.len, 0]" :scale="[1, 2.4, 1]">
        <TresSphereGeometry :args="[0.045, 12, 10]" />
        <TresMeshStandardMaterial :color="s.blossom" :roughness="0.9" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>