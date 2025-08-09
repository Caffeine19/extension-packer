export interface Result<T> {
  msg?: string
  success: boolean
  data?: T
}
