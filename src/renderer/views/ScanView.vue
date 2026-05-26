<template>
  <div class="scan-view">
    <div class="scan-header">
      <h2>扫描导入工具</h2>
      <p>选择目录，自动识别可执行文件和脚本，批量导入到工具箱。</p>
    </div>

    <div class="scan-bar">
      <el-input v-model="scanDir" placeholder="目录路径，如 D:\Tools" size="large">
        <template #suffix>
          <span class="browse-link" @click="browseDir">
            <el-icon :size="14"><FolderOpened /></el-icon>
            <span>浏览</span>
          </span>
        </template>
      </el-input>
      <el-button type="primary" size="large" :icon="Search" :loading="scanning" @click="startScan">
        开始扫描
      </el-button>
    </div>

    <div v-if="scanning" class="scan-progress">
      <el-progress :percentage="100" :indeterminate="true" :stroke-width="4" />
      <p>扫描中，已找到 {{ candidates.length }} 个工具...</p>
    </div>

    <div v-if="candidates.length > 0 && !scanning" class="scan-results">
      <div class="results-top">
        <span class="results-title">找到 {{ candidates.length }} 个可导入工具</span>
        <div class="results-actions">
          <el-button size="small" @click="selectAll">全选</el-button>
          <el-button size="small" @click="deselectAll">取消</el-button>
          <el-button type="primary" size="small" :loading="importing" @click="importSelected">
            导入选中 ({{ selectedCount }})
          </el-button>
        </div>
      </div>

      <el-table ref="tableRef" :data="candidates" @selection-change="onSelectionChange" max-height="420" style="margin-top:12px">
        <el-table-column type="selection" width="40" />
        <el-table-column prop="name" label="名称" min-width="180" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.launch_type.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="路径" min-width="280">
          <template #default="{ row }">
            <span class="path-cell">{{ row.target }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="scanned && candidates.length === 0 && !scanning" class="empty-wrap">
      <EmptyState message="该目录中未找到可识别的工具文件" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, FolderOpened } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { scanDirectory, createTool } from '@/api/ipc'
import EmptyState from '@/components/common/EmptyState.vue'
import type { ScanCandidate } from '@shared/types'

const scanDir = ref('D:\\Tools')
const scanning = ref(false)
const scanned = ref(false)
const importing = ref(false)
const candidates = ref<ScanCandidate[]>([])
const selected = ref<ScanCandidate[]>([])
const selectedCount = computed(() => selected.value.length)
const tableRef = ref()

function onSelectionChange(val: ScanCandidate[]): void { selected.value = val }
function selectAll(): void {
  candidates.value.forEach(row => tableRef.value?.toggleRowSelection(row, true))
}
function deselectAll(): void {
  tableRef.value?.clearSelection()
}

async function startScan(): Promise<void> {
  if (!scanDir.value.trim()) return
  scanning.value = true; scanned.value = false; candidates.value = []
  try {
    candidates.value = await scanDirectory(scanDir.value.trim())
    scanned.value = true
    ElMessage.success(`找到 ${candidates.value.length} 个工具`)
  } catch { ElMessage.error('扫描失败') }
  finally { scanning.value = false }
}

async function browseDir(): Promise<void> {
  const dir = await window.electronAPI.dialog.openDirectory()
  if (dir) scanDir.value = dir
}

async function importSelected(): Promise<void> {
  if (selected.value.length === 0) return
  importing.value = true
  let count = 0
  try {
    for (const item of selected.value) {
      await createTool({ name: item.name, launch_type: item.launch_type as 'exe' | 'jar' | 'python' | 'powershell' | 'command', target: item.target })
      count++
    }
    const targets = new Set(selected.value.map(s => s.target))
    candidates.value = candidates.value.filter(c => !targets.has(c.target))
    selected.value = []
    ElMessage.success(`已导入 ${count} 个工具`)
  } catch { ElMessage.warning(`部分成功，已导入 ${count} 个`) }
  finally { importing.value = false }
}
</script>

<style scoped>
.scan-view { max-width: 800px; margin: 0 auto; }
.scan-header { margin-bottom: 28px; }
.scan-header h2 {
  font-size: 22px;
  font-weight: 650;
  margin-bottom: 6px;
  letter-spacing: -0.3px;
  color: var(--text-primary);
}
.scan-header p {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 460;
}
.scan-bar { display: flex; gap: 12px; margin-bottom: 24px; }
.scan-bar .el-input { flex: 1; }
.browse-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--apple-primary);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  padding-right: 4px;
  user-select: none;
}
.browse-link:hover { opacity: 0.8; }
.scan-progress { text-align: center; padding: 44px; }
.scan-progress p {
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 460;
}
.scan-results {
  background: rgba(255,255,255,0.60);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
  padding: 20px 24px;
  border: 0.5px solid rgba(0,0,0,0.04);
  box-shadow: var(--shadow-sm);
}
.results-top { display: flex; align-items: center; justify-content: space-between; }
.results-title {
  font-weight: 590;
  font-size: 14px;
  color: var(--text-primary);
  letter-spacing: -0.1px;
}
.results-actions { display: flex; gap: 6px; }
.path-cell {
  font-size: 12px;
  color: var(--text-secondary);
  word-break: break-all;
  font-weight: 450;
}
.empty-wrap { display: flex; justify-content: center; padding-top: 60px; }
</style>
