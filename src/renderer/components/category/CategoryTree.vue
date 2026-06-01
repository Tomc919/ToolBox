<template>
  <el-tree
    ref="treeRef"
    :data="categoryStore.tree"
    :props="{ children: 'children', label: 'label' }"
    node-key="id"
    highlight-current
    :expand-on-click-node="false"
    :current-node-key="categoryStore.selectedId"
    @node-click="handleNodeClick"
  >
    <template #default="{ node, data }">
      <div
        class="tree-node"
        @dblclick.stop="handleNodeDblClick(data, node)"
        @contextmenu.prevent="showContextMenu($event, data, node)"
      >
        <el-icon :size="15" class="tree-folder-icon">
          <FolderOpened v-if="node.expanded && node.childNodes.length > 0" />
          <Folder v-else />
        </el-icon>
        <span class="tree-label">{{ data.label }}</span>
      </div>
    </template>
  </el-tree>

  <div v-if="contextVisible" class="context-menu" :style="contextStyle">
    <div class="context-item" @click="startRename">重命名</div>
    <div class="context-item" @click="startAddChild">添加子分类</div>
    <div class="context-item danger" @click="startDelete">删除</div>
  </div>

  <CategoryDialog
    v-model:visible="dialogVisible"
    :category="editingCategory"
    @saved="onDialogSaved"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Folder, FolderOpened } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useCategoryStore } from '@/stores/category'
import CategoryDialog from './CategoryDialog.vue'
import type { Category } from '@shared/types'

const router = useRouter()
const categoryStore = useCategoryStore()
const treeRef = ref()

const contextVisible = ref(false)
const contextTarget = ref<Category | null>(null)
const contextStyle = reactive({ top: '0px', left: '0px' })
const dialogVisible = ref(false)
const editingCategory = ref<Category | null>(null)

function handleNodeClick(data: { id: number }): void {
  contextVisible.value = false
  categoryStore.selectCategory(data.id)
  router.push('/')
}

function handleNodeDblClick(_data: unknown, node: { expanded: boolean; expand: () => void; collapse: () => void }): void {
  if (node.expanded) {
    node.collapse()
  } else {
    node.expand()
  }
}

function showContextMenu(event: MouseEvent, data: { id: number; label: string; children?: unknown[] }, _node: unknown): void {
  const cat = categoryStore.categories.find(c => c.id === data.id)
  if (!cat) return
  contextTarget.value = cat
  contextStyle.top = `${event.clientY}px`
  contextStyle.left = `${event.clientX}px`
  contextVisible.value = true
}

function hideContext(): void {
  contextVisible.value = false
}

function startRename(): void {
  if (!contextTarget.value) return
  editingCategory.value = contextTarget.value
  dialogVisible.value = true
  hideContext()
}

function startAddChild(): void {
  editingCategory.value = null
  dialogVisible.value = true
  hideContext()
}

async function startDelete(): Promise<void> {
  if (!contextTarget.value) return
  try {
    await ElMessageBox.confirm(
      `确定要删除分类 "${contextTarget.value.name}" 吗？分类下的工具不会被删除。`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await categoryStore.removeCategory(contextTarget.value.id)
  } catch {
    // cancelled
  }
  hideContext()
}

function onDialogSaved(): void {
  dialogVisible.value = false
  editingCategory.value = null
}

onMounted(() => {
  document.addEventListener('click', hideContext)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContext)
})

onMounted(async () => {
  await categoryStore.loadCategories()
})
</script>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.tree-folder-icon {
  flex-shrink: 0;
  color: rgba(130, 180, 230, 0.85);
}
.tree-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}
.context-menu {
  position: fixed;
  z-index: 9999;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 4px;
  min-width: 150px;
}
.context-item {
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 480;
  border-radius: 8px;
  transition: all 0.12s ease;
  color: var(--text-primary);
}
.context-item:hover {
  background: rgba(0,0,0,0.05);
}
.context-item.danger {
  color: #e74c3c;
}
.context-item.danger:hover {
  background: rgba(231,76,60,0.08);
}
</style>
