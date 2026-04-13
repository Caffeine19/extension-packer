import type { Result } from './result'

export interface AppSettings {
  useInsiders: boolean
}

export const defaultSettings: AppSettings = {
  useInsiders: false
}

export type GetSettings = () => Promise<Result<AppSettings>>

export type UpdateSettings = (settings: Partial<AppSettings>) => Promise<Result<AppSettings>>
