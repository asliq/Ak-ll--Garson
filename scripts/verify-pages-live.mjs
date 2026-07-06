/**
 * Live browser verification — console + network + loading state
 */
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:5173'
const OUT = join(__dirname, '..', 'docs', 'live-page-verification.json')

const PAGES = [
  { path: '/', label: 'Dashboard', expect: ['Dashboard', 'Merhaba', 'sipariş'], staff: true },
  { path: '/orders', label: 'Orders', expect: ['Sipariş', 'sipariş'], staff: true },
  { path: '/kitchen', label: 'Kitchen', expect: ['Mutfak', 'aktif'], staff: true },
  { path: '/menu', label: 'Menu', expect: ['Menü', 'Ürün', 'Kategori'], staff: true },
  { path: '/customer/menu', label: 'Customer Menu', expect: ['Masa', 'Mercimek', 'Menüde ara'], customer: true },
  { path: '/customer/orders', label: 'Customer Orders', expect: ['Siparişlerim', 'Sipariş', 'Henüz sipariş'], customer: true },
]

function isStuckLoading(text) {
  const loaders = ['Yükleniyor…', 'Yükleniyor...', 'Menü yükleniyor', 'Oturum kontrol']
  const hasLoader = loaders.some((l) => text.includes(l))
  if (!hasLoader) return false
  // Main content indicators
  const hasContent = /sipariş|Mutfak|Menü|Dashboard|Mercimek|Siparişlerim|Ürün|Merhaba/i.test(text)
  return !hasContent
}

async function staffLogin(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() =>
    page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' }),
  )
  await page.waitForSelector('#email', { timeout: 15000 })
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 })
  await page.waitForTimeout(2000)
}

async function verifyPage(page, route) {
  const consoleErrors = []
  const consoleWarnings = []
  const failedRequests = []
  const pendingRequests = []
  const apiCalls = []

  const onConsole = (msg) => {
    const t = msg.type()
    const text = msg.text()
    if (t === 'error') consoleErrors.push(text)
    if (t === 'warning' && !text.includes('React Router')) consoleWarnings.push(text)
  }
  const onPageError = (err) => consoleErrors.push(`PAGEERROR: ${err.message}`)
  const onRequest = (req) => {
    const url = req.url()
    if (url.includes('/api/v1') || url.includes('localhost:3001')) {
      pendingRequests.push({ url, method: req.method() })
    }
  }
  const onResponse = (res) => {
    const url = res.url()
    if (url.includes('/api/v1') || url.includes('localhost:3001')) {
      const idx = pendingRequests.findIndex((p) => p.url === url)
      if (idx >= 0) pendingRequests.splice(idx, 1)
      apiCalls.push({ url, status: res.status(), method: res.request().method() })
      if (res.status() >= 400) {
        failedRequests.push({ url, status: res.status(), method: res.request().method() })
      }
    }
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)
  page.on('request', onRequest)
  page.on('response', onResponse)

  try {
    if (route.customer) {
      await page.evaluate(() => {
        localStorage.setItem(
          'customerTable',
          JSON.stringify({ tableToken: 'qr-masa-1', tableNumber: 'Masa 1' }),
        )
      })
    }

    await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() =>
      page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 45000 }),
    )

    // Wait up to 12s for loading to clear
    let text = ''
    let stuck = true
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(1000)
      text = await page.locator('body').innerText()
      stuck = isStuckLoading(text)
      if (!stuck) break
    }

    const hasExpected = route.expect.some((e) => text.includes(e))
    const reactError = consoleErrors.find((e) => e.includes('PAGEERROR') || e.includes('Uncaught'))
    const criticalFail = failedRequests.filter((r) => r.status >= 500 || r.status === 401)

    let status = 'PASS'
    let rootCause = null

    if (reactError) {
      status = 'FAIL'
      rootCause = `React: ${reactError.slice(0, 150)}`
    } else if (stuck) {
      status = 'FAIL'
      const pending = pendingRequests.map((p) => `${p.method} ${p.url}`).slice(0, 3)
      const failed = failedRequests.map((r) => `${r.status} ${r.url}`).slice(0, 3)
      const lastApi = apiCalls.slice(-5).map((a) => `${a.status} ${a.url}`)
      rootCause = `Stuck loading. Failed: [${failed.join('; ')}]. Pending: [${pending.join('; ')}]. Recent API: [${lastApi.join('; ')}]`
    } else if (criticalFail.length && !hasExpected) {
      status = 'FAIL'
      rootCause = `HTTP ${criticalFail[0].status} ${criticalFail[0].url}`
    } else if (!hasExpected) {
      status = 'FAIL'
      rootCause = `Missing content. Expected one of: ${route.expect.join(', ')}. Got: ${text.slice(0, 120)}`
    }

    page.off('console', onConsole)
    page.off('pageerror', onPageError)
    page.off('request', onRequest)
    page.off('response', onResponse)

    return {
      page: route.label,
      path: route.path,
      status,
      rootCause,
      consoleErrors: consoleErrors.slice(0, 5),
      failedRequests,
      apiCalls: apiCalls.filter((a) => a.url.includes('/orders') || a.url.includes('/menu') || a.url.includes('/public')),
      bodyPreview: text.replace(/\s+/g, ' ').slice(0, 250),
    }
  } catch (err) {
    page.off('console', onConsole)
    page.off('pageerror', onPageError)
    page.off('request', onRequest)
    page.off('response', onResponse)
    return { page: route.label, path: route.path, status: 'FAIL', rootCause: err.message }
  }
}

async function main() {
  // API smoke
  const apiBase = 'http://localhost:3001/api/v1'
  const rid = '660e8400-e29b-41d4-a716-446655440001'
  for (const [name, url, headers] of [
    ['health', `${apiBase}/health/live`, {}],
    ['orders', `${apiBase}/orders`, { 'X-Restaurant-Id': rid }],
    ['menu-cat', `${apiBase}/menu/categories`, { 'X-Restaurant-Id': rid }],
    ['public-menu', `${apiBase}/public/menu/qr-masa-1`, {}],
  ]) {
    try {
      const r = await fetch(url, { headers })
      console.log(`API ${name}: ${r.status}`)
    } catch (e) {
      console.log(`API ${name}: DOWN — ${e.message}`)
      process.exit(2)
    }
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const results = []

  await staffLogin(page)

  for (const route of PAGES.filter((p) => p.staff)) {
    const r = await verifyPage(page, route)
    results.push(r)
    console.log(`${r.status === 'PASS' ? '✓' : '✗'} ${r.page}: ${r.status}${r.rootCause ? ` — ${r.rootCause.slice(0, 100)}` : ''}`)
  }

  // Customer pages — fresh storage
  await page.evaluate(() => {
    localStorage.setItem(
      'customerTable',
      JSON.stringify({ tableToken: 'qr-masa-1', tableNumber: 'Masa 1' }),
    )
  })

  for (const route of PAGES.filter((p) => p.customer)) {
    const r = await verifyPage(page, route)
    results.push(r)
    console.log(`${r.status === 'PASS' ? '✓' : '✗'} ${r.page}: ${r.status}${r.rootCause ? ` — ${r.rootCause.slice(0, 100)}` : ''}`)
  }

  await browser.close()
  writeFileSync(OUT, JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2))

  const fails = results.filter((r) => r.status === 'FAIL').length
  process.exit(fails > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
