// Minimal web shim for `@react-native-async-storage/async-storage`.
// Used to satisfy @metamask/sdk (and other packages) during Next.js bundling.

type AsyncStorageValue = string | null

const memory = new Map<string, string>()

function hasLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  } catch {
    return false
  }
}

async function getItem(key: string): Promise<AsyncStorageValue> {
  if (hasLocalStorage()) return window.localStorage.getItem(key)
  return memory.has(key) ? memory.get(key)! : null
}

async function setItem(key: string, value: string): Promise<void> {
  if (hasLocalStorage()) {
    window.localStorage.setItem(key, value)
    return
  }
  memory.set(key, value)
}

async function removeItem(key: string): Promise<void> {
  if (hasLocalStorage()) {
    window.localStorage.removeItem(key)
    return
  }
  memory.delete(key)
}

async function clear(): Promise<void> {
  if (hasLocalStorage()) {
    window.localStorage.clear()
    return
  }
  memory.clear()
}

async function getAllKeys(): Promise<string[]> {
  if (hasLocalStorage()) return Object.keys(window.localStorage)
  return Array.from(memory.keys())
}

const AsyncStorage = {
  getItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
}

export default AsyncStorage
export { AsyncStorage }

