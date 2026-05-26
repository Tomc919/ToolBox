import { ipcMain } from 'electron'
import { getOrExtractIcon, getDefaultIcon } from '../icon'
import * as toolRepo from '../db/toolRepo'

export function registerIconHandlers(): void {
  ipcMain.handle('icon:get', async (_event, toolId: number) => {
    const tool = toolRepo.getById(toolId)
    if (!tool) return getDefaultIcon('exe')
    return getOrExtractIcon(tool)
  })
}
