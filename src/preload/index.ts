import { contextBridge, ipcRenderer } from 'electron'
import type { CategoryInput, CategoryUpdate, ToolInput, ToolUpdate, ScanCandidate, LaunchResult } from '@shared/types'

contextBridge.exposeInMainWorld('electronAPI', {
  category: {
    list: () => ipcRenderer.invoke('category:list'),
    create: (data: CategoryInput) => ipcRenderer.invoke('category:create', data),
    update: (id: number, data: CategoryUpdate) => ipcRenderer.invoke('category:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('category:delete', id),
    move: (id: number, parentId: number | null, sort: number) => ipcRenderer.invoke('category:move', id, parentId, sort)
  },
  tool: {
    listByCategory: (categoryId: number | null) => ipcRenderer.invoke('tool:list-by-category', categoryId),
    search: (query: string, scope?: { type: string; categoryId?: number | null }) => ipcRenderer.invoke('tool:search', query, scope),
    create: (data: ToolInput) => ipcRenderer.invoke('tool:create', data),
    update: (id: number, data: ToolUpdate) => ipcRenderer.invoke('tool:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('tool:delete', id),
    toggleFavorite: (id: number) => ipcRenderer.invoke('tool:toggle-favorite', id),
    getRecent: (limit?: number) => ipcRenderer.invoke('tool:get-recent', limit),
    getFavorites: () => ipcRenderer.invoke('tool:get-favorites')
  },
  launch: {
    tool: (toolId: number): Promise<LaunchResult> => ipcRenderer.invoke('launch:tool', toolId)
  },
  scanner: {
    scan: (directory: string): Promise<ScanCandidate[]> => ipcRenderer.invoke('scanner:scan', directory)
  },
  icon: {
    get: (toolId: number): Promise<string> => ipcRenderer.invoke('icon:get', toolId)
  },
  dialog: {
    openFile: (filters?: { name: string; extensions: string[] }[]): Promise<string | null> =>
      ipcRenderer.invoke('dialog:open-file', { filters }),
    openDirectory: (): Promise<string | null> =>
      ipcRenderer.invoke('dialog:open-directory')
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    hide: () => ipcRenderer.invoke('window:hide'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized')
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (partial: Record<string, unknown>) => ipcRenderer.invoke('settings:update', partial)
  }
})
