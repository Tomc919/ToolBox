import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

export function getDataDir(): string {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'data')
  }
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'data')
}

export function ensureDataDir(): string {
  const dir = getDataDir()
  fs.mkdirSync(path.join(dir, 'icons'), { recursive: true })
  return dir
}
