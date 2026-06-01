import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/ipc'
import type { Category, CategoryInput, CategoryUpdate } from '@shared/types'

interface TreeNode {
  id: number
  label: string
  children?: TreeNode[]
}

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const selectedId = ref<number | null>(null)
  const loading = ref(false)

  const tree = computed<TreeNode[]>(() => {
    const map = new Map<number, TreeNode>()
    const roots: TreeNode[] = []

    for (const cat of categories.value) {
      map.set(cat.id, { id: cat.id, label: cat.name, children: [] })
    }

    for (const cat of categories.value) {
      const node = map.get(cat.id)!
      if (cat.parent_id !== null && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children!.push(node)
      } else {
        roots.push(node)
      }
    }

    // Ensure "未分类" (id=1) is always first among roots
    roots.sort((a, b) => {
      if (a.id === 1) return -1
      if (b.id === 1) return 1
      return 0 // preserve DB order for other root nodes
    })

    // Clean up empty children arrays
    const cleanTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(n => ({
        ...n,
        children: n.children && n.children.length > 0 ? cleanTree(n.children) : undefined
      }))
    }

    return cleanTree(roots)
  })

  const currentCategory = computed(() => {
    if (selectedId.value === null) return null
    return categories.value.find(c => c.id === selectedId.value) ?? null
  })

  async function loadCategories(): Promise<void> {
    loading.value = true
    try {
      categories.value = await api.fetchCategories()
    } finally {
      loading.value = false
    }
  }

  function isParent(id: number): boolean {
    return categories.value.some(c => c.parent_id === id)
  }

  function getCategoryNameById(id: number): string {
    return categories.value.find(c => c.id === id)?.name ?? ''
  }

  function selectCategory(id: number | null): void {
    selectedId.value = id
  }

  async function addCategory(data: CategoryInput): Promise<void> {
    await api.createCategory(data)
    await loadCategories()
  }

  async function editCategory(id: number, data: CategoryUpdate): Promise<void> {
    await api.updateCategory(id, data)
    await loadCategories()
  }

  async function removeCategory(id: number): Promise<void> {
    await api.deleteCategory(id)
    if (selectedId.value === id) {
      selectedId.value = null
    }
    await loadCategories()
  }

  async function moveCategoryPos(id: number, parentId: number | null, sort: number): Promise<void> {
    await api.moveCategory(id, parentId, sort)
    await loadCategories()
  }

  return {
    categories,
    selectedId,
    loading,
    tree,
    currentCategory,
    loadCategories,
    isParent,
    getCategoryNameById,
    selectCategory,
    addCategory,
    editCategory,
    removeCategory,
    moveCategoryPos
  }
})
