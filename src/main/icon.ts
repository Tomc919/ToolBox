import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { ensureDataDir } from './utils'
import type { Tool } from '@shared/types'

function getIconCacheDir(): string {
  const dataDir = ensureDataDir()
  const dir = path.join(dataDir, 'icons')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function getBuiltinIconsDir(): string {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '..', '..', 'resources', 'icons')
  }
  return path.join(process.resourcesPath!, 'icons')
}

function fileToDataUrl(filePath: string): string | null {
  try {
    const buf = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const mime = ext === '.ico' ? 'image/x-icon' : ext === '.jpg' ? 'image/jpeg' : 'image/png'
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

export function getDefaultIcon(launchType: string): string {
  const builtinDir = getBuiltinIconsDir()
  const iconPath = path.join(builtinDir, `${launchType}.png`)
  if (fs.existsSync(iconPath)) {
    return fileToDataUrl(iconPath) || ''
  }
  const defaultPath = path.join(builtinDir, 'default.png')
  return fileToDataUrl(defaultPath) || ''
}

function findLocalIcon(targetPath: string): string | null {
  const dir = path.dirname(targetPath)
  const candidates = ['icon.png', 'icon.ico', 'logo.png', 'logo.ico', 'favicon.ico']
  for (const name of candidates) {
    const p = path.join(dir, name)
    if (fs.existsSync(p)) return fileToDataUrl(p)
  }
  return null
}

async function extractExeIcon(filePath: string): Promise<string | null> {
  try {
    const icon = await app.getFileIcon(filePath, { size: 'large' })
    if (icon.isEmpty()) return null
    return icon.toDataURL()
  } catch {
    return null
  }
}

function getCachePath(toolId: number): string {
  return path.join(getIconCacheDir(), `${toolId}.png`)
}

export async function getOrExtractIcon(tool: Tool): Promise<string> {
  // 1. Custom icon
  if (tool.icon_path && fs.existsSync(tool.icon_path)) {
    const dataUrl = fileToDataUrl(tool.icon_path)
    if (dataUrl) return dataUrl
  }

  // 2. Check cache
  const cachePath = getCachePath(tool.id)
  if (fs.existsSync(cachePath)) {
    const dataUrl = fileToDataUrl(cachePath)
    if (dataUrl) return dataUrl
  }

  // 3. EXE icon extraction
  if (tool.launch_type === 'exe' && fs.existsSync(tool.target)) {
    const dataUrl = await extractExeIcon(tool.target)
    if (dataUrl) {
      const base64 = dataUrl.split(',')[1]
      if (base64) {
        fs.writeFileSync(cachePath, Buffer.from(base64, 'base64'))
        return dataUrl
      }
    }
  }

  // 4. Local icon/logo file in same directory
  const localIcon = findLocalIcon(tool.target)
  if (localIcon) return localIcon

  // 5-6. Built-in type icon or default
  return getDefaultIcon(tool.launch_type)
}
