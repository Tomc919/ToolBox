<template>
  <div v-loading="loading" class="tool-grid-wrapper">
    <div v-if="tools.length === 0 && !loading" class="empty-wrap">
      <EmptyState message="暂无工具，点击上方「添加工具」或「扫描导入」" />
    </div>
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
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import ToolCard from './ToolCard.vue'
import ToolDialog from './ToolDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useToolStore } from '@/stores/tool'
import type { Tool } from '@shared/types'

defineProps<{ tools: Tool[]; loading: boolean }>()
const emit = defineEmits<{ reload: [] }>()
const toolStore = useToolStore()
const dialogVisible = ref(false)
const editingTool = ref<Tool | null>(null)

function handleLaunch(id: number): void { toolStore.launch(id) }
function handleEdit(id: number): void {
  const tool = toolStore.tools.find(t => t.id === id)
  if (tool) { editingTool.value = tool; dialogVisible.value = true }
}
async function handleDelete(id: number): Promise<void> {
  const tool = toolStore.tools.find(t => t.id === id)
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
</style>
