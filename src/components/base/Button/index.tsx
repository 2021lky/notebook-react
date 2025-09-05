import type { CSSProperties } from 'react'
import React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import Spinner from '../Spinner'
import './index.css'
import { useThrottleFn } from 'ahooks'

const buttonVariants = cva(
  'btn',
  {
    variants: {
      variant: {
        'primary': 'btn-primary', // 主要按钮
        'warning': 'btn-warning', // 警告按钮
        'success': 'btn-success', // 成功按钮
        'info': 'btn-info', // 信息按钮
        'danger': 'btn-danger', // 危险按钮
        "secondary": "btn-secondary", // 次要按钮
      },
      size: {
        small: 'btn-small',
        medium: 'btn-medium',
        large: 'btn-large',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  },
)

export type ButtonProps = {
  disabled?: boolean
  loading?: boolean
  styleCss?: CSSProperties
  spinnerClassName?: string
  // 节流相关
  throttle?: boolean
  throttleWait?: number
  throttleLeading?: boolean
  throttleTrailing?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

// React.forwardRef 用于将 ref 转发到子组件，解决函数组件无法直接直接接收 ref 属性的问题
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size,
    disabled,
    loading,
    styleCss,
    children,
    spinnerClassName,
    // 新增：节流相关 & 把 onClick 单独解构，避免 {...props} 里再次传入
    throttle,
    throttleWait = 1000,
    throttleLeading = true,
    throttleTrailing = false,
    onClick,
    ...props
  }, ref) => {
    // 节流封装，仅当 throttle 为 true 时使用
    const { run: runThrottledClick } = useThrottleFn(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
      },
      {
        wait: throttleWait,
        leading: throttleLeading,
        trailing: throttleTrailing,
      },
    )

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault()
        return
      }
      if (throttle) {
        runThrottledClick(e)
      } else {
        onClick?.(e)
      }
    }

    return (
      <button
        type='button'
        className={`
          ${buttonVariants({ variant, size, className })}
          ${disabled && 'btn-disabled'}
        `}
        disabled={disabled}
        ref={ref}
        style={styleCss}
        onClick={handleClick}
        {...props}
      >
        {children}
        {loading && <Spinner loading={loading} className={` !text-text-primary !h-3 !w-3 !border-2 !ml-1 ${spinnerClassName}`} />}
      </button>
    )
  },
)
// 通过箭头函数或匿名函数定义的（如 const Button = () => <button />），React 无法自动推断其名称，默认会显示为 Anonymous 或 <Unknown>
Button.displayName = 'Button'

export default Button
export { Button, buttonVariants }
