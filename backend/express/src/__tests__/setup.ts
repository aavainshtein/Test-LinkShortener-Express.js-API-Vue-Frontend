import { beforeAll, beforeEach, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { exec as execCallback } from 'child_process'
import { promisify } from 'util'
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: './.env.test' })

const exec = promisify(execCallback)
const prisma = new PrismaClient()

const PRISMA_SCHEMA_PATH = path.resolve(__dirname, '../../prisma/schema.prisma')

const DATABASE_URL_TEST = process.env.DATABASE_URL || ''
const DB_NAME_TEST = new URL(DATABASE_URL_TEST).pathname.substring(1)
const DB_HOST_TEST = new URL(DATABASE_URL_TEST).hostname
const DB_PORT_TEST = new URL(DATABASE_URL_TEST).port
const DB_USER_TEST = new URL(DATABASE_URL_TEST).username
const DB_PASSWORD_TEST = new URL(DATABASE_URL_TEST).password

const masterDbClient = new Client({
  host: DB_HOST_TEST,
  port: parseInt(DB_PORT_TEST, 10),
  user: DB_USER_TEST,
  password: DB_PASSWORD_TEST,
  database: 'postgres',
})

beforeAll(async () => {
  console.log(`Setting up test database: ${DB_NAME_TEST}`)

  try {
    await masterDbClient.connect()

    const res = await masterDbClient.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME_TEST}'`,
    )
    if (res.rowCount === 0) {
      console.log(`Database '${DB_NAME_TEST}' does not exist. Creating it...`)
      await masterDbClient.query(`CREATE DATABASE "${DB_NAME_TEST}"`)
      console.log(`Database '${DB_NAME_TEST}' created successfully.`)
    } else {
      console.log(`Database '${DB_NAME_TEST}' already exists.`)
    }
  } catch (error) {
    console.error('Error connecting to master DB or creating test DB:', error)
    process.exit(1)
  } finally {
    await masterDbClient.end()
  }

  console.log('Applying Prisma migrations to test database...')
  try {
    await exec(`npx prisma migrate deploy --schema=${PRISMA_SCHEMA_PATH}`)
    console.log('Prisma migrations applied successfully.')
  } catch (error: any) {
    console.error('Prisma migrate deploy failed:', error.message)
    process.exit(1)
  }
})

beforeEach(async () => {
  await prisma.$transaction([
    prisma.click.deleteMany(),
    prisma.link.deleteMany(),
  ])
})

afterAll(async () => {
  await prisma.$transaction([
    prisma.click.deleteMany(),
    prisma.link.deleteMany(),
  ])
  await prisma.$disconnect()
  console.log('Test database disconnected.')
})
