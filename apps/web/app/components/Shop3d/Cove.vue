<!-- app/components/shop3d/Cove.vue -->
<script setup lang="ts">
import { AdditiveBlending, DoubleSide } from 'three'
import type { Vec3 } from '~/utils/storeDimensions'

const theme = getTheme3D()
const q = useShopQuality()
const { width: W, depth: D, height: H } = STORE
const HALF_PI = Math.PI / 2

const washTex = getGlowGradientTexture()
const stripColor = glowColor(theme.derived.warmLight, 4, q.bloom)

// هر دیوار: گروه با محور z محلی به سمت داخل مغازه
const sides: { key: string; pos: Vec3; rotY: number; len: number }[] = [
  { key: 'back', pos: [0, 0, -D / 2], rotY: 0, len: W },
  { key: 'left', pos: [-W / 2, 0, 0], rotY: HALF_PI, len: D },
  { key: 'right', pos: [W / 2, 0, 0], rotY: -HALF_PI, len: D },
]
</script>

<template>
  <TresGroup>
    <TresGroup v-for="s in sides" :key="s.key" :position="s.pos" :rotation="[0, s.rotY, 0]">
      <!-- ریسه زیر قرنیز -->
      <TresMesh :position="[0, H - 0.155, 0.112]">
        <TresBoxGeometry :args="[s.len - 0.3, 0.012, 0.02]" />
        <TresMeshBasicMaterial :color="stripColor" :tone-mapped="false" />
      </TresMesh>

      <!-- نور روی سقف (روشن کنار دیوار، محو به سمت وسط) -->
      <TresMesh :position="[0, H - 0.006, 0.67]" :rotation="[-HALF_PI, 0, 0]">
        <TresPlaneGeometry :args="[s.len - 0.2, 1.1]" />
        <TresMeshBasicMaterial
          :map="washTex"
          :color="theme.derived.warmLight"
          :transparent="true"
          :opacity="0.4"
          :depth-write="false"
          :blending="AdditiveBlending"
          :side="DoubleSide"
          :tone-mapped="false"
        />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>