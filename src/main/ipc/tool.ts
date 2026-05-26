import { ipcMain } from 'electron'
import * as toolRepo from '../db/toolRepo'
import type { ToolInput, ToolUpdate } from '@shared/types'

export function registerToolHandlers(): void {
  ipcMain.handle('tool:list-by-category', async (_event, categoryId: number | null) => {
    return toolRepo.getByCategory(categoryId)
  })

  ipcMain.handle('tool:search', async (_event, query: string, scope?: toolRepo.SearchScope) => {
    return toolRepo.search(query, scope)
  })

  ipcMain.handle('tool:create', async (_event, data: ToolInput) => {
    return toolRepo.create(data)
  })

  ipcMain.handle('tool:update', async (_event, id: number, data: ToolUpdate) => {
    return toolRepo.update(id, data)
  })

  ipcMain.handle('tool:delete', async (_event, id: number) => {
    return { success: toolRepo.remove(id) }
  })

  ipcMain.handle('tool:toggle-favorite', async (_event, id: number) => {
    return { favorite: toolRepo.toggleFavorite(id) }
  })

  ipcMain.handle('tool:get-recent', async (_event, limit?: number) => {
    return toolRepo.getRecent(limit ?? 10)
  })

  ipcMain.handle('tool:get-favorites', async () => {
    return toolRepo.getFavorites()
  })
}
