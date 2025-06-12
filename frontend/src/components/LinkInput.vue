<script setup lang="ts">
import z from 'zod'
import { ref, computed, reactive } from 'vue'

const emits = defineEmits<{
  (e: 'linkCreated'): void
}>()

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined in environment variables')
}

const apiUrl = import.meta.env.VITE_API_URL

const toast = useToast()

function isUrlValid(url: string | undefined) {
  if (!url) return true // the link is optional in the schema so if it's empty it's valid
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  )
  return !!pattern.test(url)
}

const schema = z.object({
  originalUrl: z
    .string()
    .url('Invalid URL format')
    .min(1, 'Original URL cannot be empty')
    .refine((url) => isUrlValid(url), {
      message: 'Invalid URL format',
    }),
  expiresAt: z
    .union([
      z
        .string()
        .datetime({ message: 'Invalid ISO 8601 date format', local: true })
        .optional(),
      z.null(),
    ])
    .optional(),
  alias: z.union([
    z
      .string()
      .min(1, 'Alias cannot be empty')
      .max(20, 'Alias too long')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Alias can only contain alphanumeric characters, hyphens, and underscores',
      )
      .optional(),
    z.null(),
  ]),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema & { remember: boolean }>>({
  originalUrl: '',
  expiresAt: null,
  alias: null,
  remember: false,
})

function resetForm() {
  state.originalUrl = ''
  state.expiresAt = null
  state.alias = null
}

const isUrlInputValid = computed(() => {
  if (!state.originalUrl) return false // if the field is empty, it's valid
  const urlResult = schema.shape.originalUrl.safeParse(state.originalUrl)
  if (!urlResult.success) return false
  return true
})

const handleShorten = async () => {
  console.log('Submitting link with state:', state)
  try {
    // Валидация данных с фронтенда с использованием Zod
    const response = await fetch(`${apiUrl}/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    })
    const data = await response.json()
    console.log('Shortened link response:', data?.shortUrl)
    if (data?.shortUrl) {
      await navigator.clipboard.writeText(data.shortUrl)
      console.log('Ссылка скопирована в буфер обмена:', data.shortUrl)
    }
    toast.add({
      title: 'Success',
      description:
        'Shortened link created and copied to clipboard successfully!',
      icon: 'i-lucide-check-circle',
      color: 'success',
    })
    resetForm()
    emits('linkCreated')
  } catch (err: any) {
    console.error('Frontend shorten error:', err)
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to create shortened link',
      icon: 'i-lucide-x-circle',
      color: 'error',
    })
  }
}
</script>
<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col items-center justify-center gap-4"
    @submit.prevent="() => handleShorten()"
  >
    <UFormField
      label="Original url"
      name="originalUrl"
      size="xl"
      class="w-full max-w-md"
    >
      <UInput
        v-model="state.originalUrl"
        label="Enter a link"
        placeholder="https://example.com"
        icon="i-lucide-link"
        class="w-full max-w-md"
      />
    </UFormField>
    <div
      class="flex w-full max-w-md gap-4"
      :class="!!isUrlInputValid ? '' : 'opacity-50'"
    >
      <UFormField
        label="Expiration date"
        name="expiresAt"
        :eager-validation="true"
        size="xl"
      >
        <UInput
          :disabled="!isUrlInputValid"
          v-model="state.expiresAt"
          type="datetime-local"
          label="Set expiration date"
          placeholder="YYYY-MM-DDTHH:MM"
          class="w-full max-w-md"
          @change="
            (e) => {
              const target = e.target as HTMLInputElement | null
              state.expiresAt =
                target && target.value.trim() === '' ? null : target?.value
            }
          "
        />
      </UFormField>
      <UFormField
        label="Custom alias"
        name="alias"
        size="xl"
      >
        <UInput
          v-model="state.alias"
          :disabled="!isUrlInputValid"
          label="Enter a custom alias"
          placeholder="my-custom-alias"
          icon="i-lucide-tag"
          class="w-full max-w-md"
        />
      </UFormField>
    </div>
    <UButton
      label="Shorten"
      color="primary"
      class="mt-4"
      type="submit"
    />
  </UForm>
</template>
