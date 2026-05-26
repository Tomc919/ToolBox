<template>
  <div class="sidebar">
    <div class="sidebar-brand" @click="appStore.toggleSidebar()">
      <div class="brand-icon">
        <el-icon :size="20"><Monitor /></el-icon>
      </div>
      <span class="brand-text" :class="{ collapsed: appStore.sidebarCollapsed }">ToolBox</span>
    </div>

    <el-menu :default-active="activeMenu" :collapse="appStore.sidebarCollapsed" class="sidebar-menu" @select="handleMenuSelect">
      <el-menu-item index="all"><el-icon><Grid /></el-icon><span>全部工具</span></el-menu-item>
      <el-menu-item index="favorites"><el-icon><Star /></el-icon><span>收藏</span></el-menu-item>
      <el-menu-item index="recent"><el-icon><Timer /></el-icon><span>最近使用</span></el-menu-item>
    </el-menu>

    <div class="sidebar-divider" :class="{ collapsed: appStore.sidebarCollapsed }"></div>

    <div class="category-section" :class="{ collapsed: appStore.sidebarCollapsed }">
      <div class="category-header">
        <span>分类</span>
        <button class="add-cat-btn" @click="showAddDialog = true">
          <el-icon :size="13"><Plus /></el-icon>
        </button>
      </div>
      <CategoryTree />
    </div>

    <div class="sidebar-footer" :class="{ collapsed: appStore.sidebarCollapsed }">
      <button class="scan-btn" @click="$router.push('/scan')">
        <el-icon :size="16"><FolderOpened /></el-icon>
        <span>扫描导入</span>
      </button>
      <button class="scan-btn" @click="$router.push('/settings')">
        <el-icon :size="16"><Setting /></el-icon>
        <span>设置</span>
      </button>
    </div>

    <CategoryDialog v-model:visible="showAddDialog" @saved="onCategorySaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Grid, Star, Timer, FolderOpened, Monitor, Setting } from '@element-plus/icons-vue'
import CategoryTree from '@/components/category/CategoryTree.vue'
import CategoryDialog from '@/components/category/CategoryDialog.vue'
import { useAppStore } from '@/stores/app'
import { useCategoryStore } from '@/stores/category'
import { useToolStore } from '@/stores/tool'

const router = useRouter()
const appStore = useAppStore()
const categoryStore = useCategoryStore()
const toolStore = useToolStore()
const showAddDialog = ref(false)
const activeMenu = computed(() => {
  if (toolStore.isSearching && toolStore.viewMode === 'search') return ''
  if (toolStore.viewMode === 'favorites') return 'favorites'
  if (toolStore.viewMode === 'recent') return 'recent'
  return 'all'
})

function handleMenuSelect(index: string): void {
  router.push('/')
  categoryStore.selectCategory(null)
  if (index === 'all') toolStore.loadByCategory(null)
  else if (index === 'favorites') toolStore.loadFavorites()
  else if (index === 'recent') toolStore.loadRecent()
}
function onCategorySaved(): void { showAddDialog.value = false }
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #0d1b33 0%, #101f3d 40%, #0f1d38 100%);
  user-select: none;
  --el-menu-collapse-width: 68px;
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 16px 18px;
  cursor: pointer;
}
.brand-icon {
  width: 36px; height: 36px;
  border-radius: 11px;
  background: linear-gradient(135deg, #4d8fd9, #3060a8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(42,82,160,0.35);
}
.brand-text {
  font-size: 17px;
  font-weight: 650;
  color: #fff;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.22s ease, max-width 0.22s ease;
  max-width: 200px;
}
.brand-text.collapsed {
  opacity: 0;
  max-width: 0;
}
.sidebar-divider {
  height: 0.5px;
  background: rgba(255,255,255,0.08);
  margin: 8px 18px;
  transition: opacity 0.22s ease, margin 0.22s ease;
}
.sidebar-divider.collapsed {
  opacity: 0;
  margin: 8px 10px;
}
.category-section {
  flex: 1;
  overflow-y: auto;
  padding: 0 6px;
  transition: opacity 0.22s ease;
}
.category-section.collapsed {
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}
.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px 8px;
  color: rgba(255,255,255,0.35);
  font-size: 10.5px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.add-cat-btn {
  width: 24px; height: 24px;
  border-radius: 7px;
  border: none;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.50);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.add-cat-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }
.sidebar-footer {
  padding: 12px 12px;
  border-top: 0.5px solid rgba(255,255,255,0.06);
  transition: opacity 0.22s ease;
}
.sidebar-footer.collapsed {
  opacity: 0;
  pointer-events: none;
}
.scan-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  font-size: 13px;
  font-weight: 480;
  transition: all 0.18s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.scan-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
</style>
