<!-- app/components/shop3d/DebugColliders.vue -->
<script setup lang="ts">
const items = COLLIDERS.map((c, key) =>
  c.type === 'box'
    ? { key, kind: 'box' as const, x: (c.minX + c.maxX) / 2, z: (c.minZ + c.maxZ) / 2, w: c.maxX - c.minX, d: c.maxZ - c.minZ, r: 0 }
    : { key, kind: 'circle' as const, x: c.x, z: c.z, w: 0, d: 0, r: c.r },
)
</script>

<template>
  <TresGroup>
    <TresMesh v-for="i in items" :key="i.key" :position="[i.x, 0.5, i.z]">
      <TresBoxGeometry v-if="i.kind === 'box'" :args="[i.w, 1, i.d]" />
      <TresCylinderGeometry v-else :args="[i.r, i.r, 1, 32]" />
      <TresMeshBasicMaterial color="#ff2d55" :transparent="true" :opacity="0.35" :depth-write="false" />
    </TresMesh>
  </TresGroup>
</template>