import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []

page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`)
})

const failed = []
page.on('response', (res) => {
  if (res.status() >= 400) {
    failed.push(`${res.status()} ${res.url()}`)
  }
})

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1500)
console.log('=== LOGIN PAGE ===')
console.log('URL:', page.url())
console.log('Errors:', errors)
console.log('Failed requests:', failed.slice(0, 20))

errors.length = 0
failed.length = 0

await page.getByRole('button', { name: /Ahmet/i }).click().catch(() => {})
await page.getByRole('button', { name: /Giriş/i }).click().catch(() => {})
await page.waitForTimeout(5000)

console.log('=== AFTER LOGIN ===')
console.log('URL:', page.url())
console.log('Body text sample:', (await page.textContent('body'))?.slice(0, 200))
console.log('Errors:', errors)
console.log('Failed requests:', failed.slice(0, 30))

await browser.close()
