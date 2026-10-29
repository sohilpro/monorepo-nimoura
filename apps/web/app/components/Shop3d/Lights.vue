<!-- app/components/shop3d/Lights.vue -->
<script setup lang="ts">
import { onMounted, ref } from "vue";

const q = useShopQuality();
const theme = getTheme3D();
const [ix, , iz] = FURNITURE.island.position;
const H = STORE.height;

// نور برگشتی: آسمان کرم، زمین صورتی ملایم
const skyColor = theme.hex.base;
const groundColor =
  "#" +
  theme.color.accent.clone().lerp(theme.color.primary, 0.35).getHexString();

// spot باید دقیقاً روی جزیره نشانه برود
const spot = ref<any>(null);
onMounted(() => {
  const l = spot.value;
  if (!l) return;
  l.parent?.add(l.target);
  l.target.position.set(ix, 0.8, iz);
  l.target.updateMatrixWorld();
});
</script>

<template>
  <TresAmbientLight :color="theme.derived.warmLight" :intensity="0.3" />
  <TresHemisphereLight :args="[skyColor, groundColor, 0.5]" />

  <TresDirectionalLight
    :color="theme.derived.warmLight"
    :intensity="1.0"
    :position="[3, 3.2, 2.5]"
  />

  <!-- spotlight روی جزیره مرکزی -->
  <TresSpotLight
    v-if="q.extraLights"
    ref="spot"
    :position="[ix, H - 0.35, iz]"
    :color="theme.derived.warmLight"
    :intensity="30"
    :angle="0.55"
    :penumbra="0.9"
    :decay="2"
    :distance="0"
  />
</template>
