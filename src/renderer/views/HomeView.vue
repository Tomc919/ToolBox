<template>
  <div class="home-view">
    <ToolGrid
      :tools="toolStore.tools"
      :loading="toolStore.loading"
      @reload="reloadTools"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import ToolGrid from '@/components/tool/ToolGrid.vue'
import { useToolStore } from '@/stores/tool'
import { useCategoryStore } from '@/stores/category'

const toolStore = useToolStore()
const categoryStore = useCategoryStore()

function reloadTools(): void {
  if (toolStore.isSearching) {
    toolStore.search(toolStore.searchQuery, toolStore.searchScope)
  } else if (toolStore.viewMode === 'favorites') {
    toolStore.loadFavorites()
  } else if (toolStore.viewMode === 'recent') {
    toolStore.loadRecent()
  } else {
    toolStore.loadByCategory(categoryStore.selectedId)
  }
}

watch(() => categoryStore.selectedId, (newId) => {
  toolStore.loadByCategory(newId)
})

onMounted(() => {
  toolStore.loadByCategory(null)
})
</script>
