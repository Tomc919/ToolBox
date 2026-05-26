<template>
  <el-dialog
    :model-value="visible"
    :title="category ? '编辑分类' : '添加分类'"
    width="360px"
    append-to-body
    @update:model-value="$emit('update:visible', $event)"
    @close="resetForm"
  >
    <el-form :model="form" label-position="top" ref="formRef">
      <el-form-item label="名称" required>
        <el-input v-model="form.name" placeholder="输入分类名称" />
      </el-form-item>
      <el-form-item label="父分类">
        <el-select v-model="form.parent_id" placeholder="无（根分类）" clearable style="width: 100%">
          <el-option
            v-for="c in availableParents"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
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
import { useCategoryStore } from '@/stores/category'
import type { Category } from '@shared/types'

const props = defineProps<{
  visible: boolean
  category?: Category | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const categoryStore = useCategoryStore()
const formRef = ref()
const form = ref({
  name: '',
  parent_id: null as number | null
})

const availableParents = computed(() => {
  if (!props.category) {
    return categoryStore.categories
  }
  // Exclude self and descendants to prevent circular reference
  return categoryStore.categories.filter(c => c.id !== props.category!.id)
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.category) {
      form.value = {
        name: props.category.name,
        parent_id: props.category.parent_id
      }
    } else {
      form.value = { name: '', parent_id: null }
    }
  }
})

function resetForm(): void {
  form.value = { name: '', parent_id: null }
}

async function handleSave(): Promise<void> {
  if (!form.value.name.trim()) return
  if (props.category) {
    await categoryStore.editCategory(props.category.id, {
      name: form.value.name,
      parent_id: form.value.parent_id
    })
  } else {
    await categoryStore.addCategory({
      name: form.value.name,
      parent_id: form.value.parent_id
    })
  }
  emit('saved')
  emit('update:visible', false)
}
</script>
<style scoped>
/* --- Form labels --- */
:deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 590;
  font-size: 12.5px;
  letter-spacing: -0.1px;
  padding-bottom: 4px;
}
:deep(.el-form-item) {
  margin-bottom: 14px;
}

/* --- Input & select: crisp white bg, clear text --- */
:deep(.el-input__wrapper) {
  background: #fff !important;
  border-color: rgba(0,0,0,0.10) !important;
  border-radius: 10px !important;
}
:deep(.el-input__wrapper:hover) {
  border-color: rgba(0,0,0,0.18) !important;
}
:deep(.el-input__wrapper.is-focus) {
  border-color: var(--apple-primary) !important;
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08) !important;
}

/* --- Input text --- */
:deep(.el-input__inner) {
  color: var(--text-primary);
  font-size: 13.5px;
  font-weight: 450;
}
:deep(.el-input__inner::placeholder) {
  color: #bfbfc5;
  font-weight: 400;
}

/* --- Select --- */
:deep(.el-select .el-input__inner) {
  color: var(--text-primary);
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
</style>
