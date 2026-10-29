<!-- app/components/shop3d/ProductInteraction.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, toValue, watch } from 'vue'
import {
  AdditiveBlending, BoxGeometry, Color, Matrix4, Mesh, MeshBasicMaterial,
  Raycaster, Vector2, Vector3,
  type Camera, type Object3D, type Scene,
} from 'three'
import { useLoop, useTresContext } from '@tresjs/core'

const props = defineProps<{ camera?: any }>()

const PICK_RANGE = 6 // متر؛ دورتر از این هاور/انتخاب نمی‌شود
const FLASH_MS = 1100

const ctx = useTresContext()
const catalog = useShopCatalog()
const fx = useShopInteraction()
const theme = getTheme3D()
const q = useShopQuality()

const unwrap = (x: unknown): any => {
  const v: any = toValue(x as any)
  return v?.instance ?? v
}

let el: HTMLCanvasElement | null = null
let cam: Camera | null = null
let scene: Scene | null = null
let occluders: Object3D[] | null = null

const raycaster = new Raycaster()
const ndc = new Vector2()
const m4 = new Matrix4()
const v3 = new Vector3()
const pointer = { x: 0, y: 0, active: false }

/* ---------- هایلایت و هاله ---------- */
const boxGeo = new BoxGeometry(PRODUCT.w + 0.028, PRODUCT.h + 0.028, PRODUCT.d + 0.02)
const hlMat = new MeshBasicMaterial({
  color: new Color(theme.hex.primary),
  transparent: true, opacity: 0.4, blending: AdditiveBlending, depthWrite: false, toneMapped: false,
})
const haloMat = new MeshBasicMaterial({
  color: glowColor(theme.hex.success, 3, q.bloom),
  transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, toneMapped: false,
})
const hl = new Mesh(boxGeo, hlMat)
const halo = new Mesh(boxGeo, haloMat)
for (const m of [hl, halo]) {
  m.visible = false
  m.userData.noPick = true
  m.raycast = () => {} // هرگز مانع raycast نشود
  m.frustumCulled = false
}

let hlTarget = -2
let flash: { index: number; t0: number } | null = null

function placeAt(mesh: Mesh, index: number) {
  fx.productMesh.value!.getMatrixAt(index, m4)
  m4.decompose(mesh.position, mesh.quaternion, mesh.scale)
}

/* ---------- raycast ---------- */
function getCamera() {
  if (!cam) {
    const c = (unwrap(props.camera) ?? unwrap(ctx.camera)) as Camera | undefined
    if (c && (c as any).isCamera) cam = c
  }
  return cam
}

function getOccluders(): Object3D[] {
  if (occluders) return occluders
  if (!scene) scene = unwrap(ctx.scene) as Scene
  const list: Object3D[] = []
  scene?.traverse((o) => {
    const m = o as Mesh
    if (!m.isMesh || (m as any).isInstancedMesh || o.userData.noPick || !o.visible) return
    const mats = Array.isArray(m.material) ? m.material : [m.material]
    if (mats.some((mt) => mt.transparent)) return // شیشه، سایه‌ها، هاله‌ها مانع نیستند
    list.push(o)
  })
  occluders = list
  return list
}

/** ایندکس instance زیر نقطه صفحه، یا -1 */
function raycastProducts(clientX: number, clientY: number): number {
  const mesh = fx.productMesh.value
  const c = getCamera()
  if (!mesh || !c || !el) return -1

  const r = el.getBoundingClientRect()
  ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
  c.updateMatrixWorld()
  raycaster.setFromCamera(ndc, c as any)
  raycaster.far = Infinity

  const hit = raycaster.intersectObject(mesh, false)[0]
  if (!hit || hit.instanceId == null || hit.distance > PICK_RANGE) return -1

  // آیا چیزی بین دوربین و محصول است؟ (جزیره، دیوار، کنار قفسه)
  raycaster.far = hit.distance - 0.005
  const blocked = raycaster.intersectObjects(getOccluders(), false).length > 0
  raycaster.far = Infinity
  return blocked ? -1 : hit.instanceId
}

/* ---------- ورودی ---------- */
function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || e.buttons !== 0) { pointer.active = false; return }
  pointer.x = e.clientX
  pointer.y = e.clientY
  pointer.active = true
}
const offPointer = () => { pointer.active = false }

function attach() {
  const dom = unwrap(ctx.renderer)?.domElement as HTMLCanvasElement | undefined
  if (!dom || el === dom) return
  el = dom
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', offPointer)
  el.addEventListener('pointerdown', offPointer)
}

fx.pickAt = (x, y) => {
  const i = raycastProducts(x, y)
  const inst = i >= 0 ? catalog.instances.value[i] : undefined
  if (!inst) return false
  fx.select(i, inst.placement.pos, inst.placement.rotY)
  return true
}

watch(() => fx.successFlash.value, (f) => {
  if (f) flash = { index: f.index, t0: performance.now() }
})

/* ---------- حلقه ---------- */
const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  if (!el) attach()
  const mesh = fx.productMesh.value
  if (!el || !mesh) return

  // ۱) هاور
  const idx = pointer.active ? raycastProducts(pointer.x, pointer.y) : -1
  if (idx !== fx.hoverIndex.value) fx.hoverIndex.value = idx

  // کرسر
  if (idx >= 0 && el.style.cursor !== 'pointer') el.style.cursor = 'pointer'
  else if (idx < 0 && el.style.cursor === 'pointer') el.style.cursor = 'grab'

  // ۲) هایلایت: انتخاب‌شده، وگرنه هاور
  const target = fx.selectedIndex.value ?? idx
  if (target !== hlTarget) {
    hlTarget = target
    hl.visible = target >= 0
    if (target >= 0) placeAt(hl, target)
  }

  // ۳) موقعیت صفحه‌ای برچسب/تیک
  const pi = fx.selectedIndex.value ?? idx
  const c = getCamera()
  if (pi >= 0 && c) {
    mesh.getMatrixAt(pi, m4)
    v3.setFromMatrixPosition(m4)
    v3.y += PRODUCT.h / 2 + 0.01
    v3.project(c as any)
    const r = el.getBoundingClientRect()
    const x = (v3.x * 0.5 + 0.5) * r.width + r.left
    const y = (-v3.y * 0.5 + 0.5) * r.height + r.top
    const visible = v3.z < 1
    const t = fx.tooltip.value
    if (t.visible !== visible || Math.abs(t.x - x) > 0.5 || Math.abs(t.y - y) > 0.5) {
      fx.tooltip.value = { x, y, visible }
    }
  } else if (fx.tooltip.value.visible) {
    fx.tooltip.value = { ...fx.tooltip.value, visible: false }
  }

  // ۴) هاله سبز
  if (flash) {
    const t = (performance.now() - flash.t0) / FLASH_MS
    if (t >= 1) {
      flash = null
      halo.visible = false
    } else {
      placeAt(halo, flash.index)
      halo.scale.multiplyScalar(1 + 0.45 * (1 - (1 - t) ** 3))
      haloMat.opacity = 0.9 * (1 - t) ** 1.5
      halo.visible = true
    }
  }
})

onMounted(attach)

onBeforeUnmount(() => {
  if (el) {
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', offPointer)
    el.removeEventListener('pointerdown', offPointer)
    if (el.style.cursor === 'pointer') el.style.cursor = 'grab'
  }
  boxGeo.dispose()
  hlMat.dispose()
  haloMat.dispose()
  fx.reset()
})
</script>

<template>
  <TresGroup name="product-fx">
    <primitive :object="hl" />
    <primitive :object="halo" />
  </TresGroup>
</template>