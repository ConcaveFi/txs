import React, { createContext, PropsWithChildren, useCallback, useContext } from 'react'
import * as toast from '@zag-js/toast'
import type { RenderOptions, Toaster } from '@zag-js/toast/dist/toast.types'
import { normalizeProps, useActor, useMachine } from '@zag-js/react'
import type { StoredTransaction } from '@concave/txs-core'
import { useTransactionStoreEvent } from '../hooks'
import { statusToToastType } from './utils'

export type TransactionStatusToastProps = {
  transaction: StoredTransaction
} & RenderOptions

export type ToastProviderProps = PropsWithChildren<
  {
    ToastComponent: React.ComponentType<TransactionStatusToastProps>
    placement?: toast.Placement
    /* 
      staleTime is how long the transaction remains relevant to display a status notification 
      in the case a user closed the app while the tx was pending, on reconnect if still in the staleTime window
      a toast will be displayed with the current status of the tx
      @default 2hrs
    */
    staleTime?: number
    /*
      should display a pending transaction toast every time the user opens the app
      and there are pending transactions, if false, only when the transaction is submitted will a toast be displayed
      (this does not stop the toast from being displayed when the transaction is confirmed/failed)
      @default true
    */
    showPendingOnReopen?: boolean
  } & React.HTMLAttributes<HTMLElement>
>

export { toast }

const BaseToast = ({ actor }: PropsWithChildren<{ actor: toast.Service }>) => {
  const [state, send] = useActor(actor)
  const api = toast.connect(state, send, normalizeProps)
  const toastElement = api.render()
  if (!toastElement) return null
  return React.cloneElement(toastElement, { ...api.rootProps })
}

const one_second = 1000
const ten_seconds = 10 * one_second

const gutter = '12px'

export function TransactionStatusToasts({
  placement = 'top-end',
  ToastComponent,
  staleTime = 1000 * 60 * 60 * 2,
  showPendingOnReopen = true,
}: ToastProviderProps) {
  const [state, send] = useMachine(
    toast.group.machine({
      id: 'cnv-notifications',
      pauseOnPageIdle: true,
      pauseOnInteraction: true,
      max: 6,
      gutter: gutter,
      offsets: {
        top: gutter,
        bottom: gutter,
        left: gutter,
        right: gutter,
      },
    }),
  )
  const api = toast.group.connect(state, send, normalizeProps)

  const upsertTxToast = useCallback(
    (tx?: StoredTransaction) => {
      if (!tx) return
      if (tx.sentAt < Date.now() - staleTime) return // ignore old txs (older than 2hrs)
      api.upsert({
        id: tx.hash,
        placement,
        type: statusToToastType[tx.status],
        duration: tx.status === 'pending' ? Infinity : ten_seconds,
        removeDelay: 500,
        render: (props) => <ToastComponent transaction={tx} {...props} id={tx.hash} />,
      })
    },
    [api],
  )

  useTransactionStoreEvent('updated', upsertTxToast)
  useTransactionStoreEvent('added', upsertTxToast)
  useTransactionStoreEvent(
    'mounted',
    useCallback(
      (txs?: StoredTransaction[]) => {
        if (!txs || !showPendingOnReopen) return
        const pendingTxs = txs.filter((t) => t.status === 'pending')
        pendingTxs.forEach((tx) => upsertTxToast(tx))
      },
      [showPendingOnReopen],
    ),
  )

  return (
    <>
      {Object.entries(api.toastsByPlacement).map(([placement, toasts]) => (
        <div key={placement} {...api.getGroupProps({ placement: placement as toast.Placement })}>
          {toasts.map((toastActor) => (
            <BaseToast key={toastActor.id} actor={toastActor} />
          ))}
        </div>
      ))}
    </>
  )
}
