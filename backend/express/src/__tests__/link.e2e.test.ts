
import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../app.js' 
import { PrismaClient } from '@prisma/client'
import { ErrorName, ErrorMessages } from '../utils/errors.constants.js'

const prisma = new PrismaClient()

describe('Link API E2E Tests', () => {
  // Test Case 1: Create a link with a unique custom alias
  it('should create a short link with a unique custom alias', async () => {
    const customAlias = 'my-unique-test-alias'
    const originalUrl = 'https://example.com/custom-test'

    const response = await request(app)
      .post('/api/shorten')
      .send({ originalUrl, alias: customAlias })
      .expect(201)

    expect(response.body.originalUrl).toBe(originalUrl)
    expect(response.body.alias).toBe(customAlias)

    
    const createdLink = await prisma.link.findUnique({
      where: { alias: customAlias },
    })
    expect(createdLink).toBeDefined()
    expect(createdLink?.originalUrl).toBe(originalUrl)
    expect(createdLink?.alias).toBe(customAlias)
  })

  // Test Case 2: Error on same alias
  it('should return 409 Conflict if custom alias is already taken', async () => {
    const customAlias = 'existing-test-alias'
    const originalUrl1 = 'https://example.com/first-test'
    const originalUrl2 = 'https://example.com/second-test'

    await request(app)
      .post('/api/shorten')
      .send({ originalUrl: originalUrl1, alias: customAlias })
      .expect(201)

    const response = await request(app)
      .post('/api/shorten')
      .send({ originalUrl: originalUrl2, alias: customAlias })
      .expect(409)

    expect(response.body.error.message).toBe(ErrorMessages[ErrorName.Conflict])
  })

  // Test Case 3: Redirect to the original URL
  it('should redirect to the original URL and log a click', async () => {
    const originalUrl = 'https://www.example.org/redirect-test'
    let alias = ''

    const creationResponse = await request(app)
      .post('/api/shorten')
      .send({ originalUrl })
      .expect(201)
    alias = creationResponse.body.shortUrl.split('/').pop()

    const redirectResponse = await request(app).get(`/${alias}`).expect(302)

    expect(redirectResponse.headers.location).toBe(originalUrl)

    const updatedLink = await prisma.link.findUnique({
      where: { shortAlias: alias },
      include: { clicks: true },
    })

    expect(updatedLink).toBeDefined()
    expect(updatedLink?.clickCount).toBe(1)

    expect(updatedLink?.clicks.length).toBe(1)
    expect(updatedLink?.clicks[0].ipAddress).toBeDefined()
    expect(updatedLink?.clicks[0].clickedAt).toBeInstanceOf(Date)
  })

  it('should return 404 Not Found if short alias for redirect does not exist', async () => {
    const nonExistentAlias = 'non_existent_123'

    const response = await request(app).get(`/${nonExistentAlias}`).expect(404)

    console.log('response body', response.body)

    expect(response.body.error.message).toBe('Short URL not found.')
  })
})
