<script setup lang="ts">
import z from 'zod'
import { ref, reactive } from 'vue'
// import { createLinkSchema } from '../../../shared/schemas/link.schema'

const schema = z.object({
  originalUrl: z
    .string()
    .url('Invalid URL format')
    .min(1, 'Original URL cannot be empty'),
  expiresAt: z
    .union([
      z
        .string()
        .datetime({ message: 'Invalid ISO 8601 date format', local: true })
        .optional(),
      z.null(),
    ])
    .optional(), // Optional, can be null or a valid ISO 8601 string
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

const handleShorten = async () => {
  console.log('Submitting link with state:', state)
  try {
    // Валидация данных с фронтенда с использованием Zod

    const response = await fetch(`http://localhost:3000/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    })
    console.log('Shortened link response:', response)
    resetForm() // Сброс формы после успешного создания ссылки
  } catch (err: any) {
    console.error('Frontend shorten error:', err)
  }
}
</script>
<template>
  <pre>
    {{ state }}
  </pre>
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
    <div class="flex w-full max-w-md gap-4">
      <UFormField
        label="Expiration date"
        name="expiresAt"
        size="xl"
      >
        <UInput
          :disabled="!state.originalUrl"
          v-model="state.expiresAt"
          type="datetime-local"
          label="Set expiration date"
          placeholder="YYYY-MM-DDTHH:MM"
          class="w-full max-w-md"
          @change="
            (e) => {
              state.expiresAt =
                e.target.value.trim() === '' ? null : e.target.value
            }
          "
        />
        <!-- <UCalendar v-model="state.expiresAt" /> -->
      </UFormField>
      <UFormField
        label="Custom alias"
        name="alias"
        size="xl"
      >
        <UInput
          v-model="state.alias"
          label="Enter a custom alias"
          placeholder="my-custom-alias"
          icon="i-lucide-hashtag"
          class="w-full max-w-md"
        />
      </UFormField>
    </div>
    <UButton
      label="Submit"
      color="primary"
      class="mt-4"
      type="submit"
    />
  </UForm>
</template>
