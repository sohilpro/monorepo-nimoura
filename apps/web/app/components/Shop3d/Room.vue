<!-- app/components/shop3d/Room.vue -->
<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import type { Vec3 } from '~/utils/storeDimensions'

const theme = getTheme3D()
const { width: W, depth: D, height: H, wall: T, door } = STORE
const HALF_PI = Math.PI / 2

/* ---------- کف ---------- */
const floorTexture = createFloorTexture(theme, [W / 1.5, D / 1.5]) // کاشی ۱.۵ متری
onBeforeUnmount(() => floorTexture.dispose())

/* ---------- دیوارها ---------- */
const frontSideWidth = (W + 2 * T - door.width) / 2
const frontSideX = door.width / 2 + frontSideWidth / 2
const frontZ = D / 2 + T / 2

interface Part { key: string; pos: Vec3; args: Vec3; color: string }

const walls: Part[] = [
  // پشتی: مخملی (بخش آرایش)
  { key: 'back', pos: [0, H / 2, -(D / 2 + T / 2)], args: [W + 2 * T, H, T], color: theme.hex.velvet },
  { key: 'left', pos: [-(W / 2 + T / 2), H / 2, 0], args: [T, H, D], color: theme.derived.wall },
  { key: 'right', pos: [W / 2 + T / 2, H / 2, 0], args: [T, H, D], color: theme.derived.wall },
  // دیوار ورودی: دو تکه + سردر
  { key: 'front-left', pos: [-frontSideX, H / 2, frontZ], args: [frontSideWidth, H, T], color: theme.derived.wall },
  { key: 'front-right', pos: [frontSideX, H / 2, frontZ], args: [frontSideWidth, H, T], color: theme.derived.wall },
  {
    key: 'front-lintel',
    pos: [0, door.height + (H - door.height) / 2, frontZ],
    args: [door.width, H - door.height, T],
    color: theme.derived.wall,
  },
]

/* ---------- تزئینات: پنل پایین دیوار، ریل رزگلد، قرنیز بالا ---------- */
const wainscot: Part[] = [
  { key: 'w-back', pos: [0, 0.5, -D / 2 + 0.02], args: [W, 1, 0.04], color: theme.derived.wainscot },
  { key: 'w-left', pos: [-W / 2 + 0.02, 0.5, 0], args: [0.04, 1, D], color: theme.derived.wainscot },
  { key: 'w-right', pos: [W / 2 - 0.02, 0.5, 0], args: [0.04, 1, D], color: theme.derived.wainscot },
]

const rails: Part[] = [
  { key: 'r-back', pos: [0, 1.02, -D / 2 + 0.035], args: [W, 0.04, 0.07], color: theme.hex.primary },
  { key: 'r-left', pos: [-W / 2 + 0.035, 1.02, 0], args: [0.07, 0.04, D], color: theme.hex.primary },
  { key: 'r-right', pos: [W / 2 - 0.035, 1.02, 0], args: [0.07, 0.04, D], color: theme.hex.primary },
]

const crown: Part[] = [
  { key: 'c-back', pos: [0, H - 0.07, -D / 2 + 0.05], args: [W, 0.14, 0.1], color: theme.hex.accent },
  { key: 'c-left', pos: [-W / 2 + 0.05, H - 0.07, 0], args: [0.1, 0.14, D], color: theme.hex.accent },
  { key: 'c-right', pos: [W / 2 - 0.05, H - 0.07, 0], args: [0.1, 0.14, D], color: theme.hex.accent },
]
</script>

<template>
  <TresGroup>
    <!-- کف -->
    <TresMesh :rotation="[-HALF_PI, 0, 0]" receive-shadow>
      <TresPlaneGeometry :args="[W, D]" />
      <TresMeshStandardMaterial :map="floorTexture" :roughness="0.35" :metalness="0.05" />
    </TresMesh>

    <!-- سقف (رو به پایین) -->
    <TresMesh :position="[0, H, 0]" :rotation="[HALF_PI, 0, 0]">
      <TresPlaneGeometry :args="[W, D]" />
      <TresMeshStandardMaterial :color="theme.derived.ceiling" :roughness="0.95" />
    </TresMesh>

    <!-- دیوارها -->
    <TresMesh v-for="w in walls" :key="w.key" :position="w.pos" receive-shadow>
      <TresBoxGeometry :args="w.args" />
      <TresMeshStandardMaterial :color="w.color" :roughness="0.9" />
    </TresMesh>

    <!-- پنل پایین دیوار -->
    <TresMesh v-for="p in wainscot" :key="p.key" :position="p.pos">
      <TresBoxGeometry :args="p.args" />
      <TresMeshStandardMaterial :color="p.color" :roughness="0.8" />
    </TresMesh>

    <!-- ریل رزگلد -->
    <TresMesh v-for="r in rails" :key="r.key" :position="r.pos">
      <TresBoxGeometry :args="r.args" />
      <TresMeshStandardMaterial :color="r.color" :metalness="0.6" :roughness="0.35" />
    </TresMesh>

    <!-- قرنیز بالا -->
    <TresMesh v-for="c in crown" :key="c.key" :position="c.pos">
      <TresBoxGeometry :args="c.args" />
      <TresMeshStandardMaterial :color="c.color" :roughness="0.7" />
    </TresMesh>
  </TresGroup>
</template>