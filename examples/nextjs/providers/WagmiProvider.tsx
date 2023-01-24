import { PropsWithChildren } from 'react'
import { configureChains, Connector, createClient, WagmiConfig } from 'wagmi'
import { goerli } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider, webSocketProvider } = configureChains([goerli], [publicProvider()])

const connectors = [
  new InjectedConnector({ chains }),
  new MetaMaskConnector({ chains }),
  new WalletConnectConnector({ chains, options: { qrcode: false } }),
] as Connector[]

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
})

export function WagmiProvider({ children }: PropsWithChildren) {
  return <WagmiConfig client={client}>{children}</WagmiConfig>
}
