<!-- app/components/shop3d/Effects.vue -->
<script setup lang="ts">
import { BloomPmndrs, EffectComposerPmndrs, ToneMappingPmndrs } from '@tresjs/post-processing'
import { ToneMappingMode } from 'postprocessing'
</script>

<template>
  <!-- وقتی composer فعال است، tone mapping رندرر کار نمی‌کند؛
       پس Neutral را در انتهای زنجیره خودمان اضافه می‌کنیم -->
  <EffectComposerPmndrs :multisampling="4">
    <BloomPmndrs
      :intensity="0.85"
      :luminance-threshold="1.2"
      :luminance-smoothing="0.15"
      :mipmap-blur="true"
      :radius="0.75"
    />
    <ToneMappingPmndrs :mode="ToneMappingMode.NEUTRAL" />
  </EffectComposerPmndrs>
</template>