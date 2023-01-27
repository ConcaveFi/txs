import type { TransactionStore } from '@concave/txs-core'
import { createContext, PropsWithChildren, useContext, useEffect } from 'react'
import { useAccount, useNetwork, useProvider } from 'wagmi'

const TransactionsStoreContext = createContext<TransactionStore | null>(null)

type TransactionsProviderProps = PropsWithChildren<{
  store: TransactionStore
}>

export const TransactionsStoreProvider = ({ children, store }: TransactionsProviderProps) => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const provider = useProvider()

  useEffect(() => {
    if (!provider || !address || !chain?.id) return
    store.mount(provider, address, chain.id)
    return () => {
      store.unmount()
    }
  }, [provider, address, chain, store])

  return (
    <TransactionsStoreContext.Provider value={store}>{children}</TransactionsStoreContext.Provider>
  )
}

export const useTransactionsStore = (): TransactionStore => {
  const store = useContext(TransactionsStoreContext)
  if (!store) throw new Error('Missing TransactionsProvider')
  return store
}
