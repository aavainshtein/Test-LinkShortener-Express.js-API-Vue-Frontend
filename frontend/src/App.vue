<script setup lang="ts">
import LinkInput from './components/LinkInput.vue'
import LinksTable from './components/LinksTable.vue'
</script>

<template>
  <UApp>
    <div class="flex h-screen flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-bold text-(--ui-primary)">Aav link shortener</h1>
      <LinkInput />
      <LinksTable />
      >
    </div>
  </UApp>
</template>
