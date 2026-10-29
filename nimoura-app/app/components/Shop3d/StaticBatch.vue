<!-- app/components/shop3d/StaticBatch.vue -->
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { Float32BufferAttribute, Matrix4, Mesh } from 'three'
import type { BufferGeometry, Material, Object3D } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const props = withDefaults(defineProps<{ enabled?: boolean }>(), { enabled: true })

const group = shallowRef<any>(null)
const created: Mesh[] = []
const KEEP = new Set(['position', 'normal', 'uv'])

const c3 = (c?: { r: number; g: number; b: number }) =>
  c ? `${c.r.toFixed(3)},${c.g.toFixed(3)},${c.b.toFixed(3)}` : ''

function signature(mat: Material | Material[]): string | null {
  if (Array.isArray(mat)) return null
  const a = mat as any
  if (a.isShaderMaterial) return null
  if (a.transparent && a.depthWrite !== false) return null // شفاف‌های ترتیب‌دار
  return [
    a.type, c3(a.color), c3(a.emissive), a.emissiveIntensity, a.roughness, a.metalness,
    a.opacity, a.transparent, a.blending, a.side, a.depthWrite, a.depthTest, a.toneMapped,
    a.flatShading, a.map?.uuid ?? '', a.envMapIntensity,
  ].join('|')
}

/** هندسه را به position/normal/uv ساده و در مختصات والد می‌برد */
function bake(m: Mesh, toLocal: Matrix4, nonIndexed: boolean): BufferGeometry {
  const geo = nonIndexed && m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()
  for (const name of Object.keys(geo.attributes)) if (!KEEP.has(name)) geo.deleteAttribute(name)
  geo.morphAttributes = {}
  geo.clearGroups()
  const n = geo.attributes.position!.count
  if (!geo.attributes.normal) geo.computeVertexNormals()
  if (!geo.attributes.uv) geo.setAttribute('uv', new Float32BufferAttribute(new Float32Array(n * 2), 2))
  geo.applyMatrix4(new Matrix4().multiplyMatrices(toLocal, m.matrixWorld))
  return geo
}

onMounted(async () => {
  if (!props.enabled) return
  await nextTick()
  const g: Object3D | undefined = group.value?.instance ?? group.value
  if (!g) return

  g.updateWorldMatrix(true, true)
  const toLocal = new Matrix4().copy(g.matrixWorld).invert()

  const buckets = new Map<string, Mesh[]>()
  g.traverse((o) => {
    const m = o as Mesh
    if (!m.isMesh || (m as any).isInstancedMesh || (m as any).isSkinnedMesh) return
    if (!m.visible || m.userData.noBatch || !m.geometry?.attributes?.position) return
    const key = signature(m.material)
    if (!key) return
    const list = buckets.get(key)
    if (list) list.push(m)
    else buckets.set(key, [m])
  })

  let before = 0
  let after = 0
  for (const meshes of buckets.values()) {
    if (meshes.length < 2) continue
    const nonIndexed = meshes.some((m) => !m.geometry.index)
    const geos = meshes.map((m) => bake(m, toLocal, nonIndexed))
    const merged = mergeGeometries(geos, false)
    geos.forEach((x) => x.dispose())
    if (!merged) {
      if (import.meta.dev) console.warn('[shop3d] ادغام یک گروه ناموفق بود؛ مش‌ها جدا می‌مانند')
      continue
    }
    const mesh = new Mesh(merged, meshes[0]!.material)
    mesh.name = 'batched'
    mesh.renderOrder = meshes[0]!.renderOrder
    g.add(mesh)
    created.push(mesh)
    meshes.forEach((m) => { m.visible = false })
    before += meshes.length
    after += 1
  }
  if (import.meta.dev) console.info(`[shop3d] batch: ${before} مش ← ${after} draw call`)
})

onBeforeUnmount(() => {
  created.forEach((m) => { m.parent?.remove(m); m.geometry.dispose() })
  created.length = 0
})
</script>

<template>
  <TresGroup ref="group">
    <slot />
  </TresGroup>
</template>