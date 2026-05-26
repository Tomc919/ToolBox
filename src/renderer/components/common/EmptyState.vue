<template>
  <div class="empty-state">
    <div class="empty-icon">
      <el-icon :size="40"><FolderOpened /></el-icon>
    </div>
    <p class="empty-text">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { FolderOpened } from '@element-plus/icons-vue'
defineProps<{ message: string }>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}
.empty-icon {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-quaternary);
  margin-bottom: 18px;
}
.empty-text {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 460;
}
</style>
