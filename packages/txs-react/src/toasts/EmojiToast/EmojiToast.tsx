import React from 'react'
import { X } from 'lucide-react'

import { ThemeProps, useTheme } from '../useTheme'
import styles from './EmojiToast.module.css'
import theme from './theme.module.css'

import type { TransactionStatusToastProps } from '../ToastsViewport'
import { txExplorerLink } from '../utils'

const { flex, p3, gap3, flexColumn, justifyCenter } = styles

const typeToProps = {
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
  stuck: {
    title: 'Transaction Stuck',
    icon: (
      <div className={styles.stuckIcon}>
        <span>❄️</span>
      </div>
    ),
  },
} satisfies Record<TransactionStatusToastProps['type'], { title: string; icon: JSX.Element }>

export type EmojiToastMeta = { description: string }
export const EmojiToast = ({
  transaction,
  dismiss,
  colorScheme = 'system',
  className = '',
  description,
  title,
  type,
  rootProps,
}: TransactionStatusToastProps & ThemeProps) => {
  const { icon, title: _title } = typeToProps[type]

  title ??= _title

  const key = useTheme(colorScheme)

  return (
    <div className={`${theme[key]} ${styles.root} ${className}`} {...rootProps}>
      <a href={txExplorerLink(transaction)} className={`${flex} ${p3} ${gap3}`}>
        {icon}
        <div className={`${flexColumn} ${justifyCenter}`}>
          {title ? <span className={styles.title}>{title}</span> : null}
          {description ? <span className={styles.description}>{description}</span> : null}
        </div>
      </a>
      <button aria-label="Dismiss" onClick={dismiss} className={styles.dismissButton}>
        <X />
      </button>
    </div>
  )
}
