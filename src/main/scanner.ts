import fs from 'node:fs'
import path from 'node:path'
import type { ScanCandidate } from '@shared/types'

const EXTENSION_MAP: Record<string, string> = {
  '.exe': 'exe',
  '.jar': 'jar',
  '.py': 'python',
  '.pyw': 'python',
  '.ps1': 'powershell',
  '.bat': 'command',
  '.cmd': 'command',
  '.com': 'exe',
  '.msi': 'exe',
  '.vbs': 'command',
  '.reg': 'command',
  '.msc': 'command',
  '.sh': 'command',
  '.ahk': 'command',
  '.wsf': 'command',
  '.hta': 'command'
}

// Directories to skip during recursive scan
const SKIP_DIRS = new Set([
  'node_modules', '.git', '__pycache__', 'venv', '.venv',
  '.idea', '.vscode', '.vs', '.cursor', '.claude',
  'Windows', 'System32', 'WinSxS', 'assembly',
  '.nuget', 'packages', 'bower_components',
  'obj', 'bin', 'Debug', 'Release', 'dist', '.next',
  'AppData', 'Microsoft', 'Microsoft SDKs', 'Windows Kits',
  'Reference Assemblies', '.dotnet'
])

// Names / patterns that are unlikely to be user-facing tools
const SKIP_NAMES = new Set([
  'unins000', 'unins001', 'uninstall', 'setup', 'install',
  'update', 'updater', 'crashpad_handler', 'crashreporter',
  'nvidia', 'amd', 'intel', 'dxwebsetup', 'vcredist',
  'cleanup', 'repair', 'diagnostics', 'troubleshoot',
  'wix', 'msiexec'
])

function isSystemPath(dirPath: string): boolean {
  const normalized = dirPath.toLowerCase()
  // System directories
  if (normalized.includes('\\windows\\') || normalized.startsWith('c:\\windows')) return true
  if (normalized.includes('\\program files\\') || normalized.startsWith('c:\\program files')) return true
  if (normalized.includes('\\program files (x86)\\') || normalized.startsWith('c:\\program files (x86)')) return true
  if (normalized.includes('\\programdata\\') || normalized.startsWith('c:\\programdata')) return true
  if (normalized.startsWith('c:\\users\\') && (
    normalized.includes('\\appdata\\') ||
    normalized.includes('\\ntuser') ||
    normalized.includes('\\recent\\') ||
    normalized.includes('\\start menu\\')
  )) return true
  return false
}

function shouldSkipDir(name: string, fullPath: string): boolean {
  if (SKIP_DIRS.has(name)) return true
  if (name.startsWith('.') && name.length <= 12) return true // hidden unix dirs
  if (isSystemPath(fullPath)) return true
  return false
}

function shouldSkipFile(name: string): boolean {
  const base = name.toLowerCase()
  for (const skip of SKIP_NAMES) {
    if (base.startsWith(skip)) return true
  }
  return false
}

export function scanDirectoryWithProgress(
  rootDir: string,
  onProgress: (found: number, current: string) => void
): ScanCandidate[] {
  const results: ScanCandidate[] = []
  let count = 0

  function walk(dir: string): void {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!shouldSkipDir(entry.name, fullPath)) {
          count++
          if (count % 20 === 0) {
            onProgress(results.length, fullPath)
          }
          walk(fullPath)
        }
      } else if (entry.isFile() || entry.isSymbolicLink()) {
        const ext = path.extname(entry.name).toLowerCase()
        const launchType = EXTENSION_MAP[ext]
        if (launchType && !shouldSkipFile(entry.name)) {
          results.push({
            name: path.basename(entry.name, ext),
            target: fullPath,
            launch_type: launchType,
            extension: ext
          })
        }
      }
    }
  }

  try {
    walk(rootDir)
  } catch {
    // skip unreadable root
  }

  onProgress(results.length, rootDir)
  return results
}
