import type { FC } from 'react'
import React from 'react'
//  React 加载状态指示器组件

type Props = {
  loading?: boolean
  className?: string
  children?: React.ReactNode | string
}

const Spinner: FC<Props> = ({ loading = false, children, className }) => {
  return (
    <div
      // animate-spin 设置旋转动画；rounded-full 将边框设置为圆形，设置 4px 宽的实线边框； border-r-transparent	右侧边框透明，形成旋转的 "缺口" 效果
      className={`inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-text-quaternary ${loading ? 'motion-reduce:animate-[spin_1.5s_linear_infinite]' : 'hidden'} ${className ?? ''}`}
      role="status"
    >
      <span
        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
      >Loading...</span>
      {children}
    </div>
  )
}

Spinner.displayName = 'Spinner'

export default Spinner
