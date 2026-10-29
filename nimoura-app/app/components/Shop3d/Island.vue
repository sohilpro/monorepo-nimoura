<!-- app/components/shop3d/Island.vue -->
<script setup lang="ts">
const theme = getTheme3D()
const { position, radius: R, tier2Radius: R2 } = FURNITURE.island
</script>

<template>
  <TresGroup :position="position">
    <!-- پلینت رزگلد پایین -->
    <TresMesh :position="[0, 0.03, 0]">
      <TresCylinderGeometry :args="[R - 0.02, R - 0.02, 0.06, 64]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.7" :roughness="0.3" />
    </TresMesh>

    <!-- بدنه مخملی -->
    <TresMesh :position="[0, 0.42, 0]">
      <TresCylinderGeometry :args="[R - 0.05, R - 0.05, 0.72, 64]" />
      <TresMeshStandardMaterial :color="theme.hex.velvet" :roughness="1" />
    </TresMesh>

    <!-- حلقه رزگلد زیر شیشه -->
    <TresMesh :position="[0, 0.79, 0]" :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[R - 0.03, 0.022, 16, 96]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.7" :roughness="0.3" />
    </TresMesh>

    <!-- رویه شیشه‌ای -->
    <TresMesh :position="[0, 0.8, 0]">
      <TresCylinderGeometry :args="[R, R, 0.02, 64]" />
      <TresMeshStandardMaterial
        color="#ffffff"
        :transparent="true"
        :opacity="0.28"
        :roughness="0.05"
        :metalness="0.1"
        :depth-write="false"
      />
    </TresMesh>

    <!-- پایه بالایی برای محصولات ویژه -->
    <TresMesh :position="[0, 0.98, 0]">
      <TresCylinderGeometry :args="[R2, R2 + 0.04, 0.34, 48]" />
      <TresMeshStandardMaterial :color="theme.hex.velvet" :roughness="1" />
    </TresMesh>
    <TresMesh :position="[0, 1.15, 0]">
      <TresCylinderGeometry :args="[R2 + 0.02, R2 + 0.02, 0.02, 48]" />
      <TresMeshStandardMaterial :color="theme.hex.accent" :roughness="0.4" :metalness="0.2" />
    </TresMesh>
  </TresGroup>
</template>