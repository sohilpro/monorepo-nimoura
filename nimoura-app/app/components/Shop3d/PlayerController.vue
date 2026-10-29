<!-- app/components/shop3d/PlayerController.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toValue, watch } from "vue";
import {
  MathUtils,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
  type PerspectiveCamera,
} from "three";
import { useLoop, useTresContext } from "@tresjs/core";
import type { Pt } from "~/utils/navigation";
import type { ViewId } from "~/utils/storeLayout";

/* ============ تنظیمات: همه‌چیز را از همین‌جا می‌توانید تنظیم کنید ============ */
const CFG = {
  walk: 2.3, // متر بر ثانیه
  run: 4.2, // با Shift یا فشار کامل جوی‌استیک
  accel: 12, // تیزی شروع/توقف (بیشتر = تیزتر)
  turn: 1.8, // رادیان بر ثانیه، با کلیدهای چپ/راست
  lookSens: 0.0042, // رادیان بر پیکسل
  invertY: false,
  pitchLimit: 1.0,
  deadzone: 0.12,
  tapMaxMove: 8, // px؛ بیشتر از این یعنی کشیدن است نه کلیک
  tapMaxTime: 450, // ms
  tapMaxDist: 14, // m؛ دورتر از این روی زمین کلیک نمی‌شود
  bob: 0.012, // نوسان ملایم سر هنگام راه‌رفتن (متر)
  eye: STORE.eyeHeight,
  focusDist: 0.95,
};

const props = defineProps<{ camera?: any }>();

const ctx = useTresContext();
const { joystick, activeZone, request, interacted, reset } = useShopControls();
const interaction = useShopInteraction();
const theme = getTheme3D();

// سازگاری با نسخه‌های مختلف Tres (ref / shallowRef / .instance)
const unwrap = (x: unknown): any => {
  const v: any = toValue(x as any);
  return v?.instance ?? v;
};

/* ============ وضعیت ============ */
const pos: Pt = { x: START_VIEW.position[0], z: START_VIEW.position[1] };
const vel = { x: 0, z: 0 };
const start = lookAngles([pos.x, CFG.eye, pos.z], START_VIEW.lookAt);
let yaw = start.yaw;
let pitch = start.pitch;
let bobPhase = 0;
let anchor: Pt | null = { x: pos.x, z: pos.z }; // برای خاموش‌شدن هایلایت وقتی از نقطه دور شد

let cam: PerspectiveCamera | null = null;
let el: HTMLCanvasElement | null = null;

const keys = new Set<string>();
const marker = ref<Pt | null>(null); // حلقه روی زمین در مقصد کلیک

const raycaster = new Raycaster();
const floor = new Plane(new Vector3(0, 1, 0), 0);
const ndc = new Vector2();
const hitPt = new Vector3();
const tmp: Pt = { x: 0, z: 0 };

const reduceMotion =
  import.meta.client && matchMedia("(prefers-reduced-motion: reduce)").matches;

const wrapPi = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const easeInOutSine = (u: number) => -(Math.cos(Math.PI * u) - 1) / 2;

/* ============ حرکت خودکار روی مسیر (کلیک روی زمین و تلپورت) ============ */
interface Glide {
  path: Pt[];
  cum: number[];
  length: number;
  t: number;
  dur: number;
  look: boolean;
  yaw0: number;
  dYaw: number;
  pitch0: number;
  dPitch: number;
  zone: ViewId | null;
}
let glide: Glide | null = null;

function startGlide(
  path: Pt[],
  o: {
    speed: number;
    minDur: number;
    look?: { yaw: number; pitch: number };
    zone?: ViewId;
  },
) {
  const { cum, length } = measurePath(path);
  glide = {
    path,
    cum,
    length,
    t: 0,
    dur: reduceMotion ? 0.01 : MathUtils.clamp(length / o.speed, o.minDur, 4),
    look: !!o.look,
    yaw0: yaw,
    dYaw: o.look ? wrapPi(o.look.yaw - yaw) : 0,
    pitch0: pitch,
    dPitch: o.look ? o.look.pitch - pitch : 0,
    zone: o.zone ?? null,
  };
  vel.x = vel.z = 0;
  activeZone.value = null;
  anchor = null;
}

function stopGlide() {
  glide = null;
  marker.value = null;
}

function updateGlide(dt: number) {
  const g = glide!;
  g.t = Math.min(g.t + dt, g.dur);
  const e = easeInOutSine(g.t / g.dur);
  pointAlong(g.path, g.cum, g.length * e, tmp);
  pos.x = tmp.x;
  pos.z = tmp.z;
  if (g.look) {
    yaw = g.yaw0 + g.dYaw * e;
    pitch = g.pitch0 + g.dPitch * e;
  }
  if (g.t >= g.dur) {
    if (g.zone) {
      activeZone.value = g.zone;
      anchor = { x: pos.x, z: pos.z };
    }
    stopGlide();
  }
}

// درخواست تلپورت از دکمه‌های منو
watch(request, (r) => {
  if (!r) return;
  const vp = VIEWPOINTS.find((v) => v.id === r.id);
  if (!vp) return;
  const target: Pt = { x: vp.position[0], z: vp.position[1] };
  const path = findPath(pos, target);
  if (!path) return;
  startGlide(path, {
    speed: 3.2,
    minDur: 0.9,
    look: lookAngles([target.x, CFG.eye, target.z], vp.lookAt),
    zone: vp.id,
  });
});

// انتخاب محصول: نزدیک‌شدن به آن
watch(
  () => interaction.focusRequest.value,
  (r) => {
    if (!r) return;
    // عمود خارج‌شونده از وجه جلوی جعبه: (sin θ, cos θ)
    const want: Pt = {
      x: r.pos[0] + Math.sin(r.rotY) * CFG.focusDist,
      z: r.pos[2] + Math.cos(r.rotY) * CFG.focusDist,
    };
    const path = findPath(pos, want);
    if (!path) return;
    const end = path[path.length - 1]!;
    const look = lookAngles(
      [end.x, CFG.eye, end.z],
      [r.pos[0], r.pos[1] - r.lookDrop, r.pos[2]],
    );
    startGlide(path, { speed: 3, minDur: 0.7, look });
  },
);

/* ============ ورودی: کیبورد ============ */
const MOVE_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ShiftLeft",
  "ShiftRight",
]);

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return (
    !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
  );
}

function onKeyDown(e: KeyboardEvent) {
  if (isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (document.querySelector('[role="dialog"][aria-modal="true"]')) return; // جدید
  if (!MOVE_KEYS.has(e.code)) return;
  e.preventDefault();
  keys.add(e.code);
  interacted.value = true;
}
const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
const onBlur = () => keys.clear();

interface Input {
  f: number;
  s: number;
  active: boolean;
  run: boolean;
}

function readInput(): Input {
  let f = 0;
  let s = 0;
  if (keys.has("KeyW") || keys.has("ArrowUp")) f += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) f -= 1;
  if (keys.has("KeyD")) s += 1;
  if (keys.has("KeyA")) s -= 1;
  let run = keys.has("ShiftLeft") || keys.has("ShiftRight");

  const jm = Math.hypot(joystick.x, joystick.y);
  if (jm > CFG.deadzone) {
    f += joystick.y;
    s += joystick.x;
    if (jm > 0.92) run = true;
  }
  const m = Math.hypot(f, s);
  if (m > 1) {
    f /= m;
    s /= m;
  }
  return { f, s, active: m > 0.01, run };
}

function stepWalk(dt: number, input: Input) {
  const sp = input.run ? CFG.run : CFG.walk;
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  // جلو = (-sin, -cos)، راست = (cos, -sin)
  const tx = (-sin * input.f + cos * input.s) * sp;
  const tz = (-cos * input.f - sin * input.s) * sp;
  const k = 1 - Math.exp(-CFG.accel * dt);
  vel.x += (tx - vel.x) * k;
  vel.z += (tz - vel.z) * k;
  pos.x += vel.x * dt;
  pos.z += vel.z * dt;
}

/* ============ ورودی: کشیدن برای نگاه‌کردن و کلیک برای رفتن ============ */
const drag = { id: -1, x: 0, y: 0, lastX: 0, lastY: 0, t: 0, moved: false };

function onDown(e: PointerEvent) {
  if (drag.id !== -1) return; // انگشت دوم نادیده گرفته می‌شود
  if (e.pointerType === "mouse" && e.button !== 0) return;
  drag.id = e.pointerId;
  drag.x = drag.lastX = e.clientX;
  drag.y = drag.lastY = e.clientY;
  drag.t = performance.now();
  drag.moved = false;
  el?.setPointerCapture(e.pointerId);
  if (el) el.style.cursor = "grabbing";
}

function onMove(e: PointerEvent) {
  if (e.pointerId !== drag.id) return;
  if (
    !drag.moved &&
    Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > CFG.tapMaxMove
  ) {
    drag.moved = true;
    interacted.value = true;
  }
  if (drag.moved) {
    // سبک «گرفتن صحنه»: کشیدن به راست = نگاه به چپ
    yaw += (e.clientX - drag.lastX) * CFG.lookSens;
    pitch = MathUtils.clamp(
      pitch + (e.clientY - drag.lastY) * CFG.lookSens * (CFG.invertY ? -1 : 1),
      -CFG.pitchLimit,
      CFG.pitchLimit,
    );
    if (glide?.look) glide.look = false; // کاربر خودش نگاه می‌کند؛ چرخش خودکار قطع شود
  }
  drag.lastX = e.clientX;
  drag.lastY = e.clientY;
}

function onUp(e: PointerEvent) {
  if (e.pointerId !== drag.id) return;
  drag.id = -1;
  if (el) el.style.cursor = "grab";
  const isTap =
    e.type === "pointerup" &&
    !drag.moved &&
    performance.now() - drag.t < CFG.tapMaxTime;
  if (isTap) onTap(e.clientX, e.clientY);
}

function onTap(clientX: number, clientY: number) {
  // ۱) روی محصول؟ انتخابش کن و تمام
  if (interaction.pickAt?.(clientX, clientY)) {
    interacted.value = true;
    return;
  }

  // ۲) وگرنه روی زمین: برو
  const c = getCamera();
  if (!c || !el) return;
  const r = el.getBoundingClientRect();
  ndc.set(
    ((clientX - r.left) / r.width) * 2 - 1,
    -((clientY - r.top) / r.height) * 2 + 1,
  );
  c.updateMatrixWorld();
  raycaster.setFromCamera(ndc, c);
  const hit = raycaster.ray.intersectPlane(floor, hitPt);
  if (!hit || hit.distanceTo(c.position) > CFG.tapMaxDist) return;

  const path = findPath(pos, { x: hit.x, z: hit.z });
  if (!path) return;
  const end = path[path.length - 1]!;
  if (Math.hypot(end.x - pos.x, end.z - pos.z) < 0.15) return;

  interaction.close(); // کارت محصول بسته شود
  interacted.value = true;
  startGlide(path, { speed: 2.6, minDur: 0.3 });
  marker.value = { x: end.x, z: end.z };
}

/* ============ اتصال به صحنه ============ */
let warned = false;

function getCamera() {
  if (!cam) {
    const c = (unwrap(props.camera) ?? unwrap(ctx.camera)) as
      | PerspectiveCamera
      | undefined;
    if (c && (c as any).isCamera) {
      c.rotation.order = "YXZ";
      cam = c;
    } else if (import.meta.dev && !warned) {
      warned = true;
      console.warn("[shop3d] دوربین پیدا نشد:", props.camera, ctx.camera);
    }
  }
  return cam;
}

function attach() {
  const dom = unwrap(ctx.renderer)?.domElement as HTMLCanvasElement | undefined;
  if (!dom) return;
  el = dom;
  el.style.touchAction = "none"; // حیاتی روی موبایل: جلوی اسکرول و زوم صفحه
  el.style.userSelect = "none";
  el.style.cursor = "grab";
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
}

const { onBeforeRender } = useLoop();

onBeforeRender(({ delta }) => {
  if (!el) attach();
  const c = getCamera();
  if (!c) return;
  const dt = Math.min(delta, 0.05); // جلوگیری از پرش بعد از برگشت به تب

  if (keys.has("ArrowLeft")) yaw += CFG.turn * dt;
  if (keys.has("ArrowRight")) yaw -= CFG.turn * dt;

  const input = readInput();
  if (input.active && interaction.selectedIndex.value !== null)
    interaction.close();
  if (input.active && glide) stopGlide(); // حرکت دستی، سفر خودکار را لغو می‌کند

  const px = pos.x;
  const pz = pos.z;
  if (glide) updateGlide(dt);
  else stepWalk(dt, input);
  resolveCollisions(pos);

  const speed = dt > 0 ? Math.hypot(pos.x - px, pos.z - pz) / dt : 0;
  bobPhase += speed * dt * 5;
  const bob = Math.sin(bobPhase) * CFG.bob * Math.min(1, speed / CFG.walk);

  c.position.set(pos.x, CFG.eye + bob, pos.z);
  c.rotation.set(pitch, yaw, 0);

  // پرتره (موبایل): fov عمودی ثابت، میدان دید افقی را خیلی باریک می‌کرد
  if (el) {
    const aspect = el.clientWidth / Math.max(1, el.clientHeight);
    const fov =
      aspect >= 1.2
        ? 62
        : MathUtils.lerp(80, 62, MathUtils.clamp((aspect - 0.45) / 0.75, 0, 1));
    if (Math.abs(c.fov - fov) > 0.05) {
      c.fov = fov;
      c.updateProjectionMatrix();
    }
  }

  if (anchor && activeZone.value) {
    const dx = pos.x - anchor.x;
    const dz = pos.z - anchor.z;
    if (dx * dx + dz * dz > 1.44) {
      // بیشتر از ۱.۲ متر دور شد
      activeZone.value = null;
      anchor = null;
    }
  }
});

onMounted(() => {
  attach();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  if (import.meta.dev) {
    for (const v of VIEWPOINTS) {
      if (isBlocked(v.position[0], v.position[1])) {
        console.warn(
          `[shop3d] نقطه دید «${v.id}» داخل یک مانع است؛ position آن را در storeLayout.ts تغییر دهید.`,
        );
      }
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("blur", onBlur);
  if (el) {
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", onUp);
    el.removeEventListener("pointercancel", onUp);
  }
  reset();
});
</script>

<template>
  <TresGroup>
    <!-- حلقه مقصد روی زمین -->
    <TresMesh
      v-if="marker"
      :position="[marker.x, 0.02, marker.z]"
      :rotation="[-Math.PI / 2, 0, 0]"
    >
      <TresRingGeometry :args="[0.11, 0.15, 40]" />
      <TresMeshBasicMaterial
        :color="theme.hex.primary"
        :transparent="true"
        :opacity="0.9"
        :depth-write="false"
        :tone-mapped="false"
      />
    </TresMesh>
  </TresGroup>
</template>
