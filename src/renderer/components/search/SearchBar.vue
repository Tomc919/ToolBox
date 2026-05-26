<template>
  <div class="search-wrap">
    <el-icon class="search-icon" :size="16"><Search /></el-icon>
    <input
      v-model="query"
      class="search-input"
      placeholder="搜索工具名称或描述..."
      @input="onInput"
      @keyup.enter="onEnter"
    />
    <button v-if="query" class="search-clear" @click="onClear">
      <el-icon :size="14"><Close /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Close } from '@element-plus/icons-vue'
import { useToolStore } from '@/stores/tool'
import { useCategoryStore } from '@/stores/category'

const toolStore = useToolStore()
const categoryStore = useCategoryStore()

const query = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

const searchScope = computed(() => {
  const mode = toolStore.viewMode
  if (mode === 'category') {
    return { type: 'category' as const, categoryId: categoryStore.selectedId }
  }
  if (mode === 'favorites') return { type: 'favorites' as const }
  if (mode === 'recent') return { type: 'recent' as const }
  return undefined // search all
})

function doSearch(): void {
  if (query.value.trim()) {
    toolStore.search(query.value.trim(), searchScope.value)
  } else {
    restoreView()
  }
}

function restoreView(): void {
  const mode = toolStore.viewMode
  if (mode === 'favorites') {
    toolStore.loadFavorites()
  } else if (mode === 'recent') {
    toolStore.loadRecent()
  } else {
    toolStore.loadByCategory(categoryStore.selectedId)
  }
}

function onInput(): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(doSearch, 250)
}

function onClear(): void {
  query.value = ''
  restoreView()
}

function onEnter(): void {
  if (timer) clearTimeout(timer)
  doSearch()
}
</script>

<style scoped>
.search-wrap {
  position: relative;
  max-width: 380px;
  width: 100%;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-quaternary);
  pointer-events: none;
  transition: color 0.18s ease;
}
.search-input:focus ~ .search-icon {
  color: var(--text-tertiary);
}
.search-input {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 36px;
  border: 0.5px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  background: rgba(0,0,0,0.025);
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.search-input::placeholder {
  color: var(--text-quaternary);
}
.search-input:focus {
  border-color: rgba(0,0,0,0.12);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(30,58,95,0.06), 0 2px 8px rgba(0,0,0,0.04);
}
.search-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.06);
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.search-clear:hover {
  background: rgba(0,0,0,0.12);
  color: var(--text-primary);
}
</style>
