<template>
  <div class="settings-view">
    <div class="settings-card">
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">开机自启动</span>
          <span class="setting-desc">系统启动时自动运行并最小化到托盘</span>
        </div>
        <el-switch v-model="autoStart" @change="onAutoStartChange" />
      </div>
    </div>

    <div class="settings-card">
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">全局快捷键</span>
          <span class="setting-desc">从托盘呼出或隐藏窗口</span>
        </div>
        <div class="shortcut-box" @click="startRecord">
          <template v-if="recording">
            <span class="shortcut-keys recording">按下组合键...</span>
          </template>
          <template v-else>
            <span class="shortcut-keys">{{ displayShortcut }}</span>
            <button class="shortcut-edit-btn">修改</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getSettings, updateSettings } from '@/api/ipc'

const autoStart = ref(false)
const shortcut = ref('Alt+Space')
const recording = ref(false)

const displayShortcut = computed(() => {
  return shortcut.value.replace(/\+/g, ' + ')
})

async function onAutoStartChange(val: boolean): Promise<void> {
  await updateSettings({ autoStart: val })
}

let cleanupKey: (() => void) | null = null

function startRecord(): void {
  if (recording.value) {
    stopRecord()
    return
  }
  recording.value = true

  const onKey = (e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') return
    if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
      return // must have at least one modifier
    }
    const parts: string[] = []
    if (e.ctrlKey) parts.push('Ctrl')
    if (e.altKey) parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')
    if (e.metaKey) parts.push('Super')
    parts.push(keyToElectronAccelerator(e.key, e.code))
    shortcut.value = parts.join('+')
    stopRecord()
    updateSettings({ shortcut: shortcut.value })
  }

  const onClick = (e: MouseEvent) => {
    // Don't fire on the initial click that started recording
    stopRecord()
  }

  document.addEventListener('keydown', onKey)
  // Delay click listener to avoid catching the initial click
  setTimeout(() => document.addEventListener('click', onClick, { once: true }), 0)
  cleanupKey = () => {
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('click', onClick)
  }
}

function stopRecord(): void {
  recording.value = false
  if (cleanupKey) {
    cleanupKey()
    cleanupKey = null
  }
}

function keyToElectronAccelerator(key: string, code: string): string {
  // Map DOM key/code to Electron accelerator names
  const map: Record<string, string> = {
    ' ': 'Space', 'ArrowUp': 'Up', 'ArrowDown': 'Down',
    'ArrowLeft': 'Left', 'ArrowRight': 'Right',
    'Escape': 'Esc', 'Delete': 'Delete', 'Insert': 'Insert',
    'Home': 'Home', 'End': 'End', 'PageUp': 'PageUp', 'PageDown': 'PageDown',
    'Tab': 'Tab', 'CapsLock': 'CapsLock', 'Backspace': 'Backspace',
    'Enter': 'Enter', 'PrintScreen': 'PrintScreen',
  }
  if (map[key]) return map[key]
  // Function keys
  if (code.startsWith('F') && code.length <= 3) return code
  // Digits from Numpad
  if (code.startsWith('Digit')) return code.replace('Digit', '')
  if (code.startsWith('Numpad')) return 'num' + code.replace('Numpad', '')
  // Letters
  if (key.length === 1) return key.toUpperCase()
  return key
}

onMounted(async () => {
  const settings = await getSettings()
  autoStart.value = settings.autoStart
  shortcut.value = settings.shortcut
})
</script>

<style scoped>
.settings-view {
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.settings-card {
  background: rgba(255,255,255,0.72);
  border-radius: 14px;
  border: 0.5px solid rgba(0,0,0,0.04);
  padding: 18px 22px;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s ease;
}
.settings-card:hover {
  background: rgba(255,255,255,0.86);
  box-shadow: var(--shadow-sm);
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.setting-label {
  font-size: 14px;
  font-weight: 590;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}
.setting-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 450;
}
.shortcut-box {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.shortcut-keys {
  font-size: 13px;
  font-weight: 520;
  color: var(--text-secondary);
  background: rgba(0,0,0,0.04);
  padding: 5px 12px;
  border-radius: 7px;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}
.shortcut-keys.recording {
  color: var(--apple-primary);
  background: rgba(30,58,95,0.08);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.shortcut-edit-btn {
  border: none;
  background: transparent;
  color: var(--apple-primary);
  font-size: 12.5px;
  font-weight: 520;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 5px;
  transition: all 0.15s ease;
}
.shortcut-edit-btn:hover {
  background: rgba(30,58,95,0.06);
}
</style>
