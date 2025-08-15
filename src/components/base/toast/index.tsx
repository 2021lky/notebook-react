'use client'
import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiErrorWarningFill,
  RiInformation2Fill,
} from '@remixicon/react'
import { createContext, useContext } from 'use-context-selector'
import ActionButton from '@/components/base/action-button'
import { noop } from 'lodash-es'
import styles from './style.module.css'

export type IToastProps = {
  type?: 'success' | 'error' | 'warning' | 'info'
  size?: 'md' | 'sm'
  duration?: number
  message: string
  children?: ReactNode
  onClose?: () => void
  className?: string
  customComponent?: ReactNode
}
type IToastContext = {
  notify: (props: IToastProps) => void
  close: () => void
}

export const ToastContext = createContext<IToastContext>({} as IToastContext)
export const useToastContext = () => useContext(ToastContext)
const Toast = ({
  type = 'info',
  size = 'md',
  message,
  children,
  className,
  customComponent,
}: IToastProps) => {
  const { close } = useToastContext()
  // sometimes message is react node array. Not handle it.
  if (typeof message !== 'string')
    return null

  return <div className={`${className} ${styles.toastContainer} ${size === 'md' ? styles.toastContainerMd : styles.toastContainerSm}`}>
    <div className={`${styles.backgroundLayer} ${
      type === 'success' ? styles.backgroundSuccess :
      type === 'warning' ? styles.backgroundWarning :
      type === 'error' ? styles.backgroundError :
      type === 'info' ? styles.backgroundInfo : ''
    }`}
    />
    <div className={`${styles.contentWrapper} ${size === 'md' ? styles.contentWrapperMd : styles.contentWrapperSm} flex items-center`}>
      <div className={`${styles.iconContainer} ${size === 'md' ? styles.iconContainerMd : styles.iconContainerSm}`}>
        {type === 'success' && <RiCheckboxCircleFill className={`${size === 'md' ? styles.iconMd : styles.iconSm} ${styles.iconSuccess}`} aria-hidden="true" />}
        {type === 'error' && <RiErrorWarningFill className={`${size === 'md' ? styles.iconMd : styles.iconSm} ${styles.iconError}`} aria-hidden="true" />}
        {type === 'warning' && <RiAlertFill className={`${size === 'md' ? styles.iconMd : styles.iconSm} ${styles.iconWarning}`} aria-hidden="true" />}
        {type === 'info' && <RiInformation2Fill className={`${size === 'md' ? styles.iconMd : styles.iconSm} ${styles.iconInfo}`} aria-hidden="true" />}
      </div>
      <div className={`${styles.textContainer} ${size === 'md' ? styles.textContainerMd : styles.textContainerSm}`}>
        <div className={styles.messageRow}>
          <div className={styles.messageText}>{message}</div>
          {customComponent}
        </div>
        {children && <div className={styles.childrenText}>
          {children}
        </div>
        }
      </div>
      {close
        && (<ActionButton className={styles.closeButton} onClick={close}>
          <RiCloseLine className={styles.closeIcon} />
        </ActionButton>)
      }
    </div>
  </div>
}

export const ToastProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const placeholder: IToastProps = {
    type: 'info',
    message: 'Toast message',
    duration: 6000,
  }
  const [params, setParams] = React.useState<IToastProps>(placeholder)
  const defaultDuring = (params.type === 'success' || params.type === 'info') ? 3000 : 6000
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (mounted) {
      setTimeout(() => {
        setMounted(false)
      }, params.duration || defaultDuring)
    }
  }, [defaultDuring, mounted, params.duration])

  return <ToastContext.Provider value={{
    notify: (props) => {
      setMounted(true)
      setParams(props)
    },
    close: () => setMounted(false),
  }}>
    {mounted && <Toast {...params} />}
    {children}
  </ToastContext.Provider>
}

Toast.notify = ({
  type,
  size = 'md',
  message,
  duration,
  className,
  customComponent,
  onClose,
}: Pick<IToastProps, 'type' | 'size' | 'message' | 'duration' | 'className' | 'customComponent' | 'onClose'>) => {
  const defaultDuring = (type === 'success' || type === 'info') ? 3000 : 6000
  if (typeof window === 'object') {
    const holder = document.createElement('div')
    const root = createRoot(holder)

    root.render(
      <ToastContext.Provider value={{
        notify: noop,
        close: () => {
          if (holder) {
            root.unmount()
            holder.remove()
          }
          onClose?.()
        },
      }}>
        <Toast type={type} size={size} message={message} duration={duration} className={className} customComponent={customComponent} />
      </ToastContext.Provider>,
    )
    document.body.appendChild(holder)
    setTimeout(() => {
      if (holder) {
        root.unmount()
        holder.remove()
      }
      onClose?.()
    }, duration || defaultDuring)
  }
}

export default Toast
