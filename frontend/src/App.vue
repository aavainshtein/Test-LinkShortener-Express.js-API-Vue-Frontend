<script setup lang="ts">
import LinkInput from './components/LinkInput.vue'
import LinksTable from './components/LinksTable.vue'
import { useTemplateRef } from 'vue'

// the first argument must match the ref value in the template
const linksTable = useTemplateRef('linksTable')
</script>

<template>
  <UApp :toaster="{ position: 'top-center', duration: 3000 }">
    <div class="flex flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-bold text-(--ui-primary)">Aav link shortener</h1>
      <LinkInput @linkCreated="linksTable?.loadLinks" />
      <LinksTable ref="linksTable" />
    </div>
  </UApp>
</template>
