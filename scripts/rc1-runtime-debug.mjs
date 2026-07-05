/**
 * RC1 full runtime debug — every reachable page
 */
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:5173'
const OUT = join(__dirname, '..', 'docs', 'rc1-runtime-debug-results.json')

const STAFF_ROUTES = [
  { path: '/', label: 'Dashboard', expect: ['Dashboard', 'Merhaba'] },
  { path: '/orders', label: 'Orders', expect: ['Sipariş'] },
  { path: '/kitchen', label: 'Kitchen', expect: ['Mutfak', 'aktif sipariş'] },
  { path: '/menu', label: 'Menu', expect: ['Menü', 'Ürün'] },
  { path: '/system/settings', label: 'Settings', expect: ['Ayarlar'] },
  { path: '/system/health', label: 'System Health', expect: ['Sistem Sağlığı', 'Sağlıklı'] },
  { path: '/orders/qr', label: 'Roadmap QR Orders', expect: ['QR', 'Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/menu/categories', label: 'Roadmap Categories', expect: ['Kategori', 'Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/restaurant/tables', label: 'Roadmap Tables', expect: ['Masa', 'Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/restaurant/staff', label: 'Roadmap Staff', expect: ['Personel', 'Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/restaurant/reservations', label: 'Roadmap Reservations', expect: ['Rezervasyon', 'Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/operations/inventory', label: 'Roadmap Inventory', expect: ['Stok', 'Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/operations/payments', label: 'Roadmap Payments', expect: ['Ödeme', 'Yol Haritası', 'PLAN'], roadmap: true },
  { path: '/operations/reports', label: 'Roadmap Reports', expect: ['Rapor', 'Yol Haritası', 'PLAN'], roadmap: true },
]

function analyze(bodyText, route) {
  const stuckLoading =
    (bodyText.includes('Yükleniyor…') ||
      bodyText.includes('Yükleniyor...') ||
      bodyText.includes('Menü yükleniyor') ||
      bodyText.includes('Oturum kontrol')) &&
    !route.roadmap

  const blank = bodyText.trim().length < 30
  const hasExpected = route.expect.some((t) => bodyText.includes(t))

  return { stuckLoading, blank, hasExpected }
}

async function staffLogin(page) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('#email', { timeout: 15000 })
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 })
  await page.waitForTimeout(1500)
}

async function testPage(page, route, setup) {
  const errors = []
  const consoleErrors = []
  const failedRequests = []

  const onPageError = (err) => errors.push(err.message)
  const onConsole = (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  }
  const onResponse = (res) => {
    const url = res.url()
    if ((url.includes('localhost:3001') || url.includes('/api/v1')) && res.status() >= 400) {
      failedRequests.push({ status: res.status(), url })
    }
  }

  page.on('pageerror', onPageError)
  page.on('console', onConsole)
  page.on('response', onResponse)

  try {
    if (setup) await setup(page)
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() =>
      page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 }),
    )
    await page.waitForTimeout(3000)

    const bodyText = await page.locator('body').innerText()
    const { stuckLoading, blank, hasExpected } = analyze(bodyText, route)

    let status = 'PASS'
    let issue = null

    if (errors.length) {
      status = 'FAIL'
      issue = `React error: ${errors[0]}`
    } else if (stuckLoading) {
      status = 'FAIL'
      issue = 'Stuck on loading state'
    } else if (blank) {
      status = 'FAIL'
      issue = 'Blank or near-empty page'
    } else if (!hasExpected && !route.roadmap) {
      status = 'FAIL'
      issue = `Missing expected content: ${route.expect.join(', ')}`
    } else if (failedRequests.length) {
      const critical = failedRequests.filter((r) => r.status >= 500 || r.status === 404)
      if (critical.length && !route.roadmap) {
        status = 'FAIL'
        issue = `HTTP ${critical[0].status} ${critical[0].url}`
      } else if (failedRequests.length) {
        status = 'WARN'
        issue = `HTTP ${failedRequests[0].status} ${failedRequests[0].url}`
      }
    } else if (consoleErrors.length) {
      status = 'WARN'
      issue = consoleErrors[0].slice(0, 120)
    }

    page.off('pageerror', onPageError)
    page.off('console', onConsole)
    page.off('response', onResponse)

    return {
      route: route.label,
      path: route.path,
      status,
      issue,
      roadmap: !!route.roadmap,
      bodyPreview: bodyText.slice(0, 200).replace(/\s+/g, ' '),
      errors,
      consoleErrors,
      failedRequests,
    }
  } catch (err) {
    page.off('pageerror', onPageError)
    page.off('console', onConsole)
    page.off('response', onResponse)
    return {
      route: route.label,
      path: route.path,
      status: 'FAIL',
      issue: err.message,
      roadmap: !!route.roadmap,
      errors,
      consoleErrors,
      failedRequests,
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const results = []

  // Login
  results.push(await testPage(page, { path: '/login', label: 'Login', expect: ['Giriş', 'Akıllı Garson'] }))
  await staffLogin(page)

  for (const route of STAFF_ROUTES) {
    results.push(await testPage(page, route))
  }

  // Customer flow — fresh context
  await page.evaluate(() => localStorage.clear())
  results.push(
    await testPage(page, {
      path: '/customer?token=qr-masa-1',
      label: 'Customer QR Redirect',
      expect: ['Masa', 'Mercimek', 'Köfte', 'Menüde ara'],
    }),
  )

  // Customer menu direct
  await page.evaluate(() => {
    localStorage.setItem(
      'customerTable',
      JSON.stringify({ tableToken: 'qr-masa-1', tableNumber: 'Masa 1' }),
    )
  })
  results.push(
    await testPage(page, {
      path: '/customer/menu',
      label: 'Customer Menu',
      expect: ['Masa', 'Mercimek', 'Köfte', 'Menüde ara'],
    }),
  )

  // Customer orders — need tableId from menu API
  await page.goto(`${BASE}/customer/menu`)
  await page.waitForTimeout(4000)
  const tableData = await page.evaluate(() => localStorage.getItem('customerTable'))
  results.push(
    await testPage(page, {
      path: '/customer/orders',
      label: 'Customer Orders',
      expect: ['Siparişlerim', 'Henüz sipariş yok', 'Aktif Siparişler', 'Tüm Siparişler'],
    }),
  )

  await browser.close()
  writeFileSync(OUT, JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2))

  console.log('\n=== RC1 Runtime Debug ===\n')
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✓' : r.status === 'WARN' ? '!' : '✗'
    console.log(`${icon} ${r.route} (${r.path})`)
    if (r.issue) console.log(`    ${r.issue}`)
  }

  const fails = results.filter((r) => r.status === 'FAIL').length
  console.log(`\n${results.length} pages, ${fails} FAIL`)
  process.exit(fails > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
