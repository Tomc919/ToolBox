import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron'
import path from 'node:path'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

async function createTrayIcon(): Promise<nativeImage> {
  // Use the app's own exe icon (works in production; falls back gracefully in dev)
  try {
    const exePath = app.getPath('exe')
    const raw = await app.getFileIcon(exePath, { size: 'small' })
    if (!raw.isEmpty()) {
      const png = raw.toPNG()
      const img = nativeImage.createFromBuffer(png, { width: 16, height: 16 })
      if (!img.isEmpty()) return img
    }
  } catch { /* fall through */ }

  // Last resort: blue "TB" letter icon on transparent background
  const size = 16
  const buf = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const dx = x - 7.5, dy = y - 7.5
      const dist2 = dx * dx + dy * dy
      if (dist2 <= 7.5 * 7.5) {
        buf[i] = 40; buf[i+1] = 86; buf[i+2] = 168
        buf[i+3] = 255
      } else {
        buf[i] = 0; buf[i+1] = 0; buf[i+2] = 0; buf[i+3] = 0
      }
    }
  }
  return nativeImage.createFromBuffer(buf, { width: size, height: size })
}

export async function createTray(window: BrowserWindow): Promise<Tray> {
  mainWindow = window

  const icon = await createTrayIcon()
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示 ToolBox',
      click: () => showWindow()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        mainWindow?.removeAllListeners('close')
        mainWindow?.close()
        tray?.destroy()
        tray = null
      }
    }
  ])

  tray.setToolTip('ToolBox')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => showWindow())

  return tray
}

function showWindow(): void {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
