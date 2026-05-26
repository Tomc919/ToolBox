<template>
  <div class="header">
    <div class="header-left">
      <button class="collapse-btn" @click="appStore.toggleSidebar()">
        <el-icon :size="18"><Fold v-if="!appStore.sidebarCollapsed" /><Expand v-else /></el-icon>
      </button>
      <span class="header-title" v-if="toolStore.viewMode === 'search'">
        搜索 "{{ toolStore.searchQuery }}"
      </span>
      <span class="header-title" v-else-if="toolStore.viewMode === 'favorites'">收藏</span>
      <span class="header-title" v-else-if="toolStore.viewMode === 'recent'">最近使用</span>
      <span class="header-title" v-else-if="toolStore.viewMode === 'category' && categoryStore.currentCategory">
        {{ categoryStore.currentCategory.name }}
      </span>
      <span class="header-title" v-else>全部工具</span>
      <span class="header-count" v-if="!toolStore.loading">({{ toolStore.tools.length }})</span>
    </div>
    <div class="header-center">
      <SearchBar />
    </div>
    <div class="header-right">
      <el-button type="primary" :icon="Plus" size="default" @click="showToolDialog = true">
        添加工具
      </el-button>
    </div>
    <ToolDialog v-model:visible="showToolDialog" @saved="onToolSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Fold, Expand, Plus } from '@element-plus/icons-vue'
import SearchBar from '@/components/search/SearchBar.vue'
import ToolDialog from '@/components/tool/ToolDialog.vue'
import { useAppStore } from '@/stores/app'
import { useCategoryStore } from '@/stores/category'
import { useToolStore } from '@/stores/tool'

const appStore = useAppStore()
const categoryStore = useCategoryStore()
const toolStore = useToolStore()

const showToolDialog = ref(false)

async function onToolSaved(): Promise<void> {
  showToolDialog.value = false
  if (toolStore.isSearching) {
    await toolStore.search(toolStore.searchQuery, toolStore.searchScope)
  } else if (toolStore.viewMode === 'favorites') {
    await toolStore.loadFavorites()
  } else if (toolStore.viewMode === 'recent') {
    await toolStore.loadRecent()
  } else {
    await toolStore.loadByCategory(categoryStore.selectedId)
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 20px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.collapse-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.18s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.collapse-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--text-primary);
}
.header-title {
  font-size: 16px;
  font-weight: 620;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}
.header-count {
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 450;
}
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}
.header-right {
  flex-shrink: 0;
}
</style>
