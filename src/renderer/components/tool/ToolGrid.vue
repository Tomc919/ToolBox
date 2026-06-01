<template>
  <div v-loading="loading" class="tool-grid-wrapper">
    <div v-if="!hasContent && !loading" class="empty-wrap">
      <EmptyState message="暂无工具，点击上方「添加工具」或「扫描导入」" />
    </div>

    <!-- Grouped view -->
    <template v-else-if="groups && groups.length > 0">
      <div v-for="group in groups" :key="group.categoryId" class="tool-group">
        <div class="group-section">
          <div class="group-header">
            <span class="group-pill">{{ group.categoryName }}</span>
          </div>
          <div class="group-divider"></div>
        </div>
        <div class="tool-grid">
          <ToolCard
            v-for="tool in group.tools"
            :key="tool.id"
            :tool="tool"
            @launch="handleLaunch"
            @edit="handleEdit"
            @delete="handleDelete"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
      </div>
    </template>

    <!-- Flat view -->
    <div v-else class="tool-grid">
      <ToolCard
        v-for="tool in tools"
        :key="tool.id"
        :tool="tool"
        @launch="handleLaunch"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle-favorite="handleToggleFavorite"
      />
    </div>

    <ToolDialog v-model:visible="dialogVisible" :tool="editingTool" @saved="$emit('reload')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import ToolCard from './ToolCard.vue'
import ToolDialog from './ToolDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useToolStore } from '@/stores/tool'
import type { Tool } from '@shared/types'
import type { ToolGroup } from '@/stores/tool'

const props = defineProps<{ tools: Tool[]; loading: boolean; groups?: ToolGroup[] }>()
const emit = defineEmits<{ reload: [] }>()
const toolStore = useToolStore()
const dialogVisible = ref(false)
const editingTool = ref<Tool | null>(null)

const hasContent = computed(() => {
  if (props.groups && props.groups.length > 0) return true
  return props.tools.length > 0
})

function findTool(id: number): Tool | undefined {
  return toolStore.tools.find(t => t.id === id)
    ?? toolStore.toolGroups.flatMap(g => g.tools).find(t => t.id === id)
}

function handleLaunch(id: number): void {
  const tool = findTool(id)
  if (tool?.launch_type === 'txt') {
    window.electronAPI.window.openDocument(tool.target, tool.name)
    return
  }
  toolStore.launch(id)
}
function handleEdit(id: number): void {
  const tool = findTool(id)
  if (tool) { editingTool.value = tool; dialogVisible.value = true }
}
async function handleDelete(id: number): Promise<void> {
  const tool = findTool(id)
  if (!tool) return
  try {
    await ElMessageBox.confirm(`确定要删除 "${tool.name}" 吗？`, '确认删除', {
      confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
    })
    await toolStore.removeTool(id)
    emit('reload')
  } catch { /* cancelled */ }
}
function handleToggleFavorite(id: number): void { toolStore.toggleFav(id) }
</script>

<style scoped>
.tool-grid-wrapper { min-height: 200px; }
.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.empty-wrap {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}

/* --- Grouped view --- */
.tool-group {
  margin-bottom: 36px;
}
.tool-group:last-child {
  margin-bottom: 0;
}
.group-section {
  margin-bottom: 16px;
}
.group-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.group-pill {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.2px;
  padding: 3px 10px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.04);
}
.group-divider {
  height: 0.5px;
  background: var(--border-default);
}
</style>
