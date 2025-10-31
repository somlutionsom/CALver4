'use client'

type SafeStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
}

const memoryStore = new Map<string, string>()

function resolveStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const testKey = '__notion_widget_test__'
    window.localStorage.setItem(testKey, 'ok')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch (err) {
    console.warn('LocalStorage unavailable, falling back to memory store:', err)
    return null
  }
}

export function createSafeStorage(namespace = 'notion-widget'): SafeStorage {
  let storage = resolveStorage()

  const buildKey = (key: string) => `${namespace}:${key}`

  return {
    getItem(key: string) {
      const composedKey = buildKey(key)
      if (storage) {
        try {
          return storage.getItem(composedKey)
        } catch (err) {
          console.warn('LocalStorage getItem failed, switching to memory store:', err)
          storage = null
        }
      }
      return memoryStore.get(composedKey) ?? null
    },
    setItem(key: string, value: string) {
      const composedKey = buildKey(key)
      if (storage) {
        try {
          storage.setItem(composedKey, value)
          return
        } catch (err) {
          console.warn('LocalStorage setItem failed, switching to memory store:', err)
          storage = null
        }
      }
      memoryStore.set(composedKey, value)
    },
    removeItem(key: string) {
      const composedKey = buildKey(key)
      if (storage) {
        try {
          storage.removeItem(composedKey)
        } catch (err) {
          console.warn('LocalStorage removeItem failed, switching to memory store:', err)
          storage = null
        }
      }
      memoryStore.delete(composedKey)
    },
    clear() {
      if (storage) {
        try {
          Object.keys(storage)
            .filter((key) => key.startsWith(`${namespace}:`))
            .forEach((key) => storage?.removeItem(key))
        } catch (err) {
          console.warn('LocalStorage clear failed, switching to memory store:', err)
          storage = null
        }
      }
      for (const key of Array.from(memoryStore.keys())) {
        if (key.startsWith(`${namespace}:`)) {
          memoryStore.delete(key)
        }
      }
    },
  }
}

export const safeStorage = createSafeStorage()

