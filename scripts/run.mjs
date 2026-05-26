import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Strip ELECTRON_RUN_AS_NODE which breaks Electron on Windows
// (even empty string causes Electron to run as plain Node.js)
delete process.env.ELECTRON_RUN_AS_NODE

const cmd = process.argv[2] || 'dev'

const child = spawn('npx', ['electron-vite', cmd], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
  cwd: path.resolve(__dirname, '..')
})

child.on('close', (code) => process.exit(code))
