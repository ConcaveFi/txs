import { useSyncExternalStore, useCallback, useEffect } from 'react'
import { useAccount, useNetwork, useProvider } from 'wagmi'
import { useTransactionsStore } from './Provider'
import type { NewTransaction, StoredTransaction, TransactionsStoreEvents } from '@pcnv/txs-core'
import { DefaultToastTransactionMeta } from './toasts/ToastsViewport'

import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector'
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports

export const useRecentTransactions = <
  Meta extends StoredTransaction['meta'] = DefaultToastTransactionMeta,
  Selector = StoredTransaction<Meta>[],
>(
  selector: (txs: StoredTransaction<Meta>[]) => Selector = (txs) => txs as Selector,
  { initialTransactions = [] }: { initialTransactions?: StoredTransaction<Meta>[] } = {},
) => {
  const store = useTransactionsStore()
  const { address } = useAccount()
  const { chain } = useNetwork()

  const transactions = useSyncExternalStoreWithSelector(
    store.onTransactionsChange,
    useCallback(
      () =>
        address && chain?.id
          ? (store.transactionsOf(address, chain.id) as StoredTransaction<Meta>[])
          : [],
      [address, chain?.id, store, selector],
    ),
    useCallback(() => initialTransactions, [initialTransactions]),
    selector,
  )

  return transactions
}

export const useAddRecentTransaction = <
  Meta extends NewTransaction['meta'] = DefaultToastTransactionMeta,
>(): ((transaction: NewTransaction<Meta>) => void) => {
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

export const useClearRecentTransactions = () => {
  const store = useTransactionsStore()
  const { address } = useAccount()
  const { chain } = useNetwork()
  const provider = useProvider()

  return useCallback(() => {
    if (address && chain) store.clearTransactions(address, chain.id)
  }, [address, chain, provider, store])
}

export const useRemoveRecentTransaction = () => {
  const store = useTransactionsStore()
  const { address } = useAccount()
  const { chain } = useNetwork()

  return useCallback(
    (hash: StoredTransaction['hash']) => {
      if (address && chain) store.removeTransaction(address, chain.id, hash)
    },
    [address, chain, store],
  )
}

export const useTransactionsStoreEvent = <
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
