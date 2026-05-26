import { ipcMain, dialog, BrowserWindow } from 'electron'

export function registerDialogHandlers(): void {
  ipcMain.handle('dialog:open-file', async (event, options: { filters?: { name: string; extensions: string[] }[] }) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: options.filters
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:open-directory', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })
}
