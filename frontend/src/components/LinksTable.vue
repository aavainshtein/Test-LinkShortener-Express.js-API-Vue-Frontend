<script setup lang="ts">
import { ref, onMounted, h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import LinkAnalyticsTable from './LinkAnalyticsTable.vue'

const toast = useToast()

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined in environment variables')
}

const apiUrl = import.meta.env.VITE_API_URL

const isDeleteModalOpen = ref(false)
const selectedLink = ref<any | null>(null)

const openDeleteModal = (link: any) => {
  selectedLink.value = link
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedLink.value = null
}

const UButton = resolveComponent('UButton')

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

const expanded = ref<{ [x: number]: boolean } | null>(null)

async function copyUrl(shortAlias: string) {
  const url = `${apiUrl}/${shortAlias}`
  try {
    await navigator.clipboard.writeText(url)
    console.log('URL copied to clipboard:', url)
    toast.add({
      title: 'Success',
      description:
        'Shortened link created and copied to clipboard successfully!',
      icon: 'i-lucide-check-circle',
      color: 'success',
    })
  } catch (error) {
    console.error('Failed to copy URL:', error)
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to create shortened link',
      icon: 'i-lucide-x-circle',
      color: 'error',
    })
  }
}

const columns: TableColumn<Any>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : '',
          ],
        },
        onClick: () => (expanded.value = { [row.index]: !row.getIsExpanded() }),
      }),
  },
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
        h(UButton, {
          color: 'primary',
          variant: 'outlined',
          class: 'text-sm',
          icon: 'i-lucide-copy',
          onClick: () => copyUrl(link.shortAlias),
        }),
        h(UButton, {
          color: 'error',
          variant: 'outlined',
          class: 'text-sm text-red-500',
          icon: 'i-lucide-trash',
          onClick: () => openDeleteModal(link),
        }),
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
  selectedLink.value = null
  isDeleteModalOpen.value = false
  if (!response.ok) throw new Error('Failed to delete link')
  await loadLinks()
}

defineExpose({
  loadLinks,
})

onMounted(loadLinks)
</script>
<template>
  <div class="flex max-w-4xl flex-1 flex-col items-center gap-4 p-4">
    <!-- <pre>
        {{ links }}
    </pre> -->
    <UTable
      :expanded="expanded"
      :data="links"
      :columns="columns"
      class="max-w-4xl flex-1"
      :loading="loading"
    >
      <template #originalUrl-cell="{ row }">
        <UTooltip
          :text="row.original.originalUrl"
          placement="top"
          class="max-w-xs"
        >
          <span class="truncate">
            {{
              row.original.originalUrl.length > 20
                ? `${row.original.originalUrl.slice(0, 20)}...`
                : row.original.originalUrl
            }}
          </span>
        </UTooltip>
      </template>
      <template #expanded="{ row }">
        <div
          class="flex flex-col items-center justify-between rounded-lg bg-neutral-100 p-4"
        >
          <div class="flex-1">
            <h3 class="x font-semibold">Link cliks</h3>
          </div>
          <div class="flex-1 p-2">
            <LinkAnalyticsTable :link="row.original" />
          </div>
        </div>
      </template>
    </UTable>
    <UPagination
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
      @update:page="
        (newPage) => {
          loadLinks()
        }
      "
    />
  </div>
  <UModal
    v-model:open="isDeleteModalOpen"
    :close="{ onClick: closeDeleteModal }"
    :title="`Are you sure you want to delete this link?`"
  >
    <template #body>
      <p class="text-sm">
        Short link
        <strong>{{ `${apiUrl}/${selectedLink?.shortAlias}` }}</strong>
      </p>
      <p>
        for the original link
        <strong>{{ selectedLink?.originalUrl }}</strong> will be permanently
        deleted.
      </p>
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          label="Dismiss"
          @click="closeDeleteModal"
        />
        <UButton
          label="Delete"
          color="error"
          @click="deleteLink(selectedLink.shortAlias)"
        />
      </div>
    </template>
  </UModal>
</template>
