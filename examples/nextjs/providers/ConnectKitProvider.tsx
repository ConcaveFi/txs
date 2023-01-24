import { ConnectKitProvider as CKProvider } from 'connectkit'
import { PropsWithChildren } from 'react'

export function ConnectKitProvider({ children }: PropsWithChildren) {
  return <CKProvider>{children}</CKProvider>
}
