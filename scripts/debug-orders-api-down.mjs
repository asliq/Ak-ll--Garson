import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.route('**/api/v1/orders**', (route) => route.abort('failed'))

  await page.goto(`${BASE}/login`)
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 })

  const start = Date.now()
  await page.goto(`${BASE}/orders`)

  let showedError = false
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000)
    const text = await page.locator('body').innerText()
    if (text.includes('yüklenemedi')) {
      showedError = true
      break
    }
  }

  console.log(`Error shown in ${Date.now() - start}ms: ${showedError}`)
  await browser.close()
  process.exit(showedError && (Date.now() - start) < 20000 ? 0 : 1)
}

main().catch(console.error)
