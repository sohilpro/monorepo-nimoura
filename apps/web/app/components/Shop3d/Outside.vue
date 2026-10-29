<!-- app/components/shop3d/Outside.vue -->
<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

const theme = getTheme3D()
const D = STORE.depth
const HALF_PI = Math.PI / 2

const sky = createOutsideTexture(theme)
onBeforeUnmount(() => sky.dispose())

const ground = '#' + theme.color.velvet.clone().lerp(theme.color['text-900'], 0.5).getHexString()
</script>

<template>
  <TresGroup>
    <!-- زمین بیرون -->
    <TresMesh :position="[0, -0.004, D / 2 + 3.2]" :rotation="[-HALF_PI, 0, 0]">
      <TresPlaneGeometry :args="[16, 6.4]" />
      <TresMeshBasicMaterial :color="ground" />
    </TresMesh>

    <!-- آسمان غروب (رو به داخل مغازه) -->
    <TresMesh :position="[0, 2.4, D / 2 + 6.4]" :rotation="[0, Math.PI, 0]">
      <TresPlaneGeometry :args="[18, 7]" />
      <TresMeshBasicMaterial :map="sky" :tone-mapped="false" />
    </TresMesh>
  </TresGroup>
</template>