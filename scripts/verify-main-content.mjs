/**
 * Verify MAIN content area only (not sidebar false positives)
 */
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'

const PAGES = [
  { path: '/', mainExpect: /Merhaba|Dashboard|Günlük|sipariş/i, label: 'Dashboard' },
  { path: '/orders', mainExpect: /\d+ sipariş|Tümü|Aktif|Sipariş bulunamadı/i, label: 'Orders', notExpect: /^Yükleniyor/ },
  { path: '/kitchen', mainExpect: /Mutfak Ekranı|aktif sipariş|Bekliyor|Hazırlanıyor/i, label: 'Kitchen', notExpect: /^Yükleniyor/ },
  { path: '/menu', mainExpect: /Menü|Ürün|Kategori|Ara/i, label: 'Menu' },
]

async function login(page) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('#email', { timeout: 15000 })
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const fails = []

  const consoleErrors = []
  const apiFails = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`))
  page.on('response', (r) => {
    if ((r.url().includes('/api/v1') || r.url().includes(':3001')) && r.status() >= 400) {
      apiFails.push(`${r.status()} ${r.url()}`)
    }
  })

  await login(page)

  for (const route of PAGES) {
    apiFails.length = 0
    await page.goto(`${BASE}${route.path}`)
    await page.waitForTimeout(8000)

    const mainEl = page.locator('main .content, main [class*="content"]').first()
    const mainText = await mainEl.innerText().catch(() => '')
    const stuck = /^Yükleniyor/i.test(mainText.trim()) || mainText.trim() === 'Yükleniyor…' || mainText.trim() === 'Yükleniyor...'
    const hasExpected = route.mainExpect.test(mainText)
    const pass = !stuck && hasExpected

    console.log(`\n=== ${route.label} (${route.path}) ===`)
    console.log(`MAIN content: ${pass ? 'PASS' : 'FAIL'}`)
    console.log(`Text preview: ${mainText.replace(/\s+/g, ' ').slice(0, 200)}`)
    if (apiFails.length) console.log(`API fails: ${apiFails.join(', ')}`)
    if (consoleErrors.length) console.log(`Console: ${consoleErrors.slice(-3).join(' | ')}`)

    if (!pass) {
      fails.push({
        page: route.label,
        mainText: mainText.slice(0, 300),
        stuck,
        hasExpected,
        apiFails: [...apiFails],
      })
    }
  }

  // Customer pages (no Layout main)
  await page.evaluate(() => {
    localStorage.setItem('customerTable', JSON.stringify({ tableToken: 'qr-masa-1', tableNumber: 'Masa 1' }))
  })

  for (const [path, label, expect] of [
    ['/customer/menu', 'Customer Menu', /Mercimek|Masa 1|Menüde ara/i],
    ['/customer/orders', 'Customer Orders', /Siparişlerim|Henüz sipariş|Aktif Siparişler/i],
  ]) {
    apiFails.length = 0
    await page.goto(`${BASE}${path}`)
    await page.waitForTimeout(8000)
    const text = await page.locator('body').innerText()
    const stuck = /Menü yükleniyor|^Yükleniyor/i.test(text) && !expect.test(text)
    const pass = !stuck && expect.test(text)
    console.log(`\n=== ${label} ===`)
    console.log(`${pass ? 'PASS' : 'FAIL'}: ${text.replace(/\s+/g, ' ').slice(0, 150)}`)
    if (!pass) fails.push({ page: label, mainText: text.slice(0, 300), stuck: true })
  }

  await browser.close()
  console.log(`\n${fails.length} FAILURES`)
  if (fails.length) console.log(JSON.stringify(fails, null, 2))
  process.exit(fails.length ? 1 : 0)
}

main().catch(console.error)
