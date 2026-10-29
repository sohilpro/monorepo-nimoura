<!-- app/components/shop3d/Joystick.vue -->
<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'

const { joystick, interacted } = useShopControls()

const RADIUS = 48 // حداکثر جابه‌جایی دستگیره (px)
const base = ref<HTMLElement | null>(null)
const knob = reactive({ x: 0, y: 0 })
let pointerId: number | null = null
let cx = 0
let cy = 0

function update(e: PointerEvent) {
  let dx = e.clientX - cx
  let dy = e.clientY - cy
  const len = Math.hypot(dx, dy)
  if (len > RADIUS) {
    dx = (dx / len) * RADIUS
    dy = (dy / len) * RADIUS
  }
  knob.x = dx
  knob.y = dy
  joystick.x = dx / RADIUS
  joystick.y = -dy / RADIUS // بالا = جلو
}

function onDown(e: PointerEvent) {
  if (pointerId !== null || !base.value) return
  pointerId = e.pointerId
  base.value.setPointerCapture(pointerId)
  const r = base.value.getBoundingClientRect()
  cx = r.left + r.width / 2
  cy = r.top + r.height / 2
  interacted.value = true
  update(e)
}

const onMove = (e: PointerEvent) => { if (e.pointerId === pointerId) update(e) }

function release(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  pointerId = null
  knob.x = knob.y = 0
  joystick.x = joystick.y = 0
}

onBeforeUnmount(() => { joystick.x = joystick.y = 0 })
</script>

<template>
  <div
    ref="base"
    class="absolute left-5 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] size-32 touch-none select-none rounded-full border border-nimoura-base/40 bg-nimoura-velvet/35 backdrop-blur-sm"
    @pointerdown.prevent="onDown"
    @pointermove="onMove"
    @pointerup="release"
    @pointercancel="release"
  >
    <div
      class="pointer-events-none absolute top-1/2 left-1/2 -mt-7 -ml-7 size-14 rounded-full bg-nimoura-base/85 shadow-lg"
      :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }"
    />
  </div>
</template>