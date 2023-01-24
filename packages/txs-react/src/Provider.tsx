import type { TransactionStore } from '@concave/txs-core'
import { createContext, Fragment, PropsWithChildren, useContext, useEffect } from 'react'
import { useAccount, useNetwork, useProvider } from 'wagmi'
import { TransactionStatusToasts, ToastProviderProps } from './toasts/TransactionStatusToasts'

const TransactionsStoreContext = createContext<TransactionStore | null>(null)

type TransactionsProviderProps = PropsWithChildren<
  {
    store: TransactionStore
  } & ToastProviderProps
>

const injectedConnectorsWithBuiltInStatusToast = ['metamask']

export const TransactionsProvider = ({
  children,
  store,
  ToastComponent,
  placement,
  staleTime,
  showPendingOnReopen,
}: TransactionsProviderProps) => {
  const { address, connector } = useAccount()
  const { chain } = useNetwork()
  const provider = useProvider()

  useEffect(() => {
    if (!provider || !address || !chain?.id) return
    store.mount(provider, address, chain.id)
    return () => store.unmount()
  }, [provider, address, chain, store])

  const TransactionToast =
    !ToastComponent || injectedConnectorsWithBuiltInStatusToast.includes(connector?.id || '')
      ? Fragment
      : TransactionStatusToasts

  return (
    <TransactionsStoreContext.Provider value={store}>
      <TransactionToast
        ToastComponent={ToastComponent}
        placement={placement}
        staleTime={staleTime}
        showPendingOnReopen={showPendingOnReopen}
      />
      {children}
    </TransactionsStoreContext.Provider>
  )
}

export const useTransactionsStore = (): TransactionStore => {
  const store = useContext(TransactionsStoreContext)
  if (!store) throw new Error('Missing TransactionsProvider')
  return store
}
