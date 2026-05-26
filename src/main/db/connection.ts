import Database from 'better-sqlite3'
import path from 'node:path'
import { ensureDataDir } from '../utils'
import { runMigrations } from './schema'

let db: Database.Database | null = null

export function openDatabase(): Database.Database {
  if (db) return db

  const dataDir = ensureDataDir()
  const dbPath = path.join(dataDir, 'toolbox.db')

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  runMigrations(db)
  return db
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call openDatabase() first.')
  }
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
