<template>
  <div class="header">
    <router-link to="/">
      <icon-back />
    </router-link>
    <div class="ml-3 leading-tight">
      <slot />
    </div>
  </div>
</template>

<script setup>
import IconBack from '/@vite-icons/mdi/arrow-left.vue'
</script>

<style scoped>
.header {
  @apply text-center w-full bg-green-400 p-2 text-white dark:text-black flex
    items-center text-3xl;
}
</style>
