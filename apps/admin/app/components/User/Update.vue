<template>
  <UserForm mode="update" :user-id="userId" />
</template>

<script setup lang="ts">
const route = useRoute();
const userId = computed(() => (route.params.slug || route.params.id) as string);
</script>
