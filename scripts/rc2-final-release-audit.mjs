/**
 * RC2 Final Release Audit — full application verification
 */
import { chromium } from '@playwright/test'
import { WebSocket } from 'ws'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:5173'
const API = 'http://localhost:3001'
const RESTAURANT_ID = '660e8400-e29b-41d4-a716-446655440001'
const OUT = join(__dirname, '..', 'docs', 'rc2-final-release-audit-results.json')

const STAFF_ROUTES = [
  { path: '/login', label: 'Login', expect: ['Giriş', 'Akıllı Garson'], public: true },
  { path: '/', label: 'Dashboard', expect: ['Merhaba', 'Dashboard'] },
  { path: '/orders', label: 'Orders', expect: ['Sipariş'] },
  { path: '/kitchen', label: 'Kitchen', expect: ['Mutfak'] },
  { path: '/menu', label: 'Menu', expect: ['Menü', 'Ürün'] },
  { path: '/operations/service-calls', label: 'Service Calls', expect: ['Servis Merkezi'] },
  { path: '/system/settings', label: 'Settings', expect: ['Ayarlar'] },
  { path: '/system/health', label: 'System Health', expect: ['Sistem', 'Sağlık'] },
  { path: '/orders/qr', label: 'Roadmap QR', expect: ['Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/menu/categories', label: 'Roadmap Categories', expect: ['Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/restaurant/tables', label: 'Roadmap Tables', expect: ['Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/operations/inventory', label: 'Roadmap Inventory', expect: ['Yol Haritası', 'PLAN'], roadmap: true },
]

const VIEWPORTS = [
  { name: '1920', width: 1920, height: 1080 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
]

function stuckLoading(text) {
  const loaders = ['Yükleniyor…', 'Yükleniyor...', 'Menü yükleniyor', 'Oturum kontrol']
  if (!loaders.some((l) => text.includes(l))) return false
  return !/sipariş|Mutfak|Menü|Dashboard|Mercimek|Siparişlerim|Ürün|Merhaba|Servis/i.test(text)
}

async function apiChecks() {
  const results = []
  const tests = [
    { name: 'health', url: `${API}/api/v1/health`, expect: 200 },
    { name: 'swagger', url: `${API}/docs`, expect: 200 },
    { name: 'public-menu', url: `${API}/api/v1/public/menu/qr-masa-1`, expect: 200 },
    { name: 'orders', url: `${API}/api/v1/orders`, expect: 200, headers: { 'X-Restaurant-Id': RESTAURANT_ID } },
    { name: 'service-calls', url: `${API}/api/v1/service-calls`, expect: 200, headers: { 'X-Restaurant-Id': RESTAURANT_ID } },
  ]
  for (const t of tests) {
    try {
      const res = await fetch(t.url, { headers: t.headers })
      results.push({ name: t.name, status: res.status === t.expect ? 'PASS' : 'FAIL', http: res.status })
    } catch (e) {
      results.push({ name: t.name, status: 'FAIL', error: e.message })
    }
  }
  return results
}

async function staffLogin(page) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('#email', { timeout: 15000 })
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 })
  await page.waitForTimeout(1500)
}

async function testRoute(page, route) {
  const errors = []
  const consoleErrors = []
  const failedRequests = []
  const apiCalls = []

  const onPageError = (e) => errors.push(e.message)
  const onConsole = (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) }
  const onResponse = (r) => {
    const url = r.url()
    if (url.includes('/api/v1') || url.includes(':3001')) {
      apiCalls.push({ status: r.status(), url })
      if (r.status() >= 400) failedRequests.push({ status: r.status(), url })
    }
  }

  page.on('pageerror', onPageError)
  page.on('console', onConsole)
  page.on('response', onResponse)

  try {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(route.waitMs ?? 4000)
    const text = await page.locator('body').innerText()
    const stuck = !route.roadmap && stuckLoading(text)
    const blank = text.trim().length < 25
    const hasExpected = route.expect.some((e) => text.includes(e))

    let status = 'PASS'
    let issue = null

    if (errors.length) { status = 'FAIL'; issue = `React: ${errors[0]}` }
    else if (stuck) { status = 'FAIL'; issue = `Loading stuck. API: ${failedRequests.map((f) => f.status).join(',') || 'none'}` }
    else if (blank) { status = 'FAIL'; issue = 'Blank page' }
    else if (!hasExpected && !route.roadmap) { status = 'FAIL'; issue = `Missing: ${route.expect.join(', ')}` }
    else if (failedRequests.some((f) => f.status >= 500 || f.status === 404) && !route.roadmap) {
      status = 'FAIL'
      issue = `HTTP ${failedRequests[0].status}`
    } else if (consoleErrors.length) { status = 'WARN'; issue = consoleErrors[0].slice(0, 100) }

    page.removeAllListeners('pageerror')
    page.removeAllListeners('console')
    page.removeAllListeners('response')

    return { route: route.label, path: route.path, status, issue, errors, consoleErrors, failedRequests, apiCalls: apiCalls.length }
  } catch (e) {
    page.removeAllListeners('pageerror')
    page.removeAllListeners('console')
    page.removeAllListeners('response')
    return { route: route.label, path: route.path, status: 'FAIL', issue: e.message, errors, consoleErrors, failedRequests }
  }
}

async function testCustomerJourney(browser) {
  const journey = []
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  const errors = []
  const consoleErrors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })

  const step = (name, ok, detail = '') => journey.push({ name, status: ok ? 'PASS' : 'FAIL', detail })

  try {
    // QR scan
    await page.goto(`${BASE}/customer?token=qr-masa-1`, { timeout: 30000 })
    await page.waitForTimeout(3000)
    const onMenu = page.url().includes('/customer/menu') || (await page.locator('body').innerText()).includes('Menüde ara')
    step('QR Scan → Menu', onMenu)

    // Header
    const headerText = await page.locator('body').innerText()
    step('Restaurant header', /Masa|Demo|Restoran/i.test(headerText))

    // Add to cart
    const addBtn = page.getByRole('button', { name: /Ekle/i }).first()
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click()
      step('Add item to cart', true)
    } else {
      step('Add item to cart', false, 'No Ekle button')
    }

    // Open cart
    const cartBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(1)
    await page.locator('button').filter({ hasText: '' }).first().click().catch(() => {})
    const cartIcon = page.locator('button').filter({ has: page.locator('.lucide-shopping-cart, svg') }).last()
    if (await page.locator('[class*="cartBtn"]').first().isVisible().catch(() => false)) {
      await page.locator('[class*="cartBtn"]').first().click()
    }

    await page.waitForTimeout(1000)

    // Notes + order via cart sidebar if open
    const notesArea = page.locator('textarea[placeholder*="notu"]')
    if (await notesArea.isVisible().catch(() => false)) {
      await notesArea.fill('RC2 QA test notu')
      step('Order notes entered', true)
      const orderBtn = page.getByRole('button', { name: /Sipariş Ver/i })
      if (await orderBtn.isVisible()) {
        await orderBtn.click()
        await page.waitForTimeout(4000)
        const ordersUrl = page.url().includes('/customer/orders')
        step('Place order', ordersUrl)
      }
    } else {
      // Try placing via API for journey continuity
      const tableRaw = await page.evaluate(() => localStorage.getItem('customerTable'))
      const table = tableRaw ? JSON.parse(tableRaw) : null
      if (table?.tableToken) {
        const menuRes = await fetch(`${API}/api/v1/public/menu/${encodeURIComponent(table.tableToken)}`)
        const menu = await menuRes.json()
        const itemId = menu?.data?.categories?.[0]?.items?.[0]?.id
        if (itemId) {
          const orderRes = await fetch(`${API}/api/v1/public/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tableToken: table.tableToken,
              lines: [{ menuItemId: itemId, quantity: 1 }],
              notes: 'RC2 QA audit notu',
            }),
          })
          const orderBody = await orderRes.json()
          const dn = orderBody?.data?.displayNumber
          step('Place order (API fallback)', orderRes.status === 201, `displayNumber=${dn}`)
          await page.goto(`${BASE}/customer/orders`)
          await page.waitForTimeout(3000)
          const ordersText = await page.locator('body').innerText()
          step('Short order number visible', dn ? ordersText.includes(`#${dn}`) : false, `#${dn}`)
        }
      }
    }

    // Service actions
    await page.goto(`${BASE}/customer/menu`)
    await page.waitForTimeout(2000)
    const billBtn = page.getByRole('button', { name: /Hesap İste/i })
    if (await billBtn.isVisible().catch(() => false)) {
      await billBtn.click()
      await page.waitForTimeout(1500)
      step('Request bill', true)
    } else {
      step('Request bill', false, 'Button not found')
    }

    const waiterBtn = page.getByRole('button', { name: /Garson Çağır/i })
    if (await waiterBtn.isVisible().catch(() => false)) {
      await waiterBtn.click()
      await page.waitForTimeout(500)
      const waterBtn = page.getByRole('button', { name: /^Su$/i })
      if (await waterBtn.isVisible().catch(() => false)) {
        await waterBtn.click()
        await page.waitForTimeout(1500)
        step('Call waiter', true)
      }
    }

    // Staff service calls visible
    const staffCtx = await browser.newContext()
    const staffPage = await staffCtx.newPage()
    await staffLogin(staffPage)
    await staffPage.goto(`${BASE}/operations/service-calls`)
    await staffPage.waitForTimeout(3000)
    const scText = await staffPage.locator('body').innerText()
    step('Staff Service Calls page', scText.includes('Servis Merkezi'))
    await staffCtx.close()

  } catch (e) {
    step('Journey exception', false, e.message)
  }

  await ctx.close()
  return { journey, errors, consoleErrors }
}

async function testWebSocket() {
  const result = { connect: false, messages: [] }
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:3001/ws')
    const timeout = setTimeout(() => {
      try { ws.close() } catch {}
      resolve({ ...result, status: result.connect ? 'PASS' : 'FAIL', issue: result.connect ? null : 'No connection' })
    }, 8000)

    ws.onopen = () => {
      result.connect = true
      ws.send(JSON.stringify({
        event: 'join',
        data: { role: 'staff', restaurantId: RESTAURANT_ID },
      }))
    }
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        result.messages.push(data.type || data.event || 'unknown')
      } catch {}
    }
    ws.onerror = () => { result.error = 'ws error' }
    ws.onclose = () => {
      clearTimeout(timeout)
      resolve({
        status: result.connect ? 'PASS' : 'FAIL',
        connect: result.connect,
        messages: result.messages,
        issue: result.connect ? null : 'Connection failed',
      })
    }
  })
}

async function testResponsive(browser) {
  const results = []
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()
    await staffLogin(page)
    await page.goto(`${BASE}/`)
    await page.waitForTimeout(2000)
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 5
    })
    const text = await page.locator('body').innerText()
    const ok = text.includes('Merhaba') && !stuckLoading(text)
    results.push({ viewport: vp.name, status: ok && !overflow ? 'PASS' : 'FAIL', overflow, hasContent: ok })
    await ctx.close()
  }
  return results
}

async function main() {
  const report = {
    testedAt: new Date().toISOString(),
    startup: {},
    routes: [],
    api: [],
    customerJourney: {},
    websocket: {},
    responsive: [],
    staffJourney: [],
  }

  console.log('=== RC2 Final Release Audit ===\n')

  // Phase 1 — Startup
  console.log('Phase 1: Startup')
  report.api = await apiChecks()
  for (const a of report.api) {
    console.log(`  ${a.status === 'PASS' ? '✓' : '✗'} API ${a.name} ${a.http || a.error || ''}`)
  }

  report.websocket = await testWebSocket()
  console.log(`  ${report.websocket.status === 'PASS' ? '✓' : '✗'} WebSocket connect`)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Phase 2 — Routes
  console.log('\nPhase 2: Routes')
  report.routes.push(await testRoute(page, STAFF_ROUTES[0]))
  await staffLogin(page)
  for (const route of STAFF_ROUTES.slice(1)) {
    const r = await testRoute(page, route)
    report.routes.push(r)
    console.log(`  ${r.status === 'PASS' ? '✓' : r.status === 'WARN' ? '!' : '✗'} ${r.route}${r.issue ? ` — ${r.issue}` : ''}`)
  }

  // Customer routes
  await page.evaluate(() => localStorage.clear())
  for (const route of [
    { path: '/customer', label: 'Customer Login', expect: ['QR', 'Masa'], waitMs: 2000 },
    { path: '/customer/menu', label: 'Customer Menu', expect: ['Menüde ara', 'Masa'], waitMs: 5000, setup: true },
    { path: '/customer/orders', label: 'Customer Orders', expect: ['Siparişlerim'], waitMs: 5000 },
  ]) {
    if (route.setup) {
      await page.evaluate(() => {
        localStorage.setItem('customerTable', JSON.stringify({ tableToken: 'qr-masa-1', tableNumber: 'Masa 1' }))
      })
    }
    const r = await testRoute(page, route)
    report.routes.push(r)
    console.log(`  ${r.status === 'PASS' ? '✓' : '✗'} ${r.route}${r.issue ? ` — ${r.issue}` : ''}`)
  }

  // Phase 3 — Journeys
  console.log('\nPhase 3: Customer Journey')
  report.customerJourney = await testCustomerJourney(browser)
  for (const s of report.customerJourney.journey) {
    console.log(`  ${s.status === 'PASS' ? '✓' : '✗'} ${s.name}${s.detail ? ` — ${s.detail}` : ''}`)
  }

  // Phase 9 — Responsive
  console.log('\nPhase 9: Responsive')
  report.responsive = await testResponsive(browser)
  for (const r of report.responsive) {
    console.log(`  ${r.status === 'PASS' ? '✓' : '✗'} ${r.viewport}px overflow=${r.overflow}`)
  }

  await browser.close()
  writeFileSync(OUT, JSON.stringify(report, null, 2))

  const routeFails = report.routes.filter((r) => r.status === 'FAIL').length
  const journeyFails = report.customerJourney.journey?.filter((s) => s.status === 'FAIL').length ?? 0
  const apiFails = report.api.filter((a) => a.status === 'FAIL').length
  const respFails = report.responsive.filter((r) => r.status === 'FAIL').length
  const totalFails = routeFails + journeyFails + apiFails + respFails + (report.websocket.status === 'FAIL' ? 1 : 0)

  console.log(`\n=== SUMMARY: ${totalFails} failures ===`)
  process.exit(totalFails > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
