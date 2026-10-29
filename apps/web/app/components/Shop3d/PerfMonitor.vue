<!-- app/components/shop3d/PerfMonitor.vue -->
<script setup lang="ts">
import { onBeforeUnmount, toValue } from "vue";
import { useLoop, useTresContext } from "@tresjs/core";

const ctx = useTresContext();
const q = useShopQuality();
const perf = useShopPerf();
const loading = useShopLoading();

const unwrap = (x: unknown): any => {
  const v: any = toValue(x as any);
  return v?.instance ?? v;
};

const coarse = import.meta.client && matchMedia("(pointer: coarse)").matches;
const E2E = import.meta.client && new URLSearchParams(location.search).get('e2e') === '1'
const TARGET = coarse ? 27 : 45;
const WINDOW_S = 2;
const MIN_SCALE = 0.6;
const STEP = 0.15;

let acc = 0;
let frames = 0;
let bad = 0;
let warm = 3; // ثانیه گرم‌شدن بعد از بسته‌شدن لودینگ
let infoT = 0;
let renderer: any = null;
let canvas: HTMLCanvasElement | null = null;

const onLost = (e: Event) => {
  e.preventDefault();
  perf.contextLost.value = true;
  shopReportMessage("shop3d: webgl context lost", "warning", {
    tier: q.tier,
    scale: perf.scale.value,
    fps: perf.fps.value,
  });
  shopTrack("shop3d_context_lost", { fps: perf.fps.value });
};
const onRestored = () => {
  perf.contextLost.value = false;
};

function attach() {
  const r = unwrap(ctx.renderer);
  if (!r?.domElement || renderer === r) return;
  renderer = r;
  r.debug.onShaderError = (
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    vs: WebGLShader,
    fs: WebGLShader,
  ) => {
    const info = {
      program: gl.getProgramInfoLog(program)?.slice(0, 400),
      vertex: gl.getShaderInfoLog(vs)?.slice(0, 400),
      fragment: gl.getShaderInfoLog(fs)?.slice(0, 400),
    };
    if (import.meta.dev) console.error("[shop3d] shader error", info);
    shopReportError(new Error("shop3d shader compile/link error"), info);
  };
  canvas = r.domElement;
  canvas!.addEventListener("webglcontextlost", onLost);
  canvas!.addEventListener("webglcontextrestored", onRestored);
}

function stepDown(fps: number) {
  const jump = fps < TARGET * 0.6 ? 2 : 1;

  if (perf.scale.value > MIN_SCALE + 0.01) {
    perf.scale.value = Math.max(
      MIN_SCALE,
      +(perf.scale.value - STEP * jump).toFixed(2),
    );
    saveQuality(q.tier, perf.scale.value);
    warm = 1.5;
    return;
  }
  if (q.dust > 0 && !perf.dustOff.value) {
    perf.dustOff.value = true;
    warm = 1.5;
    return;
  }
  if (q.tier !== "low") {
    perf.suggest.value = "lite";
    return;
  }
  if (fps < 15) perf.suggest.value = "simple";
}

const { onBeforeRender } = useLoop();

onBeforeRender(({ delta }) => {
  if (!renderer) attach();
  if (document.hidden || delta > 0.5) {
    acc = 0;
    frames = 0;
    return;
  }

  // HUD (فقط با ?perf=1)
  if (perf.hud.value && renderer) {
    const now = performance.now();
    if (now - infoT > 500) {
      infoT = now;
      const i = renderer.info;
      perf.calls.value = i.render.calls;
      perf.tris.value = i.render.triangles;
      perf.textures.value = i.memory.textures;
      perf.canvasPx.value = `${canvas!.width}×${canvas!.height}`;
    }
  }

  acc += delta;
  frames++;
  if (acc < WINDOW_S) return;

  const fps = frames / acc;
  const spent = acc;
  acc = 0;
  frames = 0;
  perf.fps.value = Math.round(fps);

    if (E2E || !loading.done.value || perf.stopped.value || perf.suggest.value) return
  if (warm > 0) {
    warm -= spent;
    return;
  }

  if (fps < TARGET) {
    if (++bad >= 2) {
      bad = 0;
      stepDown(fps);
    }
  } else {
    bad = 0;
  }
});

onBeforeUnmount(() => {
  canvas?.removeEventListener("webglcontextlost", onLost);
  canvas?.removeEventListener("webglcontextrestored", onRestored);
});
</script>

<template>
  <TresGroup />
</template>
