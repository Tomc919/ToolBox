import { ipcMain } from 'electron'
import * as categoryRepo from '../db/categoryRepo'
import type { CategoryInput, CategoryUpdate } from '@shared/types'

export function registerCategoryHandlers(): void {
  ipcMain.handle('category:list', async () => {
    return categoryRepo.getAll()
  })

  ipcMain.handle('category:create', async (_event, data: CategoryInput) => {
    return categoryRepo.create(data)
  })

  ipcMain.handle('category:update', async (_event, id: number, data: CategoryUpdate) => {
    return categoryRepo.update(id, data)
  })

  ipcMain.handle('category:delete', async (_event, id: number) => {
    return { success: categoryRepo.remove(id) }
  })

  ipcMain.handle('category:move', async (_event, id: number, parentId: number | null, sort: number) => {
    return { success: categoryRepo.move(id, parentId, sort) }
  })
}
