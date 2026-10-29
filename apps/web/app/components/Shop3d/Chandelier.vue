<!-- app/components/shop3d/Chandelier.vue -->
<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import { Matrix4, Quaternion, Vector3, type InstancedMesh } from "three";

const theme = getTheme3D();
const q = useShopQuality();
const H = STORE.height;
const HALF_PI = Math.PI / 2;
const [ix, , iz] = FURNITURE.island.position;

const rings = [
  { r: 0.9, y: 2.55, n: 14 },
  { r: 0.6, y: 2.85, n: 10 },
  { r: 0.3, y: 3.15, n: 6 },
];

// گوی‌ها و نخ‌هایشان (ثابت و بدون random)
const balls: { x: number; y: number; z: number }[] = [];
const threads: { x: number; y: number; z: number; len: number }[] = [];
rings.forEach((ring, ri) => {
  for (let i = 0; i < ring.n; i++) {
    const a = (i / ring.n) * Math.PI * 2 + ri * 0.3;
    const drop = 0.1 + (i % 3) * 0.09;
    const x = Math.cos(a) * ring.r;
    const z = Math.sin(a) * ring.r;
    balls.push({ x, y: ring.y - drop, z });
    threads.push({ x, y: ring.y - drop / 2, z, len: drop });
  }
});

// سیم‌های آویز حلقه‌ها از سقف (۳ تا برای هر حلقه)
const wires = rings.flatMap((ring) =>
  [0, 1, 2].map((k) => {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    const len = H - ring.y;
    return {
      x: Math.cos(a) * ring.r,
      z: Math.sin(a) * ring.r,
      y: ring.y + len / 2,
      len,
    };
  }),
);

const ballColor = glowColor(theme.derived.warmLight, 6, q.bloom);

const ballMesh = shallowRef<InstancedMesh>();
const threadMesh = shallowRef<InstancedMesh>();

onMounted(() => {
  const m = new Matrix4();
  const quat = new Quaternion();
  balls.forEach((b, i) => {
    ballMesh.value?.setMatrixAt(i, m.makeTranslation(b.x, b.y, b.z));
  });
  threads.forEach((t, i) => {
    m.compose(new Vector3(t.x, t.y, t.z), quat, new Vector3(1, t.len, 1));
    threadMesh.value?.setMatrixAt(i, m);
  });
  if (ballMesh.value) ballMesh.value.instanceMatrix.needsUpdate = true;
  if (threadMesh.value) threadMesh.value.instanceMatrix.needsUpdate = true;
});
</script>

<template>
  <TresGroup :position="[ix, 0, iz]">
    <!-- سقف‌گیر و ساقه -->
    <TresMesh :position="[0, H - 0.02, 0]">
      <TresCylinderGeometry :args="[0.14, 0.14, 0.04, 32]" />
      <TresMeshStandardMaterial
        :color="theme.hex.primary"
        :metalness="0.8"
        :roughness="0.3"
      />
    </TresMesh>
    <TresMesh :position="[0, H - 0.4, 0]">
      <TresCylinderGeometry :args="[0.018, 0.018, 0.8, 12]" />
      <TresMeshStandardMaterial
        :color="theme.hex.primary"
        :metalness="0.8"
        :roughness="0.3"
      />
    </TresMesh>

    <!-- حلقه‌ها -->
    <TresMesh
      v-for="(r, i) in rings"
      :key="`ring-${i}`"
      :position="[0, r.y, 0]"
      :rotation="[HALF_PI, 0, 0]"
    >
      <TresTorusGeometry :args="[r.r, 0.012, 8, 72]" />
      <TresMeshStandardMaterial
        :color="theme.hex.primary"
        :metalness="0.8"
        :roughness="0.3"
      />
    </TresMesh>

    <!-- سیم‌ها -->
    <TresMesh
      v-for="(w, i) in wires"
      :key="`wire-${i}`"
      :position="[w.x, w.y, w.z]"
    >
      <TresCylinderGeometry :args="[0.003, 0.003, w.len, 6]" />
      <TresMeshStandardMaterial
        :color="theme.hex.primary"
        :metalness="0.8"
        :roughness="0.35"
      />
    </TresMesh>

    <!-- نخ‌ها (instanced) -->
    <TresInstancedMesh
      ref="threadMesh"
      :args="[undefined, undefined, threads.length]"
      :frustum-culled="false"
    >
      <TresCylinderGeometry :args="[0.002, 0.002, 1, 4]" />
      <TresMeshBasicMaterial :color="theme.hex.primary" />
    </TresInstancedMesh>

    <!-- گوی‌های نورانی (instanced) -->
    <TresInstancedMesh
      ref="ballMesh"
      :args="[undefined, undefined, balls.length]"
      :frustum-culled="false"
    >
      <TresSphereGeometry :args="[0.045, 16, 12]" />
      <TresMeshBasicMaterial :color="ballColor" :tone-mapped="false" />
    </TresInstancedMesh>

    <!-- نور گرم لوستر -->
    <TresPointLight
      v-if="q.extraLights"
      :position="[0, 2.7, 0]"
      :color="theme.derived.warmLight"
      :intensity="9"
      :distance="9"
      :decay="2"
    />
  </TresGroup>
</template>
