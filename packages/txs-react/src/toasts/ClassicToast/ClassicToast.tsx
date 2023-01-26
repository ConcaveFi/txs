import React from 'react'
import { CheckCircle2, Loader, XCircle, Timer } from 'lucide-react'

import { TransactionStatusToastProps } from '../ToastsViewport'
import { ThemeProps, useTheme } from '../useTheme'
import { txExplorerLink } from '../utils'
import styles from './ClassicToast.module.css'
import theme from './theme.module.css'

const { flex, p3, gap3, flexColumn, justifyCenter } = styles

const typeToProps = {
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
  stuck: {
    title: 'Transaction Stuck',
    icon: <Timer className={styles.stuckIcon} />,
  },
} satisfies Record<TransactionStatusToastProps['type'], { title: string; icon: JSX.Element }>

export type ClassicToastMetaTypes = { description: string }
export const ClassicToast = ({
  transaction,
  dismiss,
  colorScheme = 'system',
  className = '',
  title,
  description,
  type,
  rootProps,
}: TransactionStatusToastProps & ThemeProps) => {
  const { icon, title: _title } = typeToProps[type]

  title ??= _title

  const key = useTheme(colorScheme)

  return (
    <div className={`${theme[key]} ${styles.root} ${className}`} {...rootProps}>
      <div className={`${flex} ${p3} ${gap3}`}>
        {icon}
        <div className={`${flexColumn} ${justifyCenter}`}>
          {title ? <span className={styles.title}>{title}</span> : null}
          {description ? <span className={styles.description}>{description}</span> : null}
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
