import type { Category, CategoryInput, CategoryUpdate, Tool, ToolInput, ToolUpdate, ScanCandidate, LaunchResult } from '@shared/types'

const api = window.electronAPI

// Category
export const fetchCategories = (): Promise<Category[]> => api.category.list()
export const createCategory = (data: CategoryInput): Promise<Category> => api.category.create(data)
export const updateCategory = (id: number, data: CategoryUpdate): Promise<Category | undefined> => api.category.update(id, data)
export const deleteCategory = (id: number): Promise<{ success: boolean }> => api.category.delete(id)
export const moveCategory = (id: number, parentId: number | null, sort: number): Promise<{ success: boolean }> => api.category.move(id, parentId, sort)

// Tool
export const fetchToolsByCategory = (categoryId: number | null): Promise<Tool[]> => api.tool.listByCategory(categoryId)
export const searchTools = (query: string, scope?: { type: string; categoryId?: number | null }): Promise<Tool[]> => api.tool.search(query, scope)
export const createTool = (data: ToolInput): Promise<Tool> => api.tool.create(data)
export const updateTool = (id: number, data: ToolUpdate): Promise<Tool | undefined> => api.tool.update(id, data)
export const deleteTool = (id: number): Promise<{ success: boolean }> => api.tool.delete(id)
export const toggleFavorite = (id: number): Promise<{ favorite: 0 | 1 }> => api.tool.toggleFavorite(id)
export const fetchRecentTools = (limit?: number): Promise<Tool[]> => api.tool.getRecent(limit)
export const fetchFavoriteTools = (): Promise<Tool[]> => api.tool.getFavorites()

// Launch
export const launchTool = (toolId: number): Promise<LaunchResult> => api.launch.tool(toolId)

// Scanner
export const scanDirectory = (directory: string): Promise<ScanCandidate[]> => api.scanner.scan(directory)

// Icon
export const getToolIcon = (toolId: number): Promise<string> => api.icon.get(toolId)

// Window
export const hideWindow = () => api.window.hide()

// Settings
export const getSettings = () => api.settings.get()
export const updateSettings = (partial: Record<string, unknown>) => api.settings.update(partial)
