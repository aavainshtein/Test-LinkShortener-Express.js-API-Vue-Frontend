<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const apiUrl = 'http://localhost:3000'

async function fetchLinks({ page = 1, pageSize = 3 } = {}) {
  const url = `${apiUrl}/api/links?page=${page}&pageSize=${pageSize}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch links')
  return await response.json()
}

const links = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const columns: TableColumn<Any>[] = [
  {
    accessorKey: 'originalUrl',
    header: 'Original URL',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    },
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires At',
    cell: ({ row }) => {
      const expiresAt = row.getValue('expiresAt')
      return expiresAt
        ? new Date(expiresAt).toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : 'Never'
    },
  },
  {
    accessorKey: 'shortAlias',
    header: 'Short Alias',
  },
  {
    accessorKey: 'clickCount',
    header: () => h('div', { class: 'text-right' }, 'Clicks'),
    cell: ({ row }) =>
      h('div', { class: 'text-right font-medium' }, row.getValue('clickCount')),
  },
  {
    header: 'Actions',
    cell: ({ row }) => {
      const link = row.original
      return h('div', { class: 'flex gap-2' }, [
        h(
          'a',
          {
            href: `${apiUrl}/${link.shortAlias}`,
            target: '_blank',
            class: 'text-blue-500 hover:underline',
          },
          'Open Link',
        ),
        h(
          'button',
          {
            class: 'text-red-500 hover:underline',
            onClick: () => deleteLink(link.shortAlias),
          },
          'Delete',
        ),
      ])
    },
  },
]

async function loadLinks() {
  console.log(
    'Loading links for page:',
    page.value,
    'with page size:',
    pageSize.value,
  )
  loading.value = true
  try {
    const data = await fetchLinks({
      page: page.value,
      pageSize: pageSize.value,
    })
    links.value = data.links
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function deleteLink(shortAlias: string) {
  const url = `${apiUrl}/delete/${shortAlias}`
  console.log('url', url)
  const response = await fetch(url, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete link')
  await loadLinks()
}

onMounted(loadLinks)
</script>
<template>
  <div class="flex max-w-4xl flex-1 flex-col items-center gap-4 p-4">
    <!-- <pre>
        {{ links }}
    </pre> -->
    <UTable
      :data="links"
      :columns="columns"
      class="max-w-4xl flex-1"
      :loading="loading"
    />
    <UPagination
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
    />
  </div>
</template>
