import React from 'react'
import { CheckCircle2, Loader, XCircle } from 'lucide-react'
import { StoredTransaction } from '@concave/txs-core'

import { TransactionStatusToastProps } from '../TransactionStatusToasts'
import { ThemeProps, useTheme } from '../useTheme'
import { txExplorerLink } from '../utils'
import styles from './ClassicToast.module.css'
import theme from './theme.module.css'

const { flex, p3, gap3, flexColumn, justifyCenter } = styles

const statusToProps = {
  pending: {
    title: 'Transaction Pending',
    icon: <Loader className={styles.pendingIcon} />,
  },
  confirmed: {
    title: 'Transaction Confirmed',
    icon: <CheckCircle2 className={styles.completedIcon} />,
  },
  failed: {
    title: 'Transaction Failed',
    icon: <XCircle className={styles.failedIcon} />,
  },
} satisfies Record<StoredTransaction['status'], { title: string; icon: JSX.Element }>

export type ClassicToastMetaTypes = { description: string }
export const ClassicToast = ({
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
      <div className={`${flex} ${p3} ${gap3}`}>
        {icon}
        <div className={`${flexColumn} ${justifyCenter}`}>
          {title && <span className={styles.title}>{title}</span>}
          <span className={styles.description}>{description}</span>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <button onClick={dismiss} className={styles.dismissButton}>
          Dismiss
        </button>
        <a
          href={txExplorerLink(transaction)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewExplorerButton}
        >
          View on explorer
        </a>
      </div>
    </div>
  )
}
