<!-- app/components/shop3d/Rugs.vue -->
<script setup lang="ts">
const theme = getTheme3D()
const HALF_PI = Math.PI / 2
const [ix, , iz] = FURNITURE.island.position

const velvetSoft =
  '#' + theme.color.velvet.clone().lerp(theme.color.accent, 0.25).getHexString()
</script>

<template>
  <TresGroup>
    <!-- فرش گرد زیر جزیره. گروه خوابیده و z محلی = ارتفاع از کف است -->
    <TresGroup :position="[ix, 0, iz]" :rotation="[-HALF_PI, 0, 0]">
      <TresMesh :position="[0, 0, 0.006]">
        <TresCircleGeometry :args="[2.4, 96]" />
        <TresMeshStandardMaterial :color="theme.hex.accent" :roughness="1" />
      </TresMesh>
      <TresMesh :position="[0, 0, 0.009]">
        <TresRingGeometry :args="[2.15, 2.22, 96]" />
        <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.5" :roughness="0.4" />
      </TresMesh>
      <TresMesh :position="[0, 0, 0.009]">
        <TresRingGeometry :args="[1.9, 1.93, 96]" />
        <TresMeshStandardMaterial :color="theme.hex.base" :roughness="1" />
      </TresMesh>
      <TresMesh :position="[0, 0, 0.008]">
        <TresCircleGeometry :args="[1.7, 96]" />
        <TresMeshStandardMaterial :color="velvetSoft" :roughness="1" />
      </TresMesh>
    </TresGroup>

    <!-- رانر مخملی ورودی -->
    <TresGroup :position="[0, 0, 3.1]" :rotation="[-HALF_PI, 0, 0]">
      <TresMesh :position="[0, 0, 0.006]">
        <TresPlaneGeometry :args="[1.8, 2.6]" />
        <TresMeshStandardMaterial :color="theme.hex.velvet" :roughness="1" />
      </TresMesh>
      <TresMesh :position="[-0.82, 0, 0.009]">
        <TresPlaneGeometry :args="[0.04, 2.5]" />
        <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.5" :roughness="0.4" />
      </TresMesh>
      <TresMesh :position="[0.82, 0, 0.009]">
        <TresPlaneGeometry :args="[0.04, 2.5]" />
        <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.5" :roughness="0.4" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>