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
      <h1 class="mt-4 text-2xl font-bold text-(--ui-primary)">Link shortener</h1>
      <LinkInput @linkCreated="linksTable?.loadLinks" />
      <LinksTable ref="linksTable" />
      <div class="flex flex-col items-center justify-center gap-2">
        <span class="text-sm text-gray-500">
          Made by Aleksandr Vainshtein
        </span>
        <a
          class="text-(--ui-primary) hover:underline"
          href="https://hh.ru/resume/cae773a8ff0ec7c1490039ed1f784741747a67"
          target="_blank"
          rel="noopener noreferrer"
        >
          Head-Hunter
        </a>
        <a
          class="text-(--ui-primary) hover:underline"
          href="mailto:asderq@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          asderq@gmail.com
        </a>
      </div>
    </div>
  </UApp>
</template>
