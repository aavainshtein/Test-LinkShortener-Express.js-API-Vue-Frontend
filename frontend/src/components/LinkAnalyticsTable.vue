<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  link: {
    id: string
    originalUrl: string
    shortAlias: string | null
  }
}>()

const isLoading = ref(false)

const analyticsData = ref<{
  clicks: Array<{
    id: string
    timestamp: string
    ipAddress: string
    userAgent: string
  }>
}>({
  clicks: [],
})

async function fetchAnalytics(shortAlias: string) {
  isLoading.value = true
  const url = `http://localhost:3000/analytics/${shortAlias}`
  const response = await fetch(url)
  console.log('Analytics response:', response)
  if (!response.ok) throw new Error('Failed to fetch analytics')
  analyticsData.value = await response.json()
  isLoading.value = false
}

watch(
  () => props.link.shortAlias,
  (newAlias) => {
    if (newAlias) fetchAnalytics(newAlias)
  },
  { immediate: true },
)

const columns: TableColumn<Any>[] = [
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
  },
  {
    accessorKey: 'clickedAt',
    header: 'Clicked At',
    cell: ({ row }) => {
      return new Date(row.getValue('clickedAt')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    },
  },
]
</script>
<template>
  <!-- {{ analyticsData }} -->
  <UTable
    :loading="isLoading"
    :data="analyticsData.clicks"
    :columns="columns"
    class="w-full max-w-4xl"
  />
</template>
