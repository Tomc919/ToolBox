<template>
  <div class="doc-view">
    <div class="doc-header">
      <div class="traffic-lights">
        <button class="tl-btn tl-close" @click="win.close()" title="关闭" />
        <button class="tl-btn tl-min" @click="win.minimize()" title="最小化" />
        <button class="tl-btn tl-max" @click="win.maximize()" title="最大化" />
      </div>
      <span class="doc-name">{{ name }}</span>
      <span class="doc-path">{{ filePath }}</span>
    </div>
    <div class="doc-body">
      <div v-if="loading" class="doc-loading">加载中...</div>
      <div v-else-if="error" class="doc-error">{{ error }}</div>
      <pre v-else class="doc-content"><code>{{ content }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const win = window.electronAPI.window
const filePath = ref('')
const name = ref('')
const content = ref('')
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const p = route.query.path as string
  const n = route.query.name as string
  if (!p) {
    error.value = '未指定文件路径'
    loading.value = false
    return
  }
  filePath.value = p
  name.value = n || p.split('\\').pop() || p
  try {
    content.value = await window.electronAPI.file.readText(p)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '读取文件失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.doc-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--apple-bg);
}
.doc-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  flex-shrink: 0;
  background: rgba(242,242,247,0.94);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  -webkit-app-region: drag;
}
/* macOS-style traffic lights */
.traffic-lights {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}
.tl-btn {
  width: 12px; height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: filter 0.15s ease;
  padding: 0;
}
.tl-btn:hover { filter: brightness(0.85); }
.tl-btn:active { filter: brightness(0.70); }
.tl-close { background: #ff5f57; }
.tl-min   { background: #febc2e; }
.tl-max   { background: #28c840; }

.doc-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.doc-path {
  font-size: 11px;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: auto;
}
.doc-body {
  flex: 1;
  overflow-y: auto;
}
.doc-loading,
.doc-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  font-size: 14px;
}
.doc-error {
  color: #e74c3c;
}
.doc-content {
  padding: 28px 32px;
  margin: 0;
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 14px;
  line-height: 1.75;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 4;
}
</style>
