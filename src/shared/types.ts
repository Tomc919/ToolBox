export interface Category {
  id: number
  name: string
  parent_id: number | null
  sort: number
}

export type LaunchType = 'exe' | 'jar' | 'python' | 'powershell' | 'command' | 'url' | 'ssh' | 'txt' | 'custom'

export interface Tool {
  id: number
  name: string
  category_id: number | null
  launch_type: LaunchType
  target: string
  args: string
  working_dir: string
  launch_command: string
  icon_path: string
  favorite: 0 | 1
  last_launch_time: string | null
  description: string
  created_at: string
  updated_at: string
}

export interface ToolInput {
  name: string
  category_id?: number | null
  launch_type: LaunchType
  target: string
  args?: string
  working_dir?: string
  launch_command?: string
  icon_path?: string
  description?: string
}

export interface ToolUpdate {
  name?: string
  category_id?: number | null
  launch_type?: LaunchType
  target?: string
  args?: string
  working_dir?: string
  launch_command?: string
  icon_path?: string
  description?: string
}

export interface CategoryInput {
  name: string
  parent_id?: number | null
  sort?: number
}

export interface CategoryUpdate {
  name?: string
  parent_id?: number | null
  sort?: number
}

export interface ScanCandidate {
  name: string
  target: string
  launch_type: string
  extension: string
}

export interface LaunchResult {
  success: boolean
  pid?: number
  error?: string
}
