<!-- app/components/shop3d/Shelf.vue -->
<script setup lang="ts">
import { AdditiveBlending } from "three";

const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
    depth?: number;
    tiers?: number;
    color?: string;
    trim?: string;
    backColor?: string;
    kickColor?: string;
    withBack?: boolean;
    glow?: boolean;
  }>(),
  {
    width: 1.9,
    height: 2.3,
    depth: 0.45,
    tiers: 5,
    withBack: true,
    glow: true,
  },
);

const theme = getTheme3D();
const q = useShopQuality();
const { board: B, side: S, kick: K, back: BK } = SHELF;

const bodyColor = computed(() => props.color ?? theme.hex.base);
const trimColor = computed(() => props.trim ?? theme.hex.primary);
const backPanelColor = computed(
  () => props.backColor ?? theme.derived.wainscot,
);
const kickBodyColor = computed(() => props.kickColor ?? theme.hex.velvet);

const innerW = computed(() => props.width - 2 * S);
const bodyH = computed(() => props.height - K);
const midY = computed(() => (props.height + K) / 2);

const tierStep = computed(() => (props.height - K - B) / props.tiers);
const boards = computed(() =>
  Array.from({ length: props.tiers + 1 }, (_, i) => ({
    i,
    y: K + i * tierStep.value + B / 2,
  })),
);

/* ---- نور ---- */
// ریسه: HDR وقتی Bloom فعال است
const stripColor = glowColor(theme.derived.warmLight, 5, q.bloom);
const washTex = getGlowGradientTexture();
const washH = computed(() => tierStep.value - B - 0.012);
</script>

<template>
  <TresGroup>
    <!-- پایه عقب‌نشسته -->
    <TresMesh :position="[0, K / 2, 0]">
      <TresBoxGeometry :args="[width - 0.06, K, depth - 0.06]" />
      <TresMeshStandardMaterial :color="kickBodyColor" :roughness="0.7" />
    </TresMesh>

    <!-- پنل‌های کناری + لبه رزگلد -->
    <template v-for="sx in [-1, 1]" :key="sx">
      <TresMesh :position="[sx * (width / 2 - S / 2), midY, 0]">
        <TresBoxGeometry :args="[S, bodyH, depth]" />
        <TresMeshStandardMaterial :color="bodyColor" :roughness="0.6" />
      </TresMesh>
      <TresMesh :position="[sx * (width / 2 - S / 2), midY, depth / 2 + 0.005]">
        <TresBoxGeometry :args="[S, bodyH, 0.01]" />
        <TresMeshStandardMaterial
          :color="trimColor"
          :metalness="0.7"
          :roughness="0.3"
        />
      </TresMesh>
    </template>

    <!-- پنل پشتی -->
    <TresMesh v-if="withBack" :position="[0, midY, -depth / 2 + BK / 2]">
      <TresBoxGeometry :args="[innerW, bodyH, BK]" />
      <TresMeshStandardMaterial :color="backPanelColor" :roughness="0.85" />
    </TresMesh>

    <!-- طبقه‌ها -->
    <template v-for="b in boards" :key="b.i">
      <TresMesh :position="[0, b.y, BK / 2]">
        <TresBoxGeometry :args="[innerW, B, depth - BK]" />
        <TresMeshStandardMaterial :color="bodyColor" :roughness="0.55" />
      </TresMesh>

      <TresMesh :position="[0, b.y, depth / 2 + 0.005]">
        <TresBoxGeometry :args="[innerW, B + 0.004, 0.01]" />
        <TresMeshStandardMaterial
          :color="trimColor"
          :metalness="0.7"
          :roughness="0.3"
        />
      </TresMesh>

      <!-- زیر هر طبقه (به‌جز کف): ریسه نور + نورتابش روی پنل پشتی -->
      <template v-if="glow && b.i > 0">
        <TresMesh :position="[0, b.y - B / 2 - 0.006, depth / 2 - 0.05]">
          <TresBoxGeometry :args="[innerW - 0.06, 0.012, 0.03]" />
          <TresMeshBasicMaterial :color="stripColor" :tone-mapped="false" />
        </TresMesh>

        <TresMesh
          v-if="q.washes"
          :position="[
            0,
            b.y - B / 2 - 0.012 - washH / 2,
            -depth / 2 + BK + 0.003,
          ]"
        >
          <TresPlaneGeometry :args="[innerW - 0.02, washH]" />
          <TresMeshBasicMaterial
            :map="washTex"
            :color="theme.derived.warmLight"
            :transparent="true"
            :opacity="0.5"
            :depth-write="false"
            :blending="AdditiveBlending"
            :tone-mapped="false"
          />
        </TresMesh>
      </template>
    </template>
  </TresGroup>
</template>
