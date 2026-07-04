/**
 * RC1 Runtime Audit — Playwright smoke test
 * Usage: node scripts/rc1-runtime-audit.mjs
 */
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.RC1_BASE_URL || 'http://localhost:5173'
const API = process.env.RC1_API_URL || 'http://localhost:3001/api/v1'
const RESTAURANT_ID = process.env.VITE_RESTAURANT_ID || '660e8400-e29b-41d4-a716-446655440001'

const results = []

function log(route, status, detail = '') {
  results.push({ route, status, detail })
  const icon = status === 'PASS' ? '✓' : status === 'WARN' ? '!' : '✗'
  console.log(`${icon} ${route}${detail ? ` — ${detail}` : ''}`)
}

async function collectPageErrors(page) {
  const errors = []
  const warnings = []
  const failedRequests = []

  page.on('pageerror', (err) => errors.push(err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') warnings.push(msg.text())
    if (msg.type() === 'warning') warnings.push(`[warn] ${msg.text()}`)
  })
  page.on('response', (res) => {
    const url = res.url()
    if (url.includes('/api/') && res.status() >= 400) {
      failedRequests.push(`${res.status()} ${url}`)
    }
  })

  return { errors, warnings, failedRequests }
}

async function staffLogin(page) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('#email', { timeout: 10000 })
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
}

async function auditRoute(page, path, label, options = {}) {
  const { errors, warnings, failedRequests } = await collectPageErrors(page)
  const collector = { errors, warnings, failedRequests }

  try {
    if (options.beforeNavigate) await options.beforeNavigate(page)
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(options.waitMs ?? 2500)

    const bodyText = await page.locator('body').innerText()
    const infiniteLoader =
      (bodyText.includes('Yükleniyor') || bodyText.includes('Oturum kontrol')) &&
      !bodyText.includes('Dashboard') &&
      !bodyText.includes('Sipariş') &&
      !bodyText.includes('Mutfak') &&
      !bodyText.includes('Menü') &&
      path !== '/login'

    if (collector.errors.length > 0) {
      log(label, 'FAIL', `React error: ${collector.errors[0]}`)
      return
    }
    if (infiniteLoader && !options.allowLoader) {
      log(label, 'FAIL', 'Possible infinite loading state')
      return
    }
    if (collector.failedRequests.some((r) => r.startsWith('5'))) {
      log(label, 'FAIL', collector.failedRequests.find((r) => r.startsWith('5')))
      return
    }
    if (collector.failedRequests.length > 0) {
      log(label, 'WARN', collector.failedRequests[0])
      return
    }
    if (collector.warnings.length > 0) {
      log(label, 'WARN', `Console: ${collector.warnings[0].slice(0, 80)}`)
      return
    }
    log(label, 'PASS')
  } catch (err) {
    log(label, 'FAIL', err.message)
  }
}

async function main() {
  console.log(`RC1 Audit — ${BASE}\n`)

  // API smoke
  for (const [name, url, headers] of [
    ['API health/live', `${API}/health/live`, {}],
    ['API orders', `${API}/orders`, { 'X-Restaurant-Id': RESTAURANT_ID }],
    ['API public menu', `${API}/public/menu/qr-masa-1`, {}],
  ]) {
    try {
      const res = await fetch(url, { headers })
      log(name, res.ok ? 'PASS' : 'FAIL', `HTTP ${res.status}`)
    } catch (e) {
      log(name, 'FAIL', e.message)
    }
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await auditRoute(page, '/login', 'Login')
  await staffLogin(page)

  const staffRoutes = [
    ['/', 'Dashboard'],
    ['/orders', 'Orders'],
    ['/kitchen', 'Kitchen'],
    ['/menu', 'Menu'],
    ['/system/health', 'System Health'],
    ['/system/settings', 'Settings'],
    ['/restaurant/tables', 'Roadmap Tables'],
  ]

  for (const [path, label] of staffRoutes) {
    await auditRoute(page, path, label)
  }

  // Customer QR flow
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${BASE}/customer?token=qr-masa-1`)
  await page.waitForTimeout(3000)
  const customerPath = page.url()
  if (customerPath.includes('/customer/menu')) {
    log('Customer QR Menu', 'PASS')
  } else {
    log('Customer QR Menu', 'FAIL', `Landed on ${customerPath}`)
  }

  await auditRoute(page, '/customer/orders', 'Customer Orders', {
    beforeNavigate: async (p) => {
      await p.evaluate(() => {
        localStorage.setItem(
          'customerTable',
          JSON.stringify({ tableToken: 'qr-masa-1', tableNumber: 'Masa 1' }),
        )
      })
    },
  })

  await browser.close()

  const outPath = join(__dirname, '..', 'docs', 'rc1-audit-results.json')
  writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(`\nResults written to docs/rc1-audit-results.json`)

  const fails = results.filter((r) => r.status === 'FAIL').length
  process.exit(fails > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
