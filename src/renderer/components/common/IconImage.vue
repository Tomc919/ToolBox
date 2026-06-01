<template>
  <div class="icon-wrap">
    <img v-if="iconSrc" :src="iconSrc" class="icon-img" />
    <div v-else class="icon-fallback" :style="{ backgroundColor: bgColor }">
      <el-icon :size="20" :color="iconColor">
        <component :is="defaultIcon" />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Monitor, Connection, Link, DataAnalysis, Cpu, Operation, Platform, Document } from '@element-plus/icons-vue'

const props = defineProps<{ toolId: number; launchType: string }>()

const iconSrc = ref<string | null>(null)

const typeInfo = computed(() => {
  const map: Record<string, { icon: unknown; color: string }> = {
    exe: { icon: Monitor, color: '#4A90D9' },
    jar: { icon: Platform, color: '#F5A623' },
    python: { icon: DataAnalysis, color: '#4A90D9' },
    powershell: { icon: Cpu, color: '#5B8DEF' },
    command: { icon: Operation, color: '#8E8E93' },
    url: { icon: Link, color: '#FF6B6B' },
    ssh: { icon: Connection, color: '#8E8E93' },
    txt: { icon: Document, color: '#4A90D9' }
  }
  return map[props.launchType] || { icon: Monitor, color: '#8E8E93' }
})

const defaultIcon = computed(() => typeInfo.value.icon)
const bgColor = computed(() => typeInfo.value.color + '18')
const iconColor = computed(() => typeInfo.value.color)

async function loadIcon(): Promise<void> {
  try {
    const result = await window.electronAPI.icon.get(props.toolId)
    if (result) iconSrc.value = result
  } catch {
    iconSrc.value = null
  }
}

onMounted(loadIcon)
watch(() => props.toolId, loadIcon)
</script>

<style scoped>
.icon-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 11px;
}
.icon-fallback {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.3);
}
</style>
