import { detect } from 'detect-browser'
import type { StoredTransaction } from '@pcnv/txs-core'
import * as chains from 'wagmi/chains'

// tx explorer
const explorerOf = (chainId: number) => {
  return Object.values(chains).find((chain) => chain.id === chainId)?.blockExplorers?.default.url
}
export const txExplorerLink = ({ chainId, hash }: StoredTransaction) =>
  `${explorerOf(chainId)}/tx/${hash}`

// isMobile
export const detectEnv = (userAgent?: string) => detect(userAgent)
export const detectOS = (env = detectEnv()) => env?.os?.toLowerCase()

export const isAndroid = (os = detectOS()) => os?.includes('android')
export const isIOS = (os = detectOS()) =>
  os?.includes('ios') || (os?.includes('mac') && navigator.maxTouchPoints > 1)

export const isMobile = () => isAndroid() || isIOS()
