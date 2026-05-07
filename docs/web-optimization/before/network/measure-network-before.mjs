import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const baseUrl = process.env.MEASURE_BASE_URL ?? 'http://localhost:3001'
const outputDir = process.env.MEASURE_OUTPUT_DIR ?? 'docs/web-optimization/before/network'
const apiHost = process.env.MEASURE_API_HOST ?? 'api.dgpthinh.io.vn'
const checkoutArtworkId = process.env.MEASURE_CHECKOUT_ARTWORK_ID ?? 'before-missing-artwork'
const chromeBin =
  process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const debugPort = Number(process.env.CHROME_DEBUG_PORT ?? 9223)

const scenarios = [
  { name: 'discover-first-load', url: `${baseUrl}/discover`, waitMs: 5000 },
  {
    name: 'discover-artworks-scroll',
    url: `${baseUrl}/discover?tab=artworks`,
    waitMs: 2500,
    afterLoad: async (cdp) => {
      await cdp.send('Runtime.evaluate', {
        expression: 'window.scrollTo(0, Math.max(document.body.scrollHeight, 1600))',
      })
      await delay(2500)
    },
  },
  { name: 'discover-events-tab', url: `${baseUrl}/discover?tab=events`, waitMs: 5000 },
  {
    name: 'checkout-first-load',
    url: `${baseUrl}/checkout/${checkoutArtworkId}`,
    waitMs: 6000,
  },
]

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.nextId = 1
    this.pending = new Map()
    this.handlers = new Map()
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl)
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true })
      this.ws.addEventListener('error', reject, { once: true })
    })

    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) reject(new Error(message.error.message))
        else resolve(message.result)
        return
      }

      const handlers = this.handlers.get(message.method) ?? []
      for (const handler of handlers) handler(message.params)
    })
  }

  on(method, handler) {
    const handlers = this.handlers.get(method) ?? []
    handlers.push(handler)
    this.handlers.set(method, handlers)
  }

  send(method, params = {}) {
    const id = this.nextId++
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
    })
  }

  close() {
    this.ws?.close()
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function createPageTarget() {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, {
    method: 'PUT',
  })
  if (!response.ok) throw new Error(`Failed to create Chrome target: ${response.status}`)
  return response.json()
}

async function waitForChrome() {
  const deadline = Date.now() + 10000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`)
      if (response.ok) return
    } catch {
      // Chrome is still starting.
    }
    await delay(200)
  }
  throw new Error('Chrome remote debugging port did not become ready')
}

function launchChrome() {
  const userDataDir = path.join(os.tmpdir(), `artium-network-before-${Date.now()}`)
  const args = [
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1366,768',
    'about:blank',
  ]

  return {
    userDataDir,
    process: spawn(chromeBin, args, { stdio: ['ignore', 'ignore', 'pipe'] }),
  }
}

const classifyRequest = (url, resourceType) => {
  if (url.includes(apiHost) || url.includes('/api/')) return 'api'
  if (resourceType === 'Script') return 'js'
  if (resourceType === 'Stylesheet') return 'css'
  if (resourceType === 'Image') return 'image'
  if (resourceType === 'Font') return 'font'
  if (resourceType === 'Document') return 'document'
  return String(resourceType || 'other').toLowerCase()
}

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`

function summarize(entries) {
  const byType = new Map()
  const byUrl = new Map()
  const apiRequests = []

  for (const entry of entries) {
    const type = classifyRequest(entry.url, entry.resourceType)
    const current = byType.get(type) ?? { count: 0, encodedBytes: 0, failed: 0 }
    current.count += 1
    current.encodedBytes += entry.encodedDataLength ?? 0
    if (entry.failed || (entry.status && entry.status >= 400)) current.failed += 1
    byType.set(type, current)

    byUrl.set(entry.url, (byUrl.get(entry.url) ?? 0) + 1)
    if (type === 'api') apiRequests.push(entry)
  }

  return {
    totalRequests: entries.length,
    totalEncodedBytes: entries.reduce((sum, entry) => sum + (entry.encodedDataLength ?? 0), 0),
    byType: Object.fromEntries(byType),
    apiRequests,
    duplicateUrls: [...byUrl.entries()]
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([url, count]) => ({ url, count })),
  }
}

async function runScenario(scenario) {
  const target = await createPageTarget()
  const cdp = new CdpClient(target.webSocketDebuggerUrl)
  await cdp.connect()

  const entriesByRequestId = new Map()
  cdp.on('Network.requestWillBeSent', (event) => {
    entriesByRequestId.set(event.requestId, {
      requestId: event.requestId,
      url: event.request.url,
      method: event.request.method,
      resourceType: event.type,
      timestamp: event.timestamp,
    })
  })
  cdp.on('Network.responseReceived', (event) => {
    const entry = entriesByRequestId.get(event.requestId)
    if (!entry) return
    entry.status = event.response.status
    entry.mimeType = event.response.mimeType
  })
  cdp.on('Network.loadingFinished', (event) => {
    const entry = entriesByRequestId.get(event.requestId)
    if (!entry) return
    entry.encodedDataLength = event.encodedDataLength
    entry.finishedTimestamp = event.timestamp
  })
  cdp.on('Network.loadingFailed', (event) => {
    const entry = entriesByRequestId.get(event.requestId)
    if (!entry) return
    entry.failed = true
    entry.failureText = event.errorText
    entry.finishedTimestamp = event.timestamp
  })

  await cdp.send('Network.enable')
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp.send('Page.navigate', { url: scenario.url })
  await delay(scenario.waitMs)
  if (scenario.afterLoad) await scenario.afterLoad(cdp)

  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' })
  await fs.writeFile(path.join(outputDir, `${scenario.name}.png`), screenshot.data, 'base64')

  const entries = [...entriesByRequestId.values()].sort((a, b) => a.timestamp - b.timestamp)
  const summary = summarize(entries)
  await fs.writeFile(
    path.join(outputDir, `${scenario.name}.network.json`),
    JSON.stringify({ scenario, capturedAt: new Date().toISOString(), entries, summary }, null, 2),
  )

  cdp.close()
  return { name: scenario.name, url: scenario.url, screenshot: `${scenario.name}.png`, ...summary }
}

await fs.mkdir(outputDir, { recursive: true })

const launched = launchChrome()
let chromeStderr = ''
launched.process.stderr.on('data', (chunk) => {
  chromeStderr += chunk.toString()
})

try {
  await waitForChrome()
  const results = []
  for (const scenario of scenarios) {
    results.push(await runScenario(scenario))
  }

  const lines = []
  lines.push('# Network/API Before Summary')
  lines.push('')
  lines.push(`Generated at: ${new Date().toISOString()}`)
  lines.push(`Base URL: ${baseUrl}`)
  lines.push(`API host: ${apiHost}`)
  lines.push(`Checkout artwork ID: ${checkoutArtworkId}`)
  lines.push('')
  lines.push('| Scenario | Requests | Encoded transfer | API requests | Failed/API >=400 | Screenshot |')
  lines.push('| --- | ---: | ---: | ---: | ---: | --- |')
  for (const result of results) {
    const apiCount = result.byType.api?.count ?? 0
    const apiFailed = result.byType.api?.failed ?? 0
    lines.push(
      `| ${result.name} | ${result.totalRequests} | ${formatBytes(result.totalEncodedBytes)} | ${apiCount} | ${apiFailed} | ${result.screenshot} |`,
    )
  }
  lines.push('')
  lines.push('## API Requests')
  for (const result of results) {
    lines.push('')
    lines.push(`### ${result.name}`)
    if (result.apiRequests.length === 0) {
      lines.push('No API requests captured.')
      continue
    }
    lines.push('| Method | Status | Transfer | URL |')
    lines.push('| --- | ---: | ---: | --- |')
    for (const request of result.apiRequests) {
      lines.push(
        `| ${request.method} | ${request.status ?? 'failed'} | ${formatBytes(request.encodedDataLength ?? 0)} | ${request.url} |`,
      )
    }
  }

  await fs.writeFile(path.join(outputDir, 'network-summary-before.md'), `${lines.join('\n')}\n`)
} finally {
  launched.process.kill('SIGTERM')
  await fs.rm(launched.userDataDir, { recursive: true, force: true }).catch(() => undefined)
  if (chromeStderr) {
    await fs.writeFile(path.join(outputDir, 'chrome-stderr-before.txt'), chromeStderr)
  }
}
