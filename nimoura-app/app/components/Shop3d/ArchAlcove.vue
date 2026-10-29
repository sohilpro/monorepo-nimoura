<!-- app/components/shop3d/ArchAlcove.vue -->
<script setup lang="ts">
import { Shape } from 'three'

const theme = getTheme3D()
const { innerWidth, frame: F, rectHeight: RH, backingDepth, frameDepth } = ALCOVE
const R = innerWidth / 2

// پس‌زمینه: مخمل کمی روشن‌تر تا از دیوار جدا شود
const backingColor =
  '#' + theme.color.velvet.clone().lerp(theme.color.primary, 0.2).getHexString()

// شکل طاق پر (پس‌زمینه)
const backing = new Shape()
backing.moveTo(-R, 0)
backing.lineTo(R, 0)
backing.lineTo(R, RH)
backing.absarc(0, RH, R, 0, Math.PI, false)
backing.lineTo(-R, 0)

// قاب ∩ شکل (بدون ضلع پایین)
const frame = new Shape()
frame.moveTo(-(R + F), 0)
frame.lineTo(-R, 0)
frame.lineTo(-R, RH)
frame.absarc(0, RH, R, Math.PI, 0, true)
frame.lineTo(R, 0)
frame.lineTo(R + F, 0)
frame.lineTo(R + F, RH)
frame.absarc(0, RH, R + F, 0, Math.PI, false)
frame.lineTo(-(R + F), 0)

const medallionY = RH + R * 0.55
</script>

<template>
  <TresGroup>
    <TresMesh>
      <TresExtrudeGeometry :args="[backing, { depth: backingDepth, bevelEnabled: false, curveSegments: 48 }]" />
      <TresMeshStandardMaterial :color="backingColor" :roughness="0.9" />
    </TresMesh>

    <TresMesh>
      <TresExtrudeGeometry :args="[frame, { depth: frameDepth, bevelEnabled: false, curveSegments: 48 }]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.7" :roughness="0.3" />
    </TresMesh>

    <!-- مدال تزئینی بالای طاق -->
    <TresMesh :position="[0, medallionY, backingDepth + 0.005]">
      <TresTorusGeometry :args="[0.3, 0.018, 12, 56]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.7" :roughness="0.3" />
    </TresMesh>
    <TresMesh :position="[0, medallionY, backingDepth + 0.005]">
      <TresTorusGeometry :args="[0.17, 0.012, 12, 40]" />
      <TresMeshStandardMaterial :color="theme.hex.accent" :metalness="0.4" :roughness="0.4" />
    </TresMesh>
  </TresGroup>
</template>