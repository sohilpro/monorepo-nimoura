<template>
  <div>
    <AuthLoginAndRegister v-if="step === 'phoneAndEmail'" @success="showConfirmForm" />
    <AuthConfirmCode v-if="step === 'confirm'" :identity="identity" @edit="goBackToEdit" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const step = ref<"phoneAndEmail" | "confirm">("phoneAndEmail");
const identity = ref("");

function showConfirmForm(value: string) {
  identity.value = value;
  step.value = "confirm";
}

function goBackToEdit() {
  step.value = "phoneAndEmail";
}
</script>