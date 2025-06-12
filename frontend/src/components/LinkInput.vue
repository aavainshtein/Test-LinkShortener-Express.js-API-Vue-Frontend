<script setup lang="ts">
import { ref } from 'vue'

const originalUrl = ref('')
function submitLink() {
  // Handle the link submission logic here
  console.log('Link submitted')
}
</script>
<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col items-center justify-center gap-4"
    @submit.prevent="submitLink"
  >
    <UFormField
      label="Original url"
      name="originalUrl"
      size="xl"
    >
      <UInput
        v-model="originalUrl"
        label="Enter a link"
        placeholder="https://example.com"
        icon="i-lucide-link"
        class="w-full max-w-md"
      />
    </UFormField>

    <UButton
      label="Submit"
      color="primary"
      class="mt-4"
      @click="submitLink"
    />
  </UForm>
</template>
