import { StoredTransaction } from './store'

function jsonSafeParse(string: string | null) {
  try {
    const value = string ? JSON.parse(string) : {}
    return typeof value === 'object' ? value : {}
  } catch (err) {
    return {}
  }
}

type StoredTransactions = {
  [user: string]: {
    [chain: number]: StoredTransaction[]
  }
}

export const createStorage = (storageKey: string) =>
  typeof localStorage !== 'undefined'
    ? {
        get: () => jsonSafeParse(localStorage.getItem(storageKey)) as StoredTransactions,
        set: (txs: StoredTransactions) => {
          try {
            // test if localStorage is available and is not full
            localStorage.setItem(storageKey, JSON.stringify(txs))
          } catch (e) {
            throw new Error(`Error saving transaction to localStorage`)
          }
        },
      }
    : { get: () => ({}), set: () => {} }
