import { ipcMain, app, globalShortcut } from 'electron'
import { loadSettings, saveSettings } from '../settings'
import type { AppSettings } from '../settings'

let onShortcutChanged: ((shortcut: string) => void) | null = null

export function registerSettingsHandlers(): void {

  ipcMain.handle('settings:get', async () => {
    return loadSettings()
  })

  ipcMain.handle('settings:update', async (_event, partial: Partial<AppSettings>) => {
    const prev = loadSettings()
    const next = saveSettings(partial)

    // Handle auto-start change
    if (partial.autoStart !== undefined && partial.autoStart !== prev.autoStart) {
      app.setLoginItemSettings({
        openAtLogin: next.autoStart,
        args: ['--hidden']
      })
    }

    // Handle shortcut change
    if (partial.shortcut !== undefined && partial.shortcut !== prev.shortcut) {
      if (prev.shortcut) {
        globalShortcut.unregister(prev.shortcut)
      }
      if (next.shortcut) {
        if (onShortcutChanged) {
          onShortcutChanged(next.shortcut)
        }
      }
    }

    return next
  })
}

export function setShortcutHandler(cb: (shortcut: string) => void): void {
  onShortcutChanged = cb
}
