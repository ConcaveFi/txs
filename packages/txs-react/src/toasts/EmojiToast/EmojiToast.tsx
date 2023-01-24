import React from 'react'
import { X } from 'lucide-react'

import { ThemeProps, useTheme } from '../useTheme'
import styles from './EmojiToast.module.css'
import theme from './theme.module.css'

import type { StoredTransaction } from '@concave/txs-core'
import type { TransactionStatusToastProps } from '../TransactionStatusToasts'
import { txExplorerLink } from '../utils'

const { flex, p3, gap3, flexColumn, justifyCenter } = styles

const statusToProps = {
  pending: {
    title: 'Transaction Pending',
    icon: (
      <div className={styles.pendingIcon}>
        <span>⏳</span>
      </div>
    ),
  },
  confirmed: {
    title: 'Transaction Confirmed',
    icon: (
      <div className={styles.completedIcon}>
        <span>👍</span>
      </div>
    ),
  },
  failed: {
    title: 'Transaction Failed',
    icon: (
      <div className={styles.failedIcon}>
        <span>😬</span>
      </div>
    ),
  },
} satisfies Record<StoredTransaction['status'], { title: string; icon: JSX.Element }>

export type EmojiToastMetaTypes = { description: string }
export const EmojiToast = ({
  transaction,
  dismiss,
  colorScheme = 'system',
  className = '',
  ...props
}: TransactionStatusToastProps & ThemeProps) => {
  const { icon, title } = statusToProps[transaction.status]
  const description = transaction.meta.description

  const key = useTheme(colorScheme)

  return (
    <div className={`${theme[key]} ${styles.root} ${className}`} {...props}>
      <a href={txExplorerLink(transaction)} className={`${flex} ${p3} ${gap3}`}>
        {icon}
        <div className={`${flexColumn} ${justifyCenter}`}>
          {title && <span className={styles.title}>{title}</span>}
          <span className={styles.description}>{description}</span>
        </div>
      </a>
      <button aria-label="Dismiss" onClick={dismiss} className={styles.dismissButton}>
        <X />
      </button>
    </div>
  )
}
