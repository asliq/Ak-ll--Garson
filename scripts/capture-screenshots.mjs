/**
 * Ekran görüntüsü alma scripti
 * Kullanım: node scripts/capture-screenshots.mjs
 *
 * Önkoşul: API (3001) + frontend (5173) çalışıyor, `npm run seed:demo` uygulandı.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'docs', 'screenshots')
const BASE = 'http://localhost:5173'

async function waitForApp(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

async function loginAsAdmin(page) {
  await page.goto(`${BASE}/login`)
  await waitForApp(page)
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/')
  await waitForApp(page)
}

async function screenshot(page, name, path, fullPage = false) {
  await page.goto(`${BASE}${path}`)
  await waitForApp(page)
  await page.screenshot({
    path: join(OUT_DIR, `${name}.png`),
    fullPage,
  })
  console.log(`  ✓ ${name}.png`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  console.log('Ekran görüntüleri alınıyor...\n')

  await page.goto(`${BASE}/login`)
  await waitForApp(page)
  await page.screenshot({ path: join(OUT_DIR, 'login.png') })
  console.log('  ✓ login.png')

  await loginAsAdmin(page)

  const staffPages = [
    ['dashboard', '/'],
    ['orders', '/orders'],
    ['kitchen', '/kitchen'],
    ['menu', '/menu'],
    ['system-health', '/system/health'],
  ]

  for (const [name, path] of staffPages) {
    await screenshot(page, name, path)
  }

  await context.clearCookies()
  await page.evaluate(() => localStorage.clear())

  await page.goto(`${BASE}/customer?token=qr-masa-1`)
  await waitForApp(page)
  await page.screenshot({ path: join(OUT_DIR, 'customer-login.png') })
  console.log('  ✓ customer-login.png')

  await page.evaluate(() => {
    localStorage.setItem('customerTable', JSON.stringify({
      tableToken: 'qr-masa-1',
      tableNumber: '1',
      section: 'Salon',
      capacity: 4,
      sessionStart: new Date().toISOString(),
    }))
  })
  await screenshot(page, 'customer-menu', '/customer/menu')

  await screenshot(page, 'customer-orders', '/customer/orders')

  await browser.close()
  console.log('\nTamamlandı → docs/screenshots/')
}

main().catch((err) => {
  console.error('Hata:', err.message)
  process.exit(1)
})
