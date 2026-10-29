<!-- app/components/shop3d/Pouf.vue -->
<script setup lang="ts">
const theme = getTheme3D()
</script>

<template>
  <TresGroup>
    <TresMesh :position="[0, 0.02, 0]">
      <TresCylinderGeometry :args="[0.3, 0.3, 0.04, 40]" />
      <TresMeshStandardMaterial :color="theme.hex.primary" :metalness="0.7" :roughness="0.3" />
    </TresMesh>
    <TresMesh :position="[0, 0.22, 0]">
      <TresCylinderGeometry :args="[0.34, 0.34, 0.36, 48]" />
      <TresMeshStandardMaterial :color="theme.hex.velvet" :roughness="1" />
    </TresMesh>
    <TresMesh :position="[0, 0.4, 0]" :scale="[1, 0.25, 1]">
      <TresSphereGeometry :args="[0.34, 32, 16]" />
      <TresMeshStandardMaterial :color="theme.hex.accent" :roughness="1" />
    </TresMesh>
  </TresGroup>
</template>