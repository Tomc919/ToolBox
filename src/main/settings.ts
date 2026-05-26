import fs from 'node:fs'
import path from 'node:path'
import { ensureDataDir } from './utils'

export interface AppSettings {
  autoStart: boolean
  shortcut: string
}

const DEFAULTS: AppSettings = {
  autoStart: false,
  shortcut: 'Alt+Space'
}

let cache: AppSettings | null = null

function filePath(): string {
  return path.join(ensureDataDir(), 'settings.json')
}

export function loadSettings(): AppSettings {
  if (cache) return cache
  try {
    const raw = fs.readFileSync(filePath(), 'utf-8')
    cache = { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    cache = { ...DEFAULTS }
  }
  return cache!
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = loadSettings()
  const next = { ...current, ...partial }
  fs.writeFileSync(filePath(), JSON.stringify(next, null, 2), 'utf-8')
  cache = next
  return next
}
