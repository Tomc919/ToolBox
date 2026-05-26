import type { Category, CategoryInput, CategoryUpdate, Tool, ToolInput, ToolUpdate, ScanCandidate, LaunchResult } from '@shared/types'

interface ElectronAPI {
  category: {
    list: () => Promise<Category[]>
    create: (data: CategoryInput) => Promise<Category>
    update: (id: number, data: CategoryUpdate) => Promise<Category | undefined>
    delete: (id: number) => Promise<{ success: boolean }>
    move: (id: number, parentId: number | null, sort: number) => Promise<{ success: boolean }>
  }
  tool: {
    listByCategory: (categoryId: number | null) => Promise<Tool[]>
    search: (query: string) => Promise<Tool[]>
    create: (data: ToolInput) => Promise<Tool>
    update: (id: number, data: ToolUpdate) => Promise<Tool | undefined>
    delete: (id: number) => Promise<{ success: boolean }>
    toggleFavorite: (id: number) => Promise<{ favorite: 0 | 1 }>
    getRecent: (limit?: number) => Promise<Tool[]>
    getFavorites: () => Promise<Tool[]>
  }
  launch: {
    tool: (toolId: number) => Promise<LaunchResult>
  }
  scanner: {
    scan: (directory: string) => Promise<ScanCandidate[]>
  }
  icon: {
    get: (toolId: number) => Promise<string>
  }
  dialog: {
    openFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>
    openDirectory: () => Promise<string | null>
  }
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    hide: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  settings: {
    get: () => Promise<{ autoStart: boolean; shortcut: string }>
    update: (partial: { autoStart?: boolean; shortcut?: string }) => Promise<{ autoStart: boolean; shortcut: string }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
