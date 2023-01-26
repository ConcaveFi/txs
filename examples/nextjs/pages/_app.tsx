import { AppProps } from 'next/app'
import { ConnectKitProvider } from 'providers/ConnectKitProvider'
import { RecentTransactionsProvider } from 'providers/RecentTransactionsProvider'
import { WagmiProvider } from 'providers/WagmiProvider'

import '../styles.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider>
      <ConnectKitProvider>
        <RecentTransactionsProvider>
          <Component {...pageProps} />
        </RecentTransactionsProvider>
      </ConnectKitProvider>
    </WagmiProvider>
  )
}
