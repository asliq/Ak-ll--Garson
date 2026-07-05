/**
 * RC1 edge-case runtime debug — reload, navigation, cold start
 */
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:5173'
const OUT = join(__dirname, '..', 'docs', 'rc1-runtime-edge-results.json')

const results = []

function record(name, status, detail = '', extra = {}) {
  results.push({ name, status, detail, ...extra })
  const icon = status === 'PASS' ? '✓' : status === 'WARN' ? '!' : '✗'
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function staffLogin(page) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('#email', { timeout: 15000 })
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 })
}

async function checkStuckLoading(page, label) {
  await page.waitForTimeout(4000)
  const text = await page.locator('body').innerText()
  const stuck =
    (text.includes('Yükleniyor…') || text.includes('Yükleniyor...') || text.includes('Menü yükleniyor') || text.includes('Oturum kontrol')) &&
    !text.includes('Yol Haritası')
  if (stuck) {
    record(label, 'FAIL', 'Stuck on loading after reload')
    return false
  }
  record(label, 'PASS')
  return true
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  // 1. Cold start — protected route redirects to login
  await page.goto(`${BASE}/orders`)
  await page.waitForTimeout(2000)
  const coldUrl = page.url()
  record('Cold start /orders → login', coldUrl.includes('/login') ? 'PASS' : 'FAIL', coldUrl)

  // 2. Staff login + hard reload each core page
  await staffLogin(page)
  for (const path of ['/', '/orders', '/kitchen', '/menu', '/system/health', '/system/settings']) {
    await page.goto(`${BASE}${path}`)
    await checkStuckLoading(page, `Hard reload ${path}`)
  }

  // 3. Sidebar navigation
  await page.goto(`${BASE}/`)
  await page.waitForTimeout(1500)
  const navLinks = [
    { text: 'Siparişler', path: '/orders' },
    { text: 'Mutfak', path: '/kitchen' },
    { text: 'Menü Ürünleri', path: '/menu' },
  ]
  for (const { text, path } of navLinks) {
    try {
      await page.getByRole('link', { name: text, exact: false }).first().click()
      await page.waitForTimeout(2500)
      const url = new URL(page.url())
      record(`Sidebar nav → ${text}`, url.pathname === path ? 'PASS' : 'WARN', url.pathname)
    } catch (e) {
      record(`Sidebar nav → ${text}`, 'FAIL', e.message)
    }
  }

  // 4. Customer without localStorage — QR token only
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${BASE}/customer?token=qr-masa-1`)
  await page.waitForTimeout(4000)
  const custText = await page.locator('body').innerText()
  record(
    'Customer QR cold start',
    custText.includes('Mercimek') && !custText.includes('Menü yükleniyor') ? 'PASS' : 'FAIL',
    custText.includes('Menü yükleniyor') ? 'stuck loading' : '',
  )

  // 5. Customer orders without tableId in storage (only token)
  await page.evaluate(() => {
    localStorage.setItem('customerTable', JSON.stringify({ tableToken: 'qr-masa-1', tableNumber: 'Masa 1' }))
  })
  await page.goto(`${BASE}/customer/orders`)
  await page.waitForTimeout(5000)
  const ordersText = await page.locator('body').innerText()
  const ordersOk =
    ordersText.includes('Siparişlerim') &&
    (ordersText.includes('Henüz sipariş yok') || ordersText.includes('Aktif Siparişler') || ordersText.includes('Sipariş #'))
  const ordersStuck = ordersText.includes('Yükleniyor') && !ordersText.includes('Siparişlerim')
  record('Customer orders (no tableId)', ordersStuck ? 'FAIL' : ordersOk ? 'PASS' : 'WARN', ordersText.slice(0, 80))

  // 6. Rapid route switching (infinite render check)
  errors.length = 0
  for (let i = 0; i < 5; i++) {
    await page.goto(`${BASE}/orders`)
    await page.goto(`${BASE}/kitchen`)
    await page.goto(`${BASE}/menu`)
  }
  await page.waitForTimeout(2000)
  record('Rapid route switching', errors.length === 0 ? 'PASS' : 'FAIL', errors[0] || '')

  // 7. API down simulation — customer menu should show error, not infinite load
  await page.route('**/api/v1/public/menu/**', (route) => route.abort('failed'))
  await page.goto(`${BASE}/customer/menu`)
  await page.waitForTimeout(3000)
  const apiDownText = await page.locator('body').innerText()
  const apiDownOk = apiDownText.includes('yüklenemedi') || apiDownText.includes('hata') || apiDownText.includes('Tekrar')
  const apiDownStuck = apiDownText.includes('Menü yükleniyor')
  record('Customer menu API down', apiDownStuck ? 'FAIL' : apiDownOk ? 'PASS' : 'WARN', apiDownText.slice(0, 60))

  await browser.close()
  writeFileSync(OUT, JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2))
  const fails = results.filter((r) => r.status === 'FAIL').length
  process.exit(fails > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
