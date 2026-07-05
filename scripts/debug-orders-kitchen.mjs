/**
 * Debug Orders + Kitchen loading issue
 */
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'
const API = 'http://localhost:3001/api/v1'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const consoleLogs = []
  const failedRequests = []
  const apiResponses = []

  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', (err) => consoleLogs.push(`[PAGEERROR] ${err.message}`))
  page.on('response', async (res) => {
    const url = res.url()
    if (url.includes('localhost:3001') || url.includes('/api/v1')) {
      apiResponses.push({ url, status: res.status() })
      if (res.status() >= 400) failedRequests.push({ url, status: res.status() })
    }
  })

  // Direct API test
  console.log('=== API direct ===')
  for (const [name, url, headers] of [
    ['health', `${API}/health/live`, {}],
    ['orders', `${API}/orders`, { 'X-Restaurant-Id': '660e8400-e29b-41d4-a716-446655440001' }],
    ['kitchen', `${API}/kitchen/orders`, { 'X-Restaurant-Id': '660e8400-e29b-41d4-a716-446655440001' }],
  ]) {
    try {
      const r = await fetch(url, { headers })
      const body = await r.text()
      console.log(`${name}: ${r.status} ${body.slice(0, 120)}`)
    } catch (e) {
      console.log(`${name}: FAIL ${e.message}`)
    }
  }

  // Login
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('#email', { timeout: 15000 })
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 })

  for (const path of ['/orders', '/kitchen']) {
    console.log(`\n=== ${path} ===`)
    apiResponses.length = 0
    failedRequests.length = 0

    await page.goto(`${BASE}${path}`)
    await page.waitForTimeout(6000)

    const text = await page.locator('body').innerText()
    const stuck = text.includes('Yükleniyor')
    console.log('Stuck loading:', stuck)
    console.log('Body preview:', text.replace(/\s+/g, ' ').slice(0, 300))
    console.log('Failed requests:', JSON.stringify(failedRequests, null, 2))
    console.log('API calls:', apiResponses.map((r) => `${r.status} ${r.url}`).join('\n  '))
    console.log('Console errors:', consoleLogs.filter((l) => l.includes('[error]') || l.includes('PAGEERROR')).slice(-10))
  }

  await browser.close()
}

main().catch(console.error)
