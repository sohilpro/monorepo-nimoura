<!-- app/components/shop3d/Mirror.vue -->
<script setup lang="ts">
import { Path, Shape } from 'three'

const props = withDefaults(defineProps<{ width?: number; height?: number }>(), {
  width: 0.9,
  height: 1.6,
})

const theme = getTheme3D()
const a = props.width / 2
const b = props.height / 2
const FRAME = 0.05

// سطح آینه
const glass = new Shape()
glass.absellipse(0, 0, a, b, 0, Math.PI * 2, false, 0)

// قاب = بیضی بزرگ با سوراخ بیضی کوچک
const frame = new Shape()
frame.absellipse(0, 0, a + FRAME, b + FRAME, 0, Math.PI * 2, false, 0)
const hole = new Path()
hole.absellipse(0, 0, a, b, 0, Math.PI * 2, true, 0)
frame.holes.push(hole)
</script>

<template>
  <!-- +Z محلی = جهت نگاه آینه -->
  <TresGroup>
    <TresMesh>
      <TresExtrudeGeometry :args="[frame, { depth: 0.04, bevelEnabled: false, curveSegments: 64 }]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.7" :roughness="0.3" />
    </TresMesh>
    <TresMesh :position="[0, 0, 0.012]">
      <TresShapeGeometry :args="[glass, 64]" />
      <TresMeshStandardMaterial
        color="#f3eef0"
        :metalness="0.15"
        :roughness="0.05"
        :emissive="theme.hex.accent"
        :emissive-intensity="0.25"
      />
    </TresMesh>
  </TresGroup>
</template>