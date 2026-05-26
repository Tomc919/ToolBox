import type Database from 'better-sqlite3'

export interface Migration {
  version: number
  statements: string[]
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        sort INTEGER DEFAULT 0,
        FOREIGN KEY (parent_id) REFERENCES category(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tool (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        launch_type TEXT NOT NULL CHECK(launch_type IN ('exe','jar','python','powershell','command','url','ssh','custom')),
        target TEXT NOT NULL,
        args TEXT DEFAULT '',
        working_dir TEXT DEFAULT '',
        launch_command TEXT DEFAULT '',
        icon_path TEXT DEFAULT '',
        favorite INTEGER DEFAULT 0,
        last_launch_time TEXT,
        description TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_tool_category ON tool(category_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tool_favorite ON tool(favorite)`,
      `CREATE INDEX IF NOT EXISTS idx_tool_name ON tool(name)`,
      `INSERT OR IGNORE INTO category (id, name, parent_id, sort) VALUES (1, '未分类', NULL, 0)`
    ]
  },
  {
    version: 2,
    statements: [
      `CREATE TABLE tool_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        launch_type TEXT NOT NULL CHECK(launch_type IN ('exe','jar','python','powershell','command','url','ssh','custom')),
        target TEXT NOT NULL,
        args TEXT DEFAULT '',
        working_dir TEXT DEFAULT '',
        launch_command TEXT DEFAULT '',
        icon_path TEXT DEFAULT '',
        favorite INTEGER DEFAULT 0,
        last_launch_time TEXT,
        description TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
      )`,
      `INSERT INTO tool_v2 (id, name, category_id, launch_type, target, args, working_dir, icon_path, favorite, last_launch_time, description, created_at, updated_at)
       SELECT id, name, category_id, launch_type, target, args, working_dir, icon_path, favorite, last_launch_time, description, created_at, updated_at FROM tool`,
      `DROP TABLE tool`,
      `ALTER TABLE tool_v2 RENAME TO tool`,
      `CREATE INDEX IF NOT EXISTS idx_tool_category ON tool(category_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tool_favorite ON tool(favorite)`,
      `CREATE INDEX IF NOT EXISTS idx_tool_name ON tool(name)`
    ]
  }
]

export function runMigrations(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now','localtime'))
  )`)

  const applied = db.prepare('SELECT MAX(version) as v FROM _migrations').get() as { v: number | null }
  const currentVersion = applied?.v ?? 0

  const pending = MIGRATIONS.filter(m => m.version > currentVersion).sort((a, b) => a.version - b.version)

  for (const migration of pending) {
    const runAll = db.transaction(() => {
      for (const stmt of migration.statements) {
        db.exec(stmt)
      }
      db.prepare('INSERT INTO _migrations (version) VALUES (?)').run(migration.version)
    })
    runAll()
  }
}
