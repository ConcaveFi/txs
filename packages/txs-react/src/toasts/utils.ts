import type { StoredTransaction } from '@concave/txs-core'
import { toast } from './TransactionStatusToasts'
import * as chains from 'wagmi/chains'

export const statusToToastType = {
  pending: 'loading',
  confirmed: 'success',
  failed: 'error',
} satisfies Record<StoredTransaction['status'], toast.Type>

const explorerOf = (chainId: number) => {
  return Object.values(chains).find((chain) => chain.id === chainId)?.blockExplorers?.default.url
}
export const txExplorerLink = ({ chainId, hash }: StoredTransaction) =>
  `${explorerOf(chainId)}/tx/${hash}`
