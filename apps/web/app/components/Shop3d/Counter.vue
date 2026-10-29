<!-- app/components/shop3d/Counter.vue -->
<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { AdditiveBlending, Color } from "three";

const theme = getTheme3D();
const q = useShopQuality();
const [L, H, DP] = FURNITURE.counter.size;

const sign = createSignTexture(theme);
onBeforeUnmount(() => sign.dispose());

// HDR برای Bloom (روی دستگاه ضعیف: رنگ عادی)
const logoTint = q.bloom ? new Color(9, 9, 9) : new Color(1, 1, 1);
const haloTex = getSoftSpriteTexture();
</script>

<template>
  <!-- +Z محلی = سمت مشتری -->
  <TresGroup>
    <!-- بدنه -->
    <TresMesh :position="[0, (H - 0.05) / 2, 0]">
      <TresBoxGeometry :args="[L, H - 0.05, DP]" />
      <TresMeshStandardMaterial :color="theme.hex.velvet" :roughness="0.95" />
    </TresMesh>

    <!-- رویه -->
    <TresMesh :position="[0, H - 0.025, 0.02]">
      <TresBoxGeometry :args="[L + 0.1, 0.05, DP + 0.1]" />
      <TresMeshStandardMaterial
        :color="theme.hex.base"
        :roughness="0.25"
        :metalness="0.05"
      />
    </TresMesh>

    <!-- نوارهای رزگلد بالا و پایین -->
    <TresMesh :position="[0, 0.08, DP / 2 + 0.004]">
      <TresBoxGeometry :args="[L, 0.04, 0.012]" />
      <TresMeshStandardMaterial
        :color="theme.hex.primary"
        :metalness="0.7"
        :roughness="0.3"
      />
    </TresMesh>
    <TresMesh :position="[0, H - 0.1, DP / 2 + 0.004]">
      <TresBoxGeometry :args="[L, 0.04, 0.012]" />
      <TresMeshStandardMaterial
        :color="theme.hex.primary"
        :metalness="0.7"
        :roughness="0.3"
      />
    </TresMesh>

    <!-- هاله پشت لوگو -->
    <TresMesh :position="[0, 0.52, DP / 2 + 0.006]">
      <TresPlaneGeometry :args="[2.6, 0.95]" />
      <TresMeshBasicMaterial
        :map="haloTex"
        :color="theme.hex.primary"
        :transparent="true"
        :opacity="0.4"
        :depth-write="false"
        :blending="AdditiveBlending"
        :tone-mapped="false"
      />
    </TresMesh>

    <!-- لوگوی NIMOURA -->
    <TresMesh :position="[0, 0.52, DP / 2 + 0.01]">
      <TresPlaneGeometry :args="[1.6, 0.4]" />
      <TresMeshBasicMaterial
        :map="sign"
        :color="logoTint"
        :transparent="true"
        :tone-mapped="false"
      />
    </TresMesh>

    <!-- تبلت صندوق و کارت‌خوان -->
    <TresMesh :position="[-0.8, H + 0.008, 0.05]">
      <TresBoxGeometry :args="[0.3, 0.016, 0.2]" />
      <TresMeshStandardMaterial
        :color="theme.hex['text-900']"
        :roughness="0.3"
      />
    </TresMesh>
    <TresMesh :position="[-0.4, H + 0.015, 0.12]">
      <TresBoxGeometry :args="[0.08, 0.03, 0.12]" />
      <TresMeshStandardMaterial
        :color="theme.hex.primary"
        :metalness="0.7"
        :roughness="0.3"
      />
    </TresMesh>

    <!-- گلدان کوچک روی پیشخوان -->
    <Shop3dPlant :position="[1.0, H, -0.1]" :scale="[0.55, 0.55, 0.55]" />
  </TresGroup>
</template>
