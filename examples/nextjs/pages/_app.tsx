import { AppProps } from 'next/app'
import { ConnectKitProvider } from 'providers/ConnectKitProvider'
import { TransactionsProvider } from 'providers/TransactionsProvider'
import { WagmiProvider } from 'providers/WagmiProvider'

import '../styles.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider>
      <ConnectKitProvider>
        <TransactionsProvider>
          <Component {...pageProps} />
        </TransactionsProvider>
      </ConnectKitProvider>
    </WagmiProvider>
  )
}
