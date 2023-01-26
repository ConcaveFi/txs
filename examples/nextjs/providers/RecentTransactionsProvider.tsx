import { PropsWithChildren } from 'react'

import {
  createTransactionsStore,
  StoredTransaction,
  ToastsViewport,
  TransactionsStoreProvider,
  TransactionStatusToastProps,
  createTypedHooks,
} from '@concave/txs-react'
import { EmojiToast } from '@concave/txs-react/toasts/EmojiToast'
import '@concave/txs-react/toasts/EmojiToast/styles.css'

const txsStore = createTransactionsStore()

type TransactionMeta = {
  [status in StoredTransaction['status']]: string
}

export const {
  useRecentTransactions,
  useAddRecentTransaction,
  useRemoveRecentTransaction,
  useClearRecentTransactions,
} = createTypedHooks<TransactionMeta>()

const MyCustomNotification = (props: TransactionStatusToastProps<TransactionMeta>) => {
  const tx = props.transaction
  return <EmojiToast {...props} title="" description={tx.meta[tx.status]} />
}

export function RecentTransactionsProvider({ children }: PropsWithChildren) {
  return (
    <TransactionsStoreProvider store={txsStore}>
      <ToastsViewport TransactionStatusComponent={MyCustomNotification} placement="top-end" />
      {children}
    </TransactionsStoreProvider>
  )
}
