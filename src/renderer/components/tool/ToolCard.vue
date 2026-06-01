<template>
  <div class="tool-card" @click="$emit('launch', tool.id)">
    <div class="card-bg"></div>
    <div class="card-inner">
      <div class="card-icon">
        <IconImage :tool-id="tool.id" :launch-type="tool.launch_type" />
      </div>
      <div class="card-info">
        <span class="card-name">{{ tool.name }}</span>
        <span class="card-meta">{{ launchLabel }}</span>
      </div>
    </div>
    <div class="card-actions">
      <button class="act-btn" :class="{ active: tool.favorite }" @click.stop="$emit('toggle-favorite', tool.id)" title="收藏">
        <el-icon :size="14"><StarFilled v-if="tool.favorite" /><Star v-else /></el-icon>
      </button>
      <el-tooltip v-if="tool.description" :content="tool.description" placement="top" :show-after="300">
        <button class="act-btn" @click.stop title="描述">
          <el-icon :size="14"><InfoFilled /></el-icon>
        </button>
      </el-tooltip>
      <el-dropdown trigger="click" @command="handleCommand">
        <button class="act-btn" @click.stop title="更多">
          <el-icon :size="14"><MoreFilled /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit" :icon="Edit">编辑</el-dropdown-item>
            <el-dropdown-item command="delete" :icon="Delete" divided>删除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star, StarFilled, MoreFilled, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'
import IconImage from '@/components/common/IconImage.vue'
import type { Tool } from '@shared/types'

const props = defineProps<{ tool: Tool }>()
const emit = defineEmits<{
  launch: [id: number]
  edit: [id: number]
  delete: [id: number]
  'toggle-favorite': [id: number]
}>()

const launchLabel = computed(() => {
  const map: Record<string, string> = {
    exe: '应用程序', jar: 'Java', python: 'Python',
    powershell: 'PowerShell', command: '脚本', custom: '自定义', url: '链接', ssh: 'SSH',txt:'文本文档'
  }
  return map[props.tool.launch_type] || props.tool.launch_type
})

function handleCommand(cmd: string): void {
  if (cmd === 'edit') emit('edit', props.tool.id)
  else if (cmd === 'delete') emit('delete', props.tool.id)
}
</script>

<style scoped>
.tool-card {
  position: relative;
  border-radius: 18px;
  cursor: pointer;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  background: rgba(255,255,255,0.60);
  backdrop-filter: blur(16px) saturate(170%);
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  border: 0.5px solid rgba(0,0,0,0.03);
  box-shadow: var(--shadow-xs);
}
.tool-card:hover {
  background: rgba(255,255,255,0.88);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: rgba(0,0,0,0.06);
}
.tool-card:active {
  transform: scale(0.99);
  transition: all 0.1s ease;
}
.card-inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  z-index: 1;
}
.card-icon {
  width: 46px; height: 46px;
  flex-shrink: 0;
}
.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.card-name {
  font-size: 14px;
  font-weight: 590;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.2px;
}
.card-meta {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 450;
}
.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 3px;
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 2;
}
.tool-card:hover .card-actions { opacity: 1; }
.act-btn {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.70);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.18s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.act-btn:hover {
  background: #fff;
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.act-btn.active {
  color: #f5a623;
  background: rgba(245,166,35,0.14);
  box-shadow: none;
}
</style>
