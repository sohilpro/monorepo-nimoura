<template>
  <svg
    class="absolute left-0 top-0 h-full w-full stroke-black/10 stroke-[2] [mask-image:radial-gradient(circle_at_center,rgba(255,255,255,1)_20%,rgba(255,255,255,0)_95%)]"
  >
    <rect
      width="100%"
      height="100%"
      stroke-width="0"
      fill="url(#grid-pattern)"
    ></rect>
    <defs>
      <pattern
        id="grid-pattern"
        viewBox="0 0 64 64"
        width="60"
        height="60"
        patternUnits="userSpaceOnUse"
      >
        <path d="M64 0H0V64" fill="none"></path>
      </pattern>
    </defs>
  </svg>
</template>
