import { ipcMain } from 'electron'
import { launch } from '../launcher'
import * as toolRepo from '../db/toolRepo'

export function registerLauncherHandlers(): void {
  ipcMain.handle('launch:tool', async (_event, toolId: number) => {
    try {
      const tool = toolRepo.getById(toolId)
      if (!tool) {
        return { success: false, error: '工具不存在' }
      }
      const result = await launch(tool)
      toolRepo.recordLaunch(toolId)
      return result
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  })
}
