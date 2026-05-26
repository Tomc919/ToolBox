import { spawn } from 'node:child_process'
import { shell } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import type { Tool, LaunchResult } from '@shared/types'

function parseArgs(raw: string): string[] {
  if (!raw || !raw.trim()) return []
  const args: string[] = []
  let current = ''
  let inQuote = false
  let quoteChar = ''

  for (const ch of raw) {
    if (inQuote) {
      if (ch === quoteChar) {
        inQuote = false
        quoteChar = ''
      } else {
        current += ch
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = true
      quoteChar = ch
    } else if (ch === ' ') {
      if (current) {
        args.push(current)
        current = ''
      }
    } else {
      current += ch
    }
  }
  if (current) args.push(current)
  return args
}

function safeSpawn(cmd: string, args: string[], opts: import('child_process').SpawnOptions): Promise<LaunchResult> {
  return new Promise((resolve) => {
    let child: import('child_process').ChildProcess
    try {
      child = spawn(cmd, args, opts)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      resolve({ success: false, error: message })
      return
    }
    child.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })
    // 'spawn' fires once the OS has successfully created the process
    child.on('spawn', () => {
      child.removeAllListeners()
      child.unref()
      resolve({ success: true, pid: child.pid! })
    })
    // Safety timeout: rare edge case where spawn neither errors nor emits 'spawn'
    setTimeout(() => {
      if (child.pid) {
        child.removeAllListeners()
        child.unref()
        resolve({ success: true, pid: child.pid })
      } else {
        resolve({ success: false, error: '进程启动超时' })
      }
    }, 5000)
  })
}

function launchExe(tool: Tool): Promise<LaunchResult> {
  const target = tool.target
  if (!fs.existsSync(target)) {
    return Promise.resolve({ success: false, error: `文件不存在: ${target}` })
  }
  const ext = path.extname(target).toLowerCase()
  // MSI installers need msiexec
  if (ext === '.msi') {
    return safeSpawn('msiexec', ['/i', target, ...parseArgs(tool.args)], {
      cwd: tool.working_dir || path.dirname(target),
      detached: true,
      stdio: 'ignore',
      shell: false
    })
  }
  // Use shell:true for better Windows compatibility (handles EACCES / UAC)
  return safeSpawn(target, parseArgs(tool.args), {
    cwd: tool.working_dir || path.dirname(target),
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
    shell: true
  })
}

function launchJar(tool: Tool): Promise<LaunchResult> {
  if (!fs.existsSync(tool.target)) {
    return Promise.resolve({ success: false, error: `文件不存在: ${tool.target}` })
  }
  return safeSpawn('java', ['-jar', tool.target, ...parseArgs(tool.args)], {
    cwd: tool.working_dir || path.dirname(tool.target),
    detached: true,
    stdio: 'ignore',
    shell: true
  })
}

async function launchPython(tool: Tool): Promise<LaunchResult> {
  if (!fs.existsSync(tool.target)) {
    return { success: false, error: `文件不存在: ${tool.target}` }
  }
  const args = [tool.target, ...parseArgs(tool.args)]
  const opts = {
    cwd: tool.working_dir || path.dirname(tool.target),
    detached: true,
    stdio: 'ignore' as const,
    shell: true
  }
  // Try python3 → python → py (Windows launcher)
  for (const cmd of ['python3', 'python', 'py']) {
    const r = await safeSpawn(cmd, args, opts)
    if (r.success) return r
    // Only retry if the command wasn't found
    if (r.error && !r.error.includes('ENOENT') && !r.error.includes('EACCES')) return r
  }
  return { success: false, error: '未找到 Python 运行时 (python3 / python / py)' }
}

async function launchPowerShell(tool: Tool): Promise<LaunchResult> {
  if (!fs.existsSync(tool.target)) {
    return { success: false, error: `文件不存在: ${tool.target}` }
  }
  const psArgs = ['-ExecutionPolicy', 'Bypass', '-File', tool.target, ...parseArgs(tool.args)]
  const opts = {
    cwd: tool.working_dir || path.dirname(tool.target),
    detached: true,
    stdio: 'ignore' as const,
    shell: true
  }
  // Try pwsh (PS 7+) first, then powershell (Windows built-in)
  for (const cmd of ['pwsh', 'powershell']) {
    const r = await safeSpawn(cmd, psArgs, opts)
    if (r.success) return r
    if (r.error && !r.error.includes('ENOENT')) return r
  }
  return { success: false, error: '未找到 PowerShell (pwsh / powershell)' }
}

function launchCommand(tool: Tool): Promise<LaunchResult> {
  if (!fs.existsSync(tool.target)) {
    return Promise.resolve({ success: false, error: `文件不存在: ${tool.target}` })
  }
  const ext = path.extname(tool.target).toLowerCase()
  const cwd = tool.working_dir || path.dirname(tool.target)
  const userArgs = parseArgs(tool.args)

  // Map file extension to the correct launcher
  const extLauncher: Record<string, { cmd: string; buildArgs: () => string[] }> = {
    '.bat':  { cmd: 'cmd', buildArgs: () => ['/c', tool.target, ...userArgs] },
    '.cmd':  { cmd: 'cmd', buildArgs: () => ['/c', tool.target, ...userArgs] },
    '.vbs':  { cmd: 'wscript', buildArgs: () => ['//Nologo', tool.target, ...userArgs] },
    '.wsf':  { cmd: 'wscript', buildArgs: () => ['//Nologo', tool.target, ...userArgs] },
    '.reg':  { cmd: 'regedit', buildArgs: () => ['/s', tool.target] },
    '.msc':  { cmd: 'mmc', buildArgs: () => [tool.target] },
    '.sh':   { cmd: 'bash', buildArgs: () => [tool.target, ...userArgs] },
    '.ahk':  { cmd: 'AutoHotkey.exe', buildArgs: () => [tool.target, ...userArgs] },
    '.hta':  { cmd: 'mshta', buildArgs: () => [tool.target] },
  }

  const launcher = extLauncher[ext]
  if (launcher) {
    return safeSpawn(launcher.cmd, launcher.buildArgs(), {
      cwd,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      shell: false
    })
  }

  // Unknown extension: fall back to cmd /c
  return safeSpawn('cmd', ['/c', tool.target, ...userArgs], {
    cwd,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    shell: false
  })
}

function launchUrl(tool: Tool): Promise<LaunchResult> {
  return shell.openExternal(tool.target)
    .then(() => ({ success: true }))
    .catch((err: Error) => ({ success: false, error: err.message }))
}

function launchSsh(tool: Tool): Promise<LaunchResult> {
  const host = tool.target.replace(/^ssh:\/\//, '')
  return safeSpawn('ssh', [host, ...parseArgs(tool.args)], {
    detached: true,
    stdio: 'inherit',
    shell: true
  })
}

function launchCustom(tool: Tool): Promise<LaunchResult> {
  if (!tool.launch_command) {
    return Promise.resolve({ success: false, error: '未填写启动命令' })
  }
  if (!fs.existsSync(tool.target)) {
    return Promise.resolve({ success: false, error: `文件不存在: ${tool.target}` })
  }
  return safeSpawn(tool.launch_command, [tool.target, ...parseArgs(tool.args)], {
    cwd: tool.working_dir || path.dirname(tool.target),
    detached: true,
    stdio: 'ignore',
    shell: true
  })
}

const LAUNCHERS: Record<string, (tool: Tool) => Promise<LaunchResult>> = {
  exe: launchExe,
  jar: launchJar,
  python: launchPython,
  powershell: launchPowerShell,
  command: launchCommand,
  custom: launchCustom,
  url: launchUrl,
  ssh: launchSsh
}

export async function launch(tool: Tool): Promise<LaunchResult> {
  const fn = LAUNCHERS[tool.launch_type]
  if (!fn) {
    return { success: false, error: `不支持的启动类型: ${tool.launch_type}` }
  }
  return fn(tool)
}
