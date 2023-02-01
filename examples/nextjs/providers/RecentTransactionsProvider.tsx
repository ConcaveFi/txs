import { PropsWithChildren } from 'react'

import {
  createTransactionsStore,
  StoredTransaction,
  ToastsViewport,
  TransactionsStoreProvider,
  TransactionStatusToastProps,
  TypedUseAddRecentTransaction,
  TypedUseRecentTransactions,
  useRecentTransactions as _useRecentTransactions,
  useAddRecentTransaction as _useAddRecentTransaction,
} from '@pcnv/txs-react'
import { EmojiToast } from '@pcnv/txs-react/toasts/EmojiToast'
import '@pcnv/txs-react/toasts/EmojiToast/styles.css'

const txsStore = createTransactionsStore()

type TransactionMeta = {
  [status in StoredTransaction['status']]: string
}

const MyCustomNotification = (props: TransactionStatusToastProps<TransactionMeta>) => {
  const tx = props.transaction
  return <EmojiToast {...props} description={tx.meta[tx.status]} />
}

export const useRecentTransactions: TypedUseRecentTransactions<TransactionMeta> =
  _useRecentTransactions
export const useAddRecentTransaction: TypedUseAddRecentTransaction<TransactionMeta> =
  _useAddRecentTransaction

export function RecentTransactionsProvider({ children }: PropsWithChildren) {
  return (
    <TransactionsStoreProvider store={txsStore}>
      <ToastsViewport TransactionStatusComponent={MyCustomNotification} placement="top-end" />
      {children}
    </TransactionsStoreProvider>
  )
}
