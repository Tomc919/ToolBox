import { ipcMain, BrowserWindow } from 'electron'
import { scanDirectoryWithProgress } from '../scanner'

export function registerScannerHandlers(): void {
  ipcMain.handle('scanner:scan', async (event, directory: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const results = scanDirectoryWithProgress(directory, (found, current) => {
      win?.webContents.send('scanner:progress', { found, current })
    })
    return results
  })
}
