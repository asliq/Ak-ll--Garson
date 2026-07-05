/**
 * README screenshot capture — commercial presentation set
 * Usage: npm run screenshots:readme
 *
 * Prerequisites: API on :3001. Builds frontend and starts Vite preview on :4173.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import net from 'node:net'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'docs', 'assets', 'screenshots')
const API_DOCS = 'http://localhost:3001/docs'
const PREVIEW_PORT = 5173
const FALLBACK_PORT = 4173
const VIEWPORT = { width: 1440, height: 900 }

const HIDE_DEV_UI = `
  .tsqd-parent-container,
  .tsqd-open-btn-container,
  [class*="tsqd-"],
  [class*="triggerHint"] {
    display: none !important;
    visibility: hidden !important;
  }
`

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: 'localhost' }, () => {
      socket.end()
      resolve(true)
    })
    socket.on('error', () => resolve(false))
  })
}

function waitForPort(port, timeoutMs = 45000) {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const poll = async () => {
      if (await portOpen(port)) {
        resolve()
        return
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Port ${port} did not open within ${timeoutMs}ms`))
        return
      }
      setTimeout(poll, 400)
    }
    poll()
  })
}

async function ensureFrontendUrl() {
  if (await portOpen(PREVIEW_PORT)) {
    return `http://localhost:${PREVIEW_PORT}`
  }

  if (await portOpen(FALLBACK_PORT)) {
    console.warn(
      `Warning: using port ${FALLBACK_PORT} — ensure API CORS_ORIGIN includes http://localhost:${FALLBACK_PORT}`,
    )
    return `http://localhost:${FALLBACK_PORT}`
  }

  console.log('Starting Vite preview on :5173 (matches API CORS)...')
  const child = spawn(
    'npm',
    ['run', 'preview', '--', '--port', String(PREVIEW_PORT), '--host'],
    { cwd: ROOT, shell: true, stdio: 'ignore', detached: true },
  )
  child.unref()
  await waitForPort(PREVIEW_PORT)
  return `http://localhost:${PREVIEW_PORT}`
}

async function waitForApp(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(800)
}

async function hideDevUi(page) {
  await page.addStyleTag({ content: HIDE_DEV_UI })
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const cn = typeof el.className === 'string' ? el.className : ''
      if (cn.includes('triggerHint')) {
        el.remove()
        continue
      }
      const style = window.getComputedStyle(el)
      const text = el.textContent || ''
      if (style.position === 'fixed' && text.includes('FPS') && text.includes('Cache')) {
        el.remove()
      }
    }
  })
}

async function setLightTheme(page) {
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    try {
      const raw = localStorage.getItem('akilli-garson-storage')
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 }
      parsed.state = { ...parsed.state, theme: 'light', language: 'tr' }
      localStorage.setItem('akilli-garson-storage', JSON.stringify(parsed))
    } catch {
      /* ignore */
    }
  })
}

async function capture(page, filename, waitFn) {
  if (waitFn) await waitFn(page)
  await page.waitForTimeout(1200)
  await hideDevUi(page)
  await page.waitForTimeout(300)
  const path = join(OUT_DIR, filename)
  await page.screenshot({ path, fullPage: false })
  console.log(`  ✓ ${filename}`)
}

async function loginStaff(page, frontend) {
  await page.goto(`${frontend}/login`)
  await waitForApp(page)
  await setLightTheme(page)
  await page.locator('#email').fill('ahmet@restoran.com')
  await page.locator('#pin').fill('1234')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
  await waitForApp(page)
  await page.waitForSelector('text=Yükleniyor', { state: 'hidden', timeout: 15000 }).catch(() => {})
}

async function main() {
  console.log('Seeding demo data...')
  const seed = spawnSync('npm', ['run', 'seed:demo'], {
    cwd: join(ROOT, 'api'),
    shell: true,
    stdio: 'inherit',
  })
  if (seed.status !== 0) {
    throw new Error('Demo seed failed — ensure API database is running')
  }

  const frontend = await ensureFrontendUrl()
  console.log(`Frontend: ${frontend}`)
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'tr-TR',
  })

  await context.addInitScript(() => {
    const hideChrome = () => {
      document.querySelectorAll('body *').forEach((el) => {
        const cn = typeof el.className === 'string' ? el.className : ''
        if (cn.includes('triggerHint')) {
          el.style.setProperty('display', 'none', 'important')
          return
        }
        const style = window.getComputedStyle(el)
        if (style.position !== 'fixed') return
        const text = el.textContent || ''
        if (text.includes('FPS') && text.includes('Cache')) {
          el.style.setProperty('display', 'none', 'important')
        }
      })
    }
    hideChrome()
    new MutationObserver(hideChrome).observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  })

  console.log('Capturing README screenshots (1440×900)...\n')

  // 01 — Login (unauthenticated)
  {
    const page = await context.newPage()
    await page.goto(`${frontend}/login`)
    await waitForApp(page)
    await setLightTheme(page)
    await page.waitForSelector('h1', { timeout: 10000 })
    await capture(page, '01-login.png', async (p) => {
      await p.waitForSelector('#email', { state: 'visible' })
      await p.waitForSelector('button[type="submit"]', { state: 'visible' })
    })
    await page.close()
  }

  // Staff session for 02–05, 08
  const staffPage = await context.newPage()
  await loginStaff(staffPage, frontend)

  await capture(staffPage, '02-dashboard.png', async (p) => {
    await p.goto(`${frontend}/`)
    await waitForApp(p)
    await p.waitForSelector('text=Aktif Sipariş', { timeout: 15000 })
    await p.waitForFunction(
      () => !document.body.textContent?.includes('Yükleniyor'),
      { timeout: 10000 },
    ).catch(() => {})
  })

  await capture(staffPage, '03-menu-management.png', async (p) => {
    await p.goto(`${frontend}/menu`)
    await waitForApp(p)
    await p.waitForFunction(
      () => {
        const text = document.body.innerText || ''
        return (
          (text.includes('Köfte') || text.includes('Kebap') || text.includes('Çorba') || text.includes('Menü')) &&
          !text.includes('Menü kategorileri tanımlanmamış') &&
          !text.includes('yüklenemiyor')
        )
      },
      { timeout: 25000 },
    )
  })

  await capture(staffPage, '04-orders.png', async (p) => {
    await p.goto(`${frontend}/orders`)
    await waitForApp(p)
    await p.waitForFunction(
      () => {
        const text = document.body.innerText || ''
        return text.includes('Sipariş') && !text.includes('Henüz sipariş yok')
      },
      { timeout: 20000 },
    )
  })

  await capture(staffPage, '05-kitchen.png', async (p) => {
    await p.goto(`${frontend}/kitchen`)
    await waitForApp(p)
    await p.waitForFunction(
      () => {
        const text = document.body.innerText || ''
        return text.includes('aktif sipariş') && !text.includes('Bekleyen sipariş yok')
      },
      { timeout: 20000 },
    )
  })

  await capture(staffPage, '08-system-health.png', async (p) => {
    await p.goto(`${frontend}/system/health`)
    await waitForApp(p)
    await p.waitForSelector('text=Sistem Sağlığı', { timeout: 10000 })
    await p.waitForFunction(
      () => !document.body.textContent?.includes('kontrol ediliyor'),
      { timeout: 20000 },
    )
    await p.waitForSelector('text=Sağlıklı', { timeout: 20000 }).catch(() => {})
  })

  await staffPage.close()

  // 06 — Customer menu
  {
    const page = await context.newPage()
    await page.goto(`${frontend}/customer?token=qr-masa-1`)
    await waitForApp(page)
    await setLightTheme(page)
    await page.evaluate(() => {
      localStorage.setItem(
        'customerTable',
        JSON.stringify({
          tableToken: 'qr-masa-1',
          tableNumber: '1',
          tableName: 'Masa 1',
          section: 'Salon',
          capacity: 4,
          sessionStart: new Date().toISOString(),
        }),
      )
    })
    await page.goto(`${frontend}/customer/menu`)
    await waitForApp(page)
    await capture(page, '06-customer-menu.png', async (p) => {
      await p.waitForFunction(
        () => {
          const text = document.body.innerText || ''
          return (
            !text.includes('Menü yükleniyor') &&
            (text.includes('Mercimek') || text.includes('Köfte') || text.includes('Lahmacun'))
          )
        },
        { timeout: 20000 },
      )
    })
    await page.close()
  }

  // 07 — Swagger (API docs only — no browser chrome)
  {
    const page = await context.newPage()
    await page.goto(API_DOCS)
    await waitForApp(page)
    await page.waitForSelector('.swagger-ui', { timeout: 20000 })
    for (const label of ['menu', 'orders', 'public', 'health']) {
      const tag = page.locator('.opblock-tag', { hasText: new RegExp(label, 'i') }).first()
      if (await tag.count()) {
        await tag.click().catch(() => {})
        await page.waitForTimeout(300)
      }
    }
    await capture(page, '07-swagger.png', async (p) => {
      await p.waitForSelector('.swagger-ui .info', { timeout: 10000 })
    })
    await page.close()
  }

  await browser.close()
  console.log(`\nDone → ${OUT_DIR}`)
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err.message)
  process.exit(1)
})
