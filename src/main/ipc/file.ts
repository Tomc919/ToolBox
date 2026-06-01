import { ipcMain } from 'electron'
import fs from 'node:fs'

export function registerFileHandlers(): void {
  ipcMain.handle('file:read-text', async (_event, filePath: string) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`)
    }
    const stat = fs.statSync(filePath)
    if (stat.size > 5 * 1024 * 1024) {
      throw new Error('文件过大（超过 5MB），请在外部编辑器中打开')
    }
    return fs.readFileSync(filePath, 'utf-8')
  })
}
