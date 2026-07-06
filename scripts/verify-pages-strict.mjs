/**
 * Strict live verification — fresh browser, sidebar nav, hard reload
 */
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'
const results = []

function log(page, status, detail = '') {
  results.push({ page, status, detail })
  console.log(`${status === 'PASS' ? '✓' : '✗'} ${page}${detail ? ` — ${detail}` : ''}`)
}

function stuck(text) {
  const loaders = ['Yükleniyor…', 'Yükleniyor...', 'Menü yükleniyor', 'Oturum kontrol']
  if (!loaders.some((l) => text.includes(l))) return false
  return !/sipariş|Mutfak|Menü|Dashboard|Mercimek|Siparişlerim|Ürün|Merhaba/i.test(text)
}

async function login(page) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('#email', { timeout: 15000 })
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 })
}

async function checkPage(page, name, waitMs = 10000) {
  const errors = []
  const failed = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => {
    if ((r.url().includes('/api/v1') || r.url().includes(':3001')) && r.status() >= 400) {
      failed.push(`${r.status()} ${r.url()}`)
    }
  })

  await page.waitForTimeout(waitMs)
  const text = await page.locator('body').innerText()
  const isStuck = stuck(text)

  if (errors.length) log(name, 'FAIL', `React: ${errors[0]}`)
  else if (isStuck) log(name, 'FAIL', `Loading stuck. API fails: ${failed.join(', ') || 'none'}`)
  else if (failed.some((f) => f.startsWith('5') || f.startsWith('401'))) log(name, 'FAIL', failed[0])
  else log(name, 'PASS')

  page.removeAllListeners('pageerror')
  page.removeAllListeners('response')
}

async function main() {
  const browser = await chromium.launch({ headless: true })

  // 1. Completely fresh context
  console.log('\n=== Fresh browser (no storage) ===')
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await login(page)
    for (const [path, name] of [['/', 'Dashboard'], ['/orders', 'Orders'], ['/kitchen', 'Kitchen'], ['/menu', 'Menu']]) {
      await page.goto(`${BASE}${path}`)
      await checkPage(page, `Fresh: ${name}`)
    }
    await ctx.close()
  }

  // 2. Sidebar navigation
  console.log('\n=== Sidebar navigation ===')
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await login(page)
    await page.goto(`${BASE}/`)
    await page.waitForTimeout(2000)

    const nav = [
      ['Siparişler', 'Sidebar: Orders'],
      ['Mutfak', 'Sidebar: Kitchen'],
      ['Menü Ürünleri', 'Sidebar: Menu'],
    ]
    for (const [linkText, name] of nav) {
      await page.getByRole('link', { name: linkText }).first().click()
      await checkPage(page, name)
    }
    await ctx.close()
  }

  // 3. Hard reload on each page
  console.log('\n=== Hard reload ===')
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await login(page)
    for (const [path, name] of [['/orders', 'Reload: Orders'], ['/kitchen', 'Reload: Kitchen']]) {
      await page.goto(`${BASE}${path}`)
      await page.reload({ waitUntil: 'networkidle' }).catch(() => page.reload())
      await checkPage(page, name)
    }
    await ctx.close()
  }

  // 4. Customer flow from QR
  console.log('\n=== Customer QR flow ===')
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto(`${BASE}/customer?token=qr-masa-1`)
    await checkPage(page, 'QR → Customer Menu', 5000)
    await page.goto(`${BASE}/customer/orders`)
    await checkPage(page, 'Customer Orders', 5000)
    await ctx.close()
  }

  // 5. Customer without tableId in storage
  console.log('\n=== Customer token-only ===')
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.addInitScript(() => {
      localStorage.setItem('customerTable', JSON.stringify({ tableToken: 'qr-masa-1', tableNumber: 'Masa 1' }))
    })
    await page.goto(`${BASE}/customer/orders`)
    await checkPage(page, 'Customer Orders (no tableId)', 8000)
    await ctx.close()
  }

  await browser.close()
  const fails = results.filter((r) => r.status === 'FAIL').length
  console.log(`\n${results.length} checks, ${fails} FAIL`)
  process.exit(fails > 0 ? 1 : 0)
}

main().catch(console.error)
