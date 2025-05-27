const clientStorage = {
  getItem(key: string) {
    return Promise.resolve(localStorage.getItem(key))
  },
  setItem(key: string, value: string) {
    localStorage.setItem(key, value)
    return Promise.resolve()
  },
  removeItem(key: string) {
    localStorage.removeItem(key)
    return Promise.resolve()
  }
}

const serverStorage = {
  getItem() {
    return Promise.resolve(null)
  },
  setItem() {
    return Promise.resolve()
  },
  removeItem() {
    return Promise.resolve()
  }
}

export const storage = typeof window !== 'undefined' ? clientStorage : serverStorage
