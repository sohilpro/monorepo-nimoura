<!-- app/components/shop3d/Furniture.vue -->
<script setup lang="ts">
const theme = getTheme3D()
const { counter } = FURNITURE
</script>

<template>
  <TresGroup name="furniture">
    <Shop3dRugs />

    <!-- همه قفسه‌ها از روی layout -->
    <Shop3dShelf
      v-for="s in ALL_SHELVES"
      :key="s.id"
      :position="s.position"
      :rotation="[0, s.rotationY, 0]"
      :width="s.width"
      :height="s.height"
      :depth="s.depth"
      :tiers="s.tiers"
      :color="s.variant === 'alcove' ? theme.hex.velvet : theme.hex.base"
      :back-color="theme.derived.wainscot"
      :kick-color="theme.hex.velvet"
      :trim="theme.hex.primary"
      :with-back="s.variant !== 'alcove'"
    />

    <Shop3dArchAlcove v-for="x in ALCOVE.xs" :key="x" :position="[x, 0, ALCOVE_Z]" />

    <Shop3dIsland />
    <Shop3dCounter :position="counter.position" :rotation="[0, counter.rotationY, 0]" />

    <Shop3dMirror
      v-for="m in MIRRORS"
      :key="m.id"
      :position="m.position"
      :rotation="[0, m.rotationY, 0]"
      :width="m.width"
      :height="m.height"
    />

    <Shop3dPlant
      v-for="p in PLANTS"
      :key="p.id"
      :position="p.position"
      :scale="[p.scale, p.scale, p.scale]"
    />

    <Shop3dPouf v-for="p in POUFS" :key="p.id" :position="p.position" />
  </TresGroup>
</template>