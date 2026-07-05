import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'

async function testScenario(name, setup) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const failed = []
  page.on('response', (r) => {
    if (r.url().includes('/api/v1') && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`)
  })

  await setup(page)
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('#email')
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 })

  for (const path of ['/orders', '/kitchen']) {
    await page.goto(`${BASE}${path}`)
    await page.waitForTimeout(8000)
    const main = await page.locator('main, [class*="orders"], [class*="kitchen"]').first().innerText().catch(() => '')
    const body = await page.locator('body').innerText()
    const stuck = body.includes('Yükleniyor') && !body.includes('sipariş') && !body.includes('Mutfak Ekranı') && !body.includes('aktif')
    console.log(`[${name}] ${path}: stuck=${stuck} failed=${failed.length}`)
    if (stuck) console.log('  text:', main.slice(0, 150))
    if (failed.length) console.log('  api:', failed.slice(0, 5))
  }
  await browser.close()
}

async function main() {
  await testScenario('normal', async () => {})
  await testScenario('no-restaurant-id', async (page) => {
    await page.addInitScript(() => localStorage.removeItem('restaurantId'))
  })
  await testScenario('no-env-sim', async (page) => {
    await page.addInitScript(() => {
      localStorage.removeItem('restaurantId')
      localStorage.clear()
    })
  })
}

main().catch(console.error)
