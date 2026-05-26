import { getDatabase } from './connection'
import type { Tool, ToolInput, ToolUpdate } from '@shared/types'

export function getByCategory(categoryId: number | null): Tool[] {
  const db = getDatabase()
  if (categoryId === null) {
    return db.prepare(
      'SELECT * FROM tool ORDER BY favorite DESC, name'
    ).all() as Tool[]
  }
  return db.prepare(
    'SELECT * FROM tool WHERE category_id = ? ORDER BY favorite DESC, name'
  ).all(categoryId) as Tool[]
}

export interface SearchScope {
  type: 'all' | 'category' | 'favorites' | 'recent'
  categoryId?: number | null
}

export function search(query: string, scope?: SearchScope): Tool[] {
  const db = getDatabase()
  const pattern = `%${query}%`
  const conditions: string[] = ['(name LIKE ? OR description LIKE ?)']
  const params: unknown[] = [pattern, pattern]

  if (scope) {
    if (scope.type === 'category') {
      conditions.push('category_id = ?')
      params.push(scope.categoryId ?? null)
    } else if (scope.type === 'favorites') {
      conditions.push('favorite = 1')
    } else if (scope.type === 'recent') {
      conditions.push('last_launch_time IS NOT NULL')
    }
  }

  const orderBy = scope?.type === 'recent'
    ? 'last_launch_time DESC'
    : 'favorite DESC, name'

  return db.prepare(
    `SELECT * FROM tool WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`
  ).all(...params) as Tool[]
}

export function getById(id: number): Tool | undefined {
  const db = getDatabase()
  return db.prepare('SELECT * FROM tool WHERE id = ?').get(id) as Tool | undefined
}

export function getRecent(limit: number = 10): Tool[] {
  const db = getDatabase()
  return db.prepare(
    'SELECT * FROM tool WHERE last_launch_time IS NOT NULL ORDER BY last_launch_time DESC LIMIT ?'
  ).all(limit) as Tool[]
}

export function getFavorites(): Tool[] {
  const db = getDatabase()
  return db.prepare(
    'SELECT * FROM tool WHERE favorite = 1 ORDER BY name'
  ).all() as Tool[]
}

export function create(data: ToolInput): Tool {
  const db = getDatabase()
  const {
    name, category_id = null, launch_type, target,
    args = '', working_dir = '', launch_command = '', icon_path = '', description = ''
  } = data
  const result = db.prepare(
    `INSERT INTO tool (name, category_id, launch_type, target, args, working_dir, launch_command, icon_path, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(name, category_id, launch_type, target, args, working_dir, launch_command, icon_path, description)
  return getById(result.lastInsertRowid as number)!
}

export function update(id: number, data: ToolUpdate): Tool | undefined {
  const db = getDatabase()
  const existing = getById(id)
  if (!existing) return undefined

  const fields: string[] = []
  const values: unknown[] = []

  const keys: (keyof ToolUpdate)[] = ['name', 'category_id', 'launch_type', 'target', 'args', 'working_dir', 'launch_command', 'icon_path', 'description']
  for (const key of keys) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`)
      values.push(data[key])
    }
  }

  if (fields.length === 0) return existing

  fields.push("updated_at = datetime('now','localtime')")
  values.push(id)

  db.prepare(`UPDATE tool SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  return getById(id)
}

export function remove(id: number): boolean {
  const db = getDatabase()
  const result = db.prepare('DELETE FROM tool WHERE id = ?').run(id)
  return result.changes > 0
}

export function toggleFavorite(id: number): 0 | 1 {
  const db = getDatabase()
  const row = db.prepare(
    'UPDATE tool SET favorite = CASE WHEN favorite = 1 THEN 0 ELSE 1 END WHERE id = ? RETURNING favorite'
  ).get(id) as { favorite: 0 | 1 } | undefined
  return row?.favorite ?? 0
}

export function recordLaunch(id: number): void {
  const db = getDatabase()
  db.prepare(
    "UPDATE tool SET last_launch_time = datetime('now','localtime') WHERE id = ?"
  ).run(id)
}
