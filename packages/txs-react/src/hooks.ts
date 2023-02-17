import { useCallback, useEffect } from 'react'
import { useTransactionsStore } from './Provider'
import type { NewTransaction, StoredTransaction, TransactionsStoreEvents } from '@pcnv/txs-core'
import { DefaultToastTransactionMeta } from './toasts/ToastsViewport'

import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector'
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports

export interface TypedUseRecentTransactions<Meta extends StoredTransaction['meta']> {
  <Selected = StoredTransaction<Meta>[]>(
    selector?: (state: StoredTransaction<Meta>[]) => Selected,
    options?: { initialTransactions?: StoredTransaction<Meta>[] },
  ): Selected
}

export const useRecentTransactions = <
  Meta extends StoredTransaction['meta'],
  Selector = StoredTransaction<Meta>[],
>(
  selector: (txs: StoredTransaction<Meta>[]) => Selector = (txs) => txs as Selector,
  { initialTransactions = [] }: { initialTransactions?: StoredTransaction<Meta>[] } = {},
) => {
  const store = useTransactionsStore()

  const transactions = useSyncExternalStoreWithSelector(
    store.onTransactionsChange,
    store.getTransactions,
    useCallback(() => initialTransactions, [initialTransactions]),
    selector,
  )

  return transactions
}

export type TypedUseAddRecentTransaction<Meta extends NewTransaction['meta']> = () => (
  transaction: NewTransaction<Meta>,
) => void
export const useAddRecentTransaction = <
  Meta extends NewTransaction['meta'] = DefaultToastTransactionMeta,
>(): ((transaction: NewTransaction<Meta>) => void) => {
  const store = useTransactionsStore()
  return useCallback((tx: NewTransaction<Meta>) => store.addTransaction(tx), [store])
}

export const useClearRecentTransactions = () => {
  const store = useTransactionsStore()
  return store.clearTransactions()
}

export const useRemoveRecentTransaction = () => {
  const store = useTransactionsStore()
  return useCallback((hash: StoredTransaction['hash']) => store.removeTransaction(hash), [store])
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
