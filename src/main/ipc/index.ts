import { registerCategoryHandlers } from './category'
import { registerToolHandlers } from './tool'
import { registerLauncherHandlers } from './launcher'
import { registerScannerHandlers } from './scanner'
import { registerIconHandlers } from './icon'
import { registerDialogHandlers } from './dialog'
import { registerSettingsHandlers } from './settings'
import { registerFileHandlers } from './file'

export function registerAllIpcHandlers(): void {
  registerCategoryHandlers()
  registerToolHandlers()
  registerLauncherHandlers()
  registerScannerHandlers()
  registerIconHandlers()
  registerDialogHandlers()
  registerSettingsHandlers()
  registerFileHandlers()
}
