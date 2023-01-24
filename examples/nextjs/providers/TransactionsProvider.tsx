import { PropsWithChildren } from 'react'

import { createTransactionsStore, TransactionsProvider as TxsProvider } from '@concave/txs-react'
import { EmojiToast } from '@concave/txs-react/toasts/EmojiToast'
import '@concave/txs-react/toasts/EmojiToast/styles.css'

const txsStore = createTransactionsStore()

export function TransactionsProvider({ children }: PropsWithChildren) {
  return (
    <TxsProvider store={txsStore} ToastComponent={EmojiToast}>
      {children}
    </TxsProvider>
  )
}
