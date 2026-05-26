import { getDatabase } from './connection'
import type { Category, CategoryInput, CategoryUpdate } from '@shared/types'

export function getAll(): Category[] {
  const db = getDatabase()
  return db.prepare(
    'SELECT * FROM category ORDER BY CASE WHEN id = 1 THEN -1 ELSE 0 END, sort, id'
  ).all() as Category[]
}

export function getById(id: number): Category | undefined {
  const db = getDatabase()
  return db.prepare('SELECT * FROM category WHERE id = ?').get(id) as Category | undefined
}

export function create(data: CategoryInput): Category {
  const db = getDatabase()
  const { name, parent_id = null, sort = 0 } = data
  const result = db.prepare(
    'INSERT INTO category (name, parent_id, sort) VALUES (?, ?, ?)'
  ).run(name, parent_id, sort)
  return getById(result.lastInsertRowid as number)!
}

export function update(id: number, data: CategoryUpdate): Category | undefined {
  const db = getDatabase()
  const existing = getById(id)
  if (!existing) return undefined

  const name = data.name ?? existing.name
  const parent_id = data.parent_id !== undefined ? data.parent_id : existing.parent_id
  const sort = data.sort !== undefined ? data.sort : existing.sort

  db.prepare(
    'UPDATE category SET name = ?, parent_id = ?, sort = ? WHERE id = ?'
  ).run(name, parent_id, sort, id)
  return getById(id)
}

export function remove(id: number): boolean {
  const db = getDatabase()
  const result = db.prepare('DELETE FROM category WHERE id = ?').run(id)
  return result.changes > 0
}

export function move(id: number, parentId: number | null, sort: number): boolean {
  const db = getDatabase()
  const result = db.prepare(
    'UPDATE category SET parent_id = ?, sort = ? WHERE id = ?'
  ).run(parentId, sort, id)
  return result.changes > 0
}
