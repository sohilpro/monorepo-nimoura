// app/composables/useWebGL.ts
export function isWebGLAvailable(): boolean {
  return evaluateSupport().ok
}