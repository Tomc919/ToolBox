<template>
  <el-dialog
    :model-value="visible"
    :title="tool ? '编辑工具' : '添加工具'"
    width="460px"
    append-to-body
    @update:model-value="$emit('update:visible', $event)"
    @close="resetForm"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="名称">
        <el-input v-model="form.name" placeholder="输入工具名称" />
      </el-form-item>

      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="启动类型">
            <el-select v-model="form.launch_type" style="width:100%">
              <el-option label="EXE 程序" value="exe" />
              <el-option label="Java Jar" value="jar" />
              <el-option label="Python 脚本" value="python" />
              <el-option label="PowerShell" value="powershell" />
              <el-option label="CMD / BAT" value="command" />
              <el-option label="网址链接" value="url" />
              <el-option label="SSH 连接" value="ssh" />
              <el-option label="自定义命令" value="custom" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属分类">
            <el-tree-select
              v-model="form.category_id"
              :data="categoryTreeForSelect"
              :props="{ children: 'children', label: 'label', value: 'id' }"
              placeholder="无（未分类）"
              clearable
              check-strictly
              style="width:100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <template #label>
          <span>目标</span>
          <el-tooltip v-if="isScriptType" :content="scriptHint" placement="top" effect="dark">
            <el-icon :size="13" class="hint-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-input v-model="form.target" :placeholder="targetPlaceholder">
          <template #append v-if="isFileType">
            <el-button type="primary" @click="browseFile">浏览</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="form.launch_type === 'custom'" label="启动命令">
        <el-input v-model="form.launch_command" placeholder="如: node、ruby、wine、或解释器路径" />
      </el-form-item>

      <el-row :gutter="12" v-if="!isUrlType && !isSshType">
        <el-col :span="12">
          <el-form-item label="运行参数">
            <el-input v-model="form.args" placeholder="如: -Xmx4096m" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="isFileType">
          <el-form-item label="工作目录">
            <el-input v-model="form.working_dir" placeholder="留空=目标所在目录" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="可选的工具描述" />
      </el-form-item>

      <el-form-item label="图标">
        <div class="icon-field">
          <el-input v-model="form.icon_path" placeholder="留空=自动识别，或选择自定义图标文件" clearable />
          <el-button class="icon-browse-btn" @click="browseIcon">选择图标</el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { useToolStore } from '@/stores/tool'
import { useCategoryStore } from '@/stores/category'
import type { Tool, LaunchType } from '@shared/types'

const props = defineProps<{ visible: boolean; tool?: Tool | null }>()
const emit = defineEmits<{ 'update:visible': [value: boolean]; saved: [] }>()

const toolStore = useToolStore()
const categoryStore = useCategoryStore()

const form = ref({
  name: '', launch_type: 'exe' as LaunchType,
  target: '', args: '', working_dir: '', launch_command: '', description: '',
  icon_path: '', category_id: null as number | null
})

const isFileType = computed(() => ['exe','jar','python','powershell','command','custom'].includes(form.value.launch_type))
const isUrlType = computed(() => form.value.launch_type === 'url')
const isSshType = computed(() => form.value.launch_type === 'ssh')
const isScriptType = computed(() => ['jar','python','powershell','command'].includes(form.value.launch_type))

const scriptHint = computed(() => {
  const map: Record<string, string> = {
    jar: 'java -jar <文件> [参数]',
    python: '依次尝试 python3 → python → py <文件> [参数]',
    powershell: '依次尝试 pwsh → powershell -File <文件> [参数]',
    command: '根据扩展名自动匹配：\n.bat/.cmd → cmd /c\n.vbs/.wsf → wscript\n.reg → regedit\n.msc → mmc\n.sh → bash\n.ahk → AutoHotkey'
  }
  return map[form.value.launch_type] || ''
})

const targetPlaceholder = computed(() => {
  const map: Record<string, string> = {
    exe: '选择 .exe 文件', jar: '选择 .jar 文件', python: '选择 .py 脚本',
    powershell: '选择 .ps1 脚本', command: '选择 .bat/.cmd 文件',
    custom: '选择要运行的文件',
    url: 'https://...', ssh: 'user@host'
  }
  return map[form.value.launch_type] || ''
})

const categoryTreeForSelect = computed(() => {
  const buildTree = (parentId: number | null): unknown[] => {
    return categoryStore.categories
      .filter(c => c.parent_id === parentId)
      .map(c => ({ id: c.id, label: c.name, children: buildTree(c.id) }))
  }
  return buildTree(null)
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.tool) {
      form.value = {
        name: props.tool.name, launch_type: props.tool.launch_type,
        target: props.tool.target, args: props.tool.args,
        working_dir: props.tool.working_dir, launch_command: props.tool.launch_command || '', description: props.tool.description,
        icon_path: props.tool.icon_path || '', category_id: props.tool.category_id
      }
    } else {
      resetForm()
    }
  }
})

function resetForm(): void {
  form.value = { name: '', launch_type: 'exe', target: '', args: '', working_dir: '', launch_command: '', description: '', icon_path: '', category_id: null }
}

const extFilters: Record<string, { name: string; extensions: string[] }> = {
  exe: { name: '可执行文件', extensions: ['exe'] },
  jar: { name: 'JAR 文件', extensions: ['jar'] },
  python: { name: 'Python 脚本', extensions: ['py'] },
  powershell: { name: 'PowerShell 脚本', extensions: ['ps1'] },
  command: { name: '脚本/批处理', extensions: ['bat', 'cmd', 'vbs', 'wsf'] },
  custom: { name: '所有文件', extensions: ['*'] }
}

async function browseFile(): Promise<void> {
  const filter = extFilters[form.value.launch_type]
  const filePath = await window.electronAPI.dialog.openFile(filter ? [filter] : undefined)
  if (filePath) {
    form.value.target = filePath
    if (!form.value.name) {
      const parts = filePath.split('\\')
      const fileName = parts[parts.length - 1]
      const dotIdx = fileName.lastIndexOf('.')
      form.value.name = dotIdx > 0 ? fileName.substring(0, dotIdx) : fileName
    }
  }
}

async function browseIcon(): Promise<void> {
  const filePath = await window.electronAPI.dialog.openFile([
    { name: '图标文件', extensions: ['png', 'ico', 'jpg', 'jpeg', 'svg'] }
  ])
  if (filePath) {
    form.value.icon_path = filePath
  }
}

async function handleSave(): Promise<void> {
  if (!form.value.name.trim() || !form.value.target.trim()) return
  if (props.tool) {
    await toolStore.updateTool(props.tool.id, { ...form.value })
  } else {
    await toolStore.createTool({ ...form.value })
  }
  emit('saved')
  emit('update:visible', false)
}
</script>
<style scoped>
/* --- Dialog body --- */
:deep(.el-dialog__body) {
  padding: 16px 20px;
}

/* --- Hint icon next to label --- */
.hint-icon {
  margin-left: 4px;
  color: var(--text-tertiary);
  cursor: help;
  vertical-align: -2px;
}
.hint-icon:hover { color: var(--apple-primary); }

/* --- Form labels --- */
:deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 590;
  font-size: 12px;
  padding-bottom: 2px;
}
:deep(.el-form-item) {
  margin-bottom: 10px;
}

/* --- All input/select/text areas --- */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background: #fff !important;
  border-color: rgba(0,0,0,0.10) !important;
  border-radius: 8px !important;
}
:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  border-color: rgba(0,0,0,0.18) !important;
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--apple-primary) !important;
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08) !important;
}

/* --- Input text --- */
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: var(--text-primary);
  font-size: 12.5px;
  font-weight: 450;
}
:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: #bfbfc5;
  font-weight: 400;
}
:deep(.el-input__inner) {
  height: 30px;
  line-height: 30px;
}

/* --- Select --- */
:deep(.el-select .el-input__wrapper) {
  background: #fff !important;
}
:deep(.el-select .el-input__inner) {
  color: var(--text-primary);
}

/* --- Tree select --- */
:deep(.el-tree-select .el-input__wrapper) {
  background: #fff !important;
}
:deep(.el-tree-select .el-input__inner) {
  color: var(--text-primary);
}

/* --- Textarea --- */
:deep(.el-textarea__inner) {
  padding: 6px 10px;
  line-height: 1.5;
  resize: none;
}

/* --- Input append "浏览" --- */
:deep(.el-input-group__append) {
  background: rgba(30,58,95,0.04);
  border-color: rgba(0,0,0,0.10);
  border-radius: 0 8px 8px 0;
}
:deep(.el-input-group__append .el-button) {
  color: var(--apple-primary);
  font-weight: 550;
}

/* --- Select dropdown --- */
:deep(.el-select-dropdown__item) {
  color: var(--text-primary);
  font-size: 13px;
}
:deep(.el-select-dropdown__item.is-hovering) {
  background: rgba(0,0,0,0.04);
}
:deep(.el-select-dropdown__item.is-selected) {
  color: var(--apple-primary);
  font-weight: 570;
}

/* --- Icon field --- */
.icon-field {
  display: flex;
  gap: 8px;
  width: 100%;
}
.icon-field .el-input {
  flex: 1;
}
.icon-browse-btn {
  flex-shrink: 0;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: rgba(0,0,0,0.05);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0 12px;
  transition: all 0.15s ease;
}
.icon-browse-btn:hover {
  background: rgba(0,0,0,0.10);
  color: var(--text-primary);
}

/* --- Footer --- */
:deep(.el-dialog__footer) {
  padding-top: 4px;
}
:deep(.el-dialog__header) {
  padding: 16px 20px 10px;
}
</style>
