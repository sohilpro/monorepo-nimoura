<!-- app/components/shop3d/Environment.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, toValue } from 'vue'
import { PMREMGenerator, type Texture } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useTresContext } from '@tresjs/core'

const props = withDefaults(defineProps<{ intensity?: number }>(), { intensity: 0.6 })

const ctx = useTresContext()
let pmrem: PMREMGenerator | null = null
let envTexture: Texture | null = null
let sceneRef: any = null

// سازگاری با نسخه‌های مختلف Tres (ref / shallowRef / .instance)
const unwrap = (x: unknown): any => {
  const v: any = toValue(x as any)
  return v?.instance ?? v
}

onMounted(() => {
  const renderer = unwrap(ctx.renderer)
  sceneRef = unwrap(ctx.scene)
  if (!renderer || !sceneRef) return

  pmrem = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  envTexture = pmrem.fromScene(room, 0.04).texture
  sceneRef.environment = envTexture
  sceneRef.environmentIntensity = props.intensity
  room.dispose?.()
})

onBeforeUnmount(() => {
  if (sceneRef && sceneRef.environment === envTexture) sceneRef.environment = null
  envTexture?.dispose()
  pmrem?.dispose()
})
</script>

<template>
  <TresGroup />
</template>