<!-- app/components/shop3d/Products.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from "vue";
import {
  BoxGeometry,
  BufferAttribute,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
} from "three";
import type { Texture } from "three";

const theme = getTheme3D();
const q = useShopQuality();
const catalog = useShopCatalog();
const loading = useShopLoading();
const fx = useShopInteraction();

const mesh = shallowRef<InstancedMesh | null>(null);
const tags = shallowRef<InstancedMesh | null>(null);

let atlas: ProductAtlas | null = null;
let alive = true;
const disposables: { dispose(): void }[] = [];

async function build() {
  const byId = new Map(catalog.products.value.map((p) => [p.id, p]));
  const layout = layoutProducts(catalog.products.value);

  // اطلس فقط برای محصولاتی که جایی چیده شده‌اند
  const ids = [...new Set(layout.placements.map((p) => p.productId))];
  atlas = new ProductAtlas(
    theme,
    ids.map((id) => byId.get(id)!),
    q.atlas,
    (d, t) => {
      loading.atlas.value = { done: d, total: t };
    },
  );
  const placements = layout.placements.filter((p) => atlas!.has(p.productId));
  const count = placements.length;
  loading.atlas.value = { done: 0, total: atlas.total };
  loading.built.value = true;
  if (!count) return;

  /* ---------- geometry جعبه: فقط وجه +Z (جلو) تکسچر می‌گیرد ---------- */
  const geo = new BoxGeometry(PRODUCT.w, PRODUCT.h, PRODUCT.d);
  const face = new Float32Array(24); // ۶ وجه × ۴ رأس؛ ترتیب three: +x -x +y -y +z -z
  face.fill(1, 16, 20);
  geo.setAttribute("aFace", new BufferAttribute(face, 1));

  const uvRect = new Float32Array(count * 4);
  const fade = new Float32Array(count);

  /* ---------- متریال ---------- */
  const side = theme.color.base.clone().lerp(theme.color.accent, 0.35);
  const mat = new MeshStandardMaterial({
    map: atlas.texture,
    roughness: 0.45,
    metalness: 0,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSide = { value: side as Color };
    shader.vertexShader = shader.vertexShader
      .replace(
        "void main() {",
        `attribute vec4 aUvRect;
attribute float aFace;
attribute float aFade;
varying float vFront;
varying float vFade;
void main() {`,
      )
      .replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>
#ifdef USE_MAP
  vMapUv = vMapUv * aUvRect.zw + aUvRect.xy;
#endif
  vFront = aFace;
  vFade = aFade;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        `uniform vec3 uSide;
varying float vFront;
varying float vFade;
void main() {`,
      )
      .replace(
        "#include <map_fragment>",
        `vec4 texel = texture2D( map, vMapUv );
vec3 albedo = mix( uSide, texel.rgb, vFront );
float lum = dot( albedo, vec3( 0.2126, 0.7152, 0.0722 ) );
albedo = mix( albedo, vec3( lum * 0.6 + 0.3 ), vFade * 0.85 );
diffuseColor.rgb *= albedo;`,
      );
  };
  mat.customProgramCacheKey = () => "nimoura-product-box-v1";

  /* ---------- instanceها ---------- */
  const inst = new InstancedMesh(geo, mat, count);
  inst.frustumCulled = false;
  inst.name = "products";

  const dummy = new Object3D();
  const tagOffset = new Matrix4().makeTranslation(0, 0, PRODUCT.d / 2 + 0.004);
  const tagMatrices: Matrix4[] = [];

  placements.forEach((pl, i) => {
    const p = byId.get(pl.productId)!;
    dummy.position.set(pl.pos[0], pl.pos[1], pl.pos[2]);
    dummy.rotation.set(0, pl.rotY, 0);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);

    const r = atlas!.rectFor(pl.productId);
    uvRect.set([r.u, r.v, r.w, r.h], i * 4);
    fade[i] = p.available ? 0 : 1;
    if (!p.available)
      tagMatrices.push(dummy.matrix.clone().multiply(tagOffset));
  });
  inst.instanceMatrix.needsUpdate = true;
  geo.setAttribute("aUvRect", new InstancedBufferAttribute(uvRect, 4));
  geo.setAttribute("aFade", new InstancedBufferAttribute(fade, 1));
  disposables.push(geo, mat);

  /* ---------- برچسب «ناموجود» ---------- */
  if (tagMatrices.length) {
    const tagTex = createUnavailableTagTexture(theme) as Texture;
    const tagGeo = new PlaneGeometry(0.12, 0.038);
    const tagMat = new MeshBasicMaterial({
      map: tagTex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    const t = new InstancedMesh(tagGeo, tagMat, tagMatrices.length);
    t.frustumCulled = false;
    tagMatrices.forEach((m, i) => t.setMatrixAt(i, m));
    t.instanceMatrix.needsUpdate = true;
    tags.value = t;
    disposables.push(tagGeo, tagMat, tagTex);
  }

  mesh.value = inst;
  fx.productMesh.value = inst;
  catalog.instances.value = placements.map((placement) => ({
    product: byId.get(placement.productId)!,
    placement,
  }));

  if (import.meta.dev) {
    console.info("[shop3d] چیدمان", {
      instances: count,
      perZone: layout.perZone,
      atlasCapacity: atlas.capacity,
      droppedProducts: layout.dropped.map((d) => d.title),
    });
    if (layout.unmappedCategories.length) {
      console.warn(
        "[shop3d] دسته‌های ناشناس (رفتند به «آرایش»). در SLUG_ZONE تعیینشان کنید:",
        layout.unmappedCategories,
      );
    }
  }

  // عکس‌ها بعد از نمایش صحنه، تدریجی
  const proxy = new URLSearchParams(location.search).get("imgproxy") === "1";
  await atlas.loadAll(proxy);
  if (atlas) {
    shopTrack("shop3d_images", {
      loaded: atlas.loaded,
      failed: atlas.failed.size,
      proxy,
    });
    if (atlas.failed.size > atlas.total * 0.5) {
      shopReportMessage(
        "shop3d: most product images failed to load (CORS?)",
        "warning",
        {
          loaded: atlas.loaded,
          failed: atlas.failed.size,
        },
      );
    }
  }
  if (import.meta.dev && atlas) {
    console.info(
      `[shop3d] عکس‌ها: ${atlas.loaded} موفق، ${atlas.failed.size} ناموفق`,
    );
    if (atlas.failed.size)
      console.warn(
        "[shop3d] اگر همه ناموفق‌اند احتمالاً CORS است؛ با ?imgproxy=1 تست کنید.",
      );
  }
}

onMounted(async () => {
  await catalog.load();
  if (!alive || catalog.status.value !== "ready") return;
  await build();
});

onBeforeUnmount(() => {
  alive = false;
  atlas?.dispose();
  disposables.forEach((d) => d.dispose());
  mesh.value?.dispose();
  tags.value?.dispose();
  catalog.instances.value = [];
  fx.productMesh.value = null;
});
</script>

<template>
  <TresGroup name="products">
    <primitive v-if="mesh" :object="mesh" />
    <primitive v-if="tags" :object="tags" />
  </TresGroup>
</template>
