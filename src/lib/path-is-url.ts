export function pathIsUrl(path: string) {
  try {
    new URL(path)
    return true
  } catch {
    return false
  }
}
