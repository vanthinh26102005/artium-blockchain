/**
 * DB_NAME - React component
 * @returns React element
 */
const DB_NAME = 'artium.inventoryUpload.files'
const STORE_NAME = 'files'
const DB_VERSION = 1

/**
 * STORE_NAME - React component
 * @returns React element
 */
const isIndexedDbAvailable = () => typeof window !== 'undefined' && typeof indexedDB !== 'undefined'

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
/**
 * DB_VERSION - React component
 * @returns React element
 */
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
/**
 * isIndexedDbAvailable - Utility function
 * @returns void
 */
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => {
/**
 * openDatabase - Utility function
 * @returns void
 */
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
/**
 * request - Utility function
 * @returns void
 */
    }
  })

export const saveStoredFile = async (id: string, file: File) => {
  if (!isIndexedDbAvailable()) {
    return
/**
 * db - Utility function
 * @returns void
 */
  }
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.put(file, id)

    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
    transaction.onabort = () => {
      db.close()
      reject(transaction.error)
/**
 * saveStoredFile - Utility function
 * @returns void
 */
    }
  })
}

export const getStoredFile = async (id: string) => {
  if (!isIndexedDbAvailable()) {
    return undefined
/**
 * db - Utility function
 * @returns void
 */
  }
  const db = await openDatabase()
  return new Promise<File | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
/**
 * transaction - Utility function
 * @returns void
 */
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result as File | undefined)
/**
 * store - Utility function
 * @returns void
 */
    }
    request.onerror = () => {
      reject(request.error)
    }

    transaction.oncomplete = () => {
      db.close()
    }
    transaction.onerror = () => {
      db.close()
    }
    transaction.onabort = () => {
      db.close()
    }
  })
}

export const removeStoredFile = async (id: string) => {
  if (!isIndexedDbAvailable()) {
    return
  }
/**
 * getStoredFile - Utility function
 * @returns void
 */
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.delete(id)

    transaction.oncomplete = () => {
/**
 * db - Utility function
 * @returns void
 */
      db.close()
      resolve()
    }
    transaction.onerror = () => {
      db.close()
/**
 * transaction - Utility function
 * @returns void
 */
      reject(transaction.error)
    }
    transaction.onabort = () => {
      db.close()
/**
 * store - Utility function
 * @returns void
 */
      reject(transaction.error)
    }
  })
}
/**
 * request - Utility function
 * @returns void
 */

export const clearStoredFiles = async () => {
  if (!isIndexedDbAvailable()) {
    return
  }
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.clear()

    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
    transaction.onabort = () => {
      db.close()
      reject(transaction.error)
    }
  })
/**
 * removeStoredFile - Utility function
 * @returns void
 */
}

/**
 * db - Utility function
 * @returns void
 */
/**
 * transaction - Utility function
 * @returns void
 */
/**
 * store - Utility function
 * @returns void
 */
/**
 * clearStoredFiles - Utility function
 * @returns void
 */
/**
 * db - Utility function
 * @returns void
 */
/**
 * transaction - Utility function
 * @returns void
 */
/**
 * store - Utility function
 * @returns void
 */