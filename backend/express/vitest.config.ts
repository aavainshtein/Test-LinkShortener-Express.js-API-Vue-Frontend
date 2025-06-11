import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config({ path: './.env.test' })

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    passWithNoTests: false,
    include: ['**/*.{test,spec,e2e.test}.?(c|m)[jt]s?(x)'],
  },
})
