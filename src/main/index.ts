import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron'
import path from 'node:path'
import { openDatabase, closeDatabase } from './db/connection'
import { registerAllIpcHandlers } from './ipc'
import { setShortcutHandler } from './ipc/settings'
import { loadSettings } from './settings'
import { createTray, destroyTray } from './tray'

let mainWindow: BrowserWindow | null = null
let isQuitting = false

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 640,
    minWidth: 780,
    minHeight: 500,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1c1c1e',
    title: 'ToolBox',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Close to tray instead of quitting
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function registerGlobalShortcut(shortcut: string): void {
  try {
    globalShortcut.register(shortcut, () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })
  } catch {
    // Accelerator already taken or invalid
  }
}

function setupAutoStart(): void {
  const settings = loadSettings()
  app.setLoginItemSettings({
    openAtLogin: settings.autoStart,
    args: ['--hidden']
  })
}

app.whenReady().then(async () => {
  openDatabase()
  registerAllIpcHandlers()
  setShortcutHandler((shortcut) => {
    registerGlobalShortcut(shortcut)
  })
  createWindow()

  // System tray
  await createTray(mainWindow!)

  // Auto-start
  setupAutoStart()

  // Global shortcut
  const settings = loadSettings()
  if (settings.shortcut) {
    registerGlobalShortcut(settings.shortcut)
  }

  // Hide window on startup if launched with --hidden
  const hiddenArg = process.argv.includes('--hidden')
  if (hiddenArg) {
    mainWindow?.hide()
  }

  registerWindowHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function registerWindowHandlers(): void {
  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.handle('window:close', () => mainWindow?.close())
  ipcMain.handle('window:hide', () => mainWindow?.hide())
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)
}

app.on('before-quit', () => {
  isQuitting = true
  globalShortcut.unregisterAll()
  destroyTray()
  closeDatabase()
})
