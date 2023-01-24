import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useAccount, useNetwork, useProvider } from 'wagmi'
import { useTransactionsStore } from './Provider'
import type { NewTransaction, StoredTransaction, TransactionsStoreEvents } from '@concave/txs-core'

export const useTransactions = <Selector = StoredTransaction[]>(
  selector: (txs: StoredTransaction[]) => Selector = (txs) => txs as Selector,
  { initialTransactions = [] }: { initialTransactions?: StoredTransaction[] } = {},
) => {
  const store = useTransactionsStore()
  const { address } = useAccount()
  const { chain } = useNetwork()

  const transactions = useSyncExternalStore(
    store.onTransactionsChange,
    useCallback(
      () => selector(store.transactionsOf(address, chain?.id) || initialTransactions),
      [selector, store, address, chain?.id, initialTransactions],
    ),
    () => selector(initialTransactions),
  )

  return transactions
}

export const useAddTransaction = <Meta extends NewTransaction['meta']>(): ((
  tx: NewTransaction<Meta>,
) => void) => {
  const store = useTransactionsStore()
  const { address } = useAccount()
  const { chain } = useNetwork()
  const provider = useProvider()

  return useCallback(
    (transaction: NewTransaction<Meta>) => {
      if (address && chain) store.addTransaction(transaction, address, chain.id, provider)
    },
    [address, chain, provider, store],
  )
}

export const useClearTransactions = () => {
  const store = useTransactionsStore()
  const { address } = useAccount()
  const { chain } = useNetwork()
  const provider = useProvider()

  return useCallback(() => {
    if (address && chain) store.clearTransactions(address, chain.id)
  }, [address, chain, provider, store])
}

export const useTransactionStoreEvent = <
  E extends TransactionsStoreEvents,
  T extends E['type'],
  Fn extends E extends { type: T; arg: infer A } ? (arg?: A) => void : VoidFunction,
>(
  event: T,
  callback: Fn,
) => {
  const store = useTransactionsStore()
  useEffect(() => {
    const unsubscribe = store.on(event, callback)
    return () => unsubscribe()
  }, [store, callback])
}
