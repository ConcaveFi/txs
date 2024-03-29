import type { BaseProvider, TransactionReceipt } from '@ethersproject/providers'
import { createEventEmmiter } from 'eeemiter'
import { createStorage } from './localStorage'

type Address = `0x${string}`

export type TransactionsStoreConfig = {
  /* 
    max completed transactions to keep in storage 
    (undefined keep all transactions)
  */
  maxCompletedTransactions: number | undefined
  minConfirmations: number
  localStorageKey: string
}

export type NewTransaction<Meta = Record<string, any>> = {
  hash: string
  meta: Meta
  minConfirmations?: number
}

export type StoredTransaction<Meta = Record<string, any>> = {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  minConfirmations: number
  chainId: number
  sentAt: number
  meta: Meta
}

const parseNewTransaction = <Meta extends NewTransaction['meta']>(
  transaction: NewTransaction<Meta>,
  chainId: number,
  config: TransactionsStoreConfig,
): StoredTransaction => {
  if (!/^0x([A-Fa-f0-9]{64})$/.test(transaction.hash)) throw new Error('Invalid Transaction hash')
  return {
    ...transaction,
    sentAt: Date.now(),
    status: 'pending',
    chainId,
    minConfirmations: transaction.minConfirmations || config.minConfirmations,
  }
}

const defaultConfig = {
  localStorageKey: 'transactions',
  minConfirmations: 1,
  maxCompletedTransactions: 50,
} satisfies TransactionsStoreConfig

const stableNoTransactions: StoredTransaction[] = []

export type TransactionsStoreEvents =
  | { type: 'mounted'; payload: StoredTransaction[] }
  | { type: 'updated'; payload: StoredTransaction }
  | { type: 'added'; payload: StoredTransaction }
  | { type: 'removed'; payload: StoredTransaction }
  | { type: 'cleared' }

type StoreContext = {
  user: Address
  chainId: number
  provider: BaseProvider
}

export const createTransactionsStore = (_config?: Partial<TransactionsStoreConfig>) => {
  const config = { ...defaultConfig, ..._config }

  let ctx: StoreContext | undefined = undefined

  const txsStorage = createStorage(config.localStorageKey)
  let transactions = txsStorage.get()

  const listeners = createEventEmmiter<TransactionsStoreEvents>()

  const updateUserTransactions = (
    user: Address,
    chainId: number,
    set: (txs: StoredTransaction[]) => StoredTransaction[],
  ) => {
    // get latest localstorage data (in case another tab updated it)
    const txs = txsStorage.get()

    txs[user] ??= {} // if no user data, create empty object
    txs[user][chainId] = set(txs[user]?.[chainId] || [])

    transactions = txs
    txsStorage.set(txs)
  }

  function addTransaction<Meta extends NewTransaction['meta']>(
    newTx: NewTransaction<Meta>,
    user: Address = ctx?.user!,
    chainId: number = ctx?.chainId!,
    provider: BaseProvider = ctx?.provider!,
  ) {
    const tx = parseNewTransaction(newTx, chainId, config)
    updateUserTransactions(user, chainId, (txs) =>
      [...txs.filter(({ hash }) => hash !== tx.hash), tx].slice(0, config.maxCompletedTransactions),
    )
    listeners.emit('added', tx)
    waitForTransaction(provider, user, chainId, tx)
  }

  function getTransactions<Meta extends NewTransaction['meta']>(
    user: Address = ctx?.user!,
    chainId: number = ctx?.chainId!,
  ) {
    return (transactions[user]?.[chainId] as StoredTransaction<Meta>[]) || stableNoTransactions
  }

  function clearTransactions(user: Address = ctx?.user!, chainId: number = ctx?.chainId!) {
    updateUserTransactions(user, chainId, () => [])
    listeners.emit('cleared')
  }

  function removeTransaction(
    hash: StoredTransaction['hash'],
    user: Address = ctx?.user!,
    chainId: number = ctx?.chainId!,
  ) {
    const tx = getTransactions(user, chainId)?.find((tx) => tx.hash === hash)
    if (!tx) return
    updateUserTransactions(user, chainId, (txs) => txs.filter((tx) => tx.hash !== hash))
    listeners.emit('removed', tx)
  }

  function updateTransactionStatus({
    receipt,
    user,
    chainId,
  }: {
    receipt: TransactionReceipt
    user: Address
    chainId: number
  }) {
    const { transactionHash: hash, status } = receipt
    // maybe add gasUsed, gasPrice, blockNumber, etc (?)
    let updatedTx
    updateUserTransactions(user, chainId, (txs) => {
      const tx = txs.find((tx) => hash === tx.hash)
      if (!tx) return txs // if transaction is not in the store, it was cleared and we don't want to re-add it
      updatedTx = {
        ...tx,
        status: status === 1 ? 'confirmed' : 'failed',
      } satisfies StoredTransaction
      return [updatedTx, ...txs.filter(({ hash }) => hash !== tx.hash)]
    })
    if (updatedTx) listeners.emit('updated', updatedTx)
  }

  const pendingTxsCache: Map<string, Promise<void>> = new Map()
  async function waitForTransaction(
    provider: BaseProvider,
    user: Address,
    chainId: number,
    tx: StoredTransaction,
  ) {
    if (pendingTxsCache.has(tx.hash)) return pendingTxsCache.get(tx.hash)
    const waitTxRequest = provider
      .waitForTransaction(tx.hash, tx.minConfirmations)
      .then((receipt) => updateTransactionStatus({ receipt, user, chainId }))
    pendingTxsCache.set(tx.hash, waitTxRequest)
    return waitTxRequest
  }

  function mount(provider: BaseProvider, user: Address, chainId: number) {
    ctx = { user, chainId, provider }
    if (transactions?.[user]?.[chainId]) {
      const pendingTxs = transactions[user][chainId].filter((tx) => tx.status === 'pending')
      Promise.all(pendingTxs.map((tx) => waitForTransaction(provider, user, chainId, tx)))
    }
    listeners.emit('mounted', transactions[user][chainId])
  }

  function unmount() {
    ctx = undefined
    pendingTxsCache.clear()
    listeners.clear()
  }

  /* util to listen for any change */
  function onTransactionsChange(fn: () => void) {
    const unsubs = [
      listeners.on('updated', fn),
      listeners.on('added', fn),
      listeners.on('removed', fn),
      listeners.on('cleared', fn),
    ]
    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  }

  return {
    addTransaction,
    getTransactions,
    clearTransactions,
    removeTransaction,
    onTransactionsChange,
    on: listeners.on,
    mount,
    unmount,
    /*
      allows directly modifiying the transactions of a user
      caution no events are emitted (react won't update your state)
    */
    '#updateUserTransactions': updateUserTransactions,
  }
}

export type TransactionStore = ReturnType<typeof createTransactionsStore>
