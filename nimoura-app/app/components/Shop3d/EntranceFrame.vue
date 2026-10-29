<!-- app/components/shop3d/EntranceFrame.vue -->
<script setup lang="ts">
import type { Vec3 } from '~/utils/storeDimensions'

const theme = getTheme3D()
const { depth: D, wall: T, door } = STORE

const POST = 0.12
const FRAME_DEPTH = T + 0.08
const z = D / 2 + T / 2

const leftPost: Vec3 = [-(door.width / 2 + POST / 2), door.height / 2, z]
const rightPost: Vec3 = [door.width / 2 + POST / 2, door.height / 2, z]
const beam: Vec3 = [0, door.height - POST / 2, z]
</script>

<template>
  <TresGroup>
    <TresMesh :position="leftPost" cast-shadow>
      <TresBoxGeometry :args="[POST, door.height, FRAME_DEPTH]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.6" :roughness="0.35" />
    </TresMesh>

    <TresMesh :position="rightPost" cast-shadow>
      <TresBoxGeometry :args="[POST, door.height, FRAME_DEPTH]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.6" :roughness="0.35" />
    </TresMesh>

    <TresMesh :position="beam" cast-shadow>
      <TresBoxGeometry :args="[door.width + POST * 2, POST, FRAME_DEPTH]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.6" :roughness="0.35" />
    </TresMesh>
  </TresGroup>
</template>