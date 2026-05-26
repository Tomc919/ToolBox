import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/ipc'
import type { Tool, ToolInput, ToolUpdate } from '@shared/types'
import { ElMessage } from 'element-plus'

export const useToolStore = defineStore('tool', () => {
  const tools = ref<Tool[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const isSearching = ref(false)
  const searchScope = ref<{ type: string; categoryId?: number | null } | undefined>(undefined)
  const viewMode = ref<'all' | 'favorites' | 'recent' | 'category' | 'search'>('all')

  async function loadByCategory(categoryId: number | null): Promise<void> {
    loading.value = true
    isSearching.value = false
    searchQuery.value = ''
    viewMode.value = categoryId !== null ? 'category' : 'all'
    try {
      tools.value = await api.fetchToolsByCategory(categoryId)
    } finally {
      loading.value = false
    }
  }

  async function search(query: string, scope?: { type: string; categoryId?: number | null }): Promise<void> {
    loading.value = true
    isSearching.value = true
    searchQuery.value = query
    searchScope.value = scope
    // Don't change viewMode when scoped — stay in the current view
    if (!scope || scope.type === 'all') {
      viewMode.value = 'search'
    }
    try {
      if (!query.trim()) {
        tools.value = []
        isSearching.value = false
        return
      }
      tools.value = await api.searchTools(query, scope)
    } finally {
      loading.value = false
    }
  }

  async function createTool(data: ToolInput): Promise<Tool | null> {
    try {
      const tool = await api.createTool(data)
      return tool
    } catch (err: unknown) {
      ElMessage.error('创建工具失败')
      return null
    }
  }

  async function updateTool(id: number, data: ToolUpdate): Promise<Tool | null> {
    try {
      const tool = await api.updateTool(id, data)
      return tool ?? null
    } catch (err: unknown) {
      ElMessage.error('更新工具失败')
      return null
    }
  }

  async function removeTool(id: number): Promise<boolean> {
    try {
      const result = await api.deleteTool(id)
      if (result.success) {
        tools.value = tools.value.filter(t => t.id !== id)
        return true
      }
      return false
    } catch (err: unknown) {
      ElMessage.error('删除工具失败')
      return false
    }
  }

  async function toggleFav(id: number): Promise<void> {
    const result = await api.toggleFavorite(id)
    const tool = tools.value.find(t => t.id === id)
    if (tool) {
      tool.favorite = result.favorite
    }
  }

  async function launch(id: number): Promise<void> {
    const result = await api.launchTool(id)
    if (result.success) {
      ElMessage.success('启动成功')
      setTimeout(() => api.hideWindow(), 800)
      // Refresh tools to update last_launch_time
      const tool = tools.value.find(t => t.id === id)
      if (tool) {
        tool.last_launch_time = new Date().toISOString()
      }
    } else {
      ElMessage.error(result.error || '启动失败')
    }
  }

  async function loadRecent(limit?: number): Promise<void> {
    loading.value = true
    isSearching.value = false
    searchQuery.value = ''
    viewMode.value = 'recent'
    try {
      tools.value = await api.fetchRecentTools(limit)
    } finally {
      loading.value = false
    }
  }

  async function loadFavorites(): Promise<void> {
    loading.value = true
    isSearching.value = false
    searchQuery.value = ''
    viewMode.value = 'favorites'
    try {
      tools.value = await api.fetchFavoriteTools()
    } finally {
      loading.value = false
    }
  }

  return {
    tools,
    loading,
    searchQuery,
    isSearching,
    searchScope,
    viewMode,
    loadByCategory,
    search,
    createTool,
    updateTool,
    removeTool,
    toggleFav,
    launch,
    loadRecent,
    loadFavorites
  }
})
