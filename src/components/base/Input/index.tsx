import type { CSSProperties } from 'react'
import React from 'react'
import { RiCloseCircleFill, RiErrorWarningLine, RiSearchLine } from '@remixicon/react'
import { type VariantProps, cva } from 'class-variance-authority'


export const inputVariants = cva(
  '',  // 基础样式，所有变体共享
  {
    variants: { // 定义变体变量
      size: {  // 控制弧角的大小以及字体的大小
        regular: 'px-3 rounded-md font-normal text-sm',
        large: 'px-4 rounded-lg font-medium text-base',
      },
    },
    defaultVariants: {  // 默认变体
      size: 'regular',
    },
  },
)

export type InputProps = {
  showLeftIcon?: boolean  // 是否展示左侧搜索图标
  showClearIcon?: boolean  // 是否展示右侧清除图标
  onClear?: () => void  // 清除函数
  disabled?: boolean  // 禁用状态
  destructive?: boolean  // 危险状态
  wrapperClassName?: string  // 包裹类名
  styleCss?: CSSProperties // 自定义样式
  unit?: string  // 单位
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & VariantProps<typeof inputVariants>  // input组件的其他属性（清除size），加上cva的变体属性

const Input = ({
  size,
  disabled,
  destructive=false,
  showLeftIcon,
  showClearIcon,
  onClear,
  wrapperClassName,
  className,
  styleCss,
  value,
  placeholder,
  onChange,
  unit,
  ...props
}: InputProps) => {
  return (
    // Tailwind 工具类的覆盖关系不取决于 className 中书写的顺序，而是取决于这些工具类在 Tailwind 最终生成的 CSS 文件中的顺序。
    // 所有 Tailwind 工具类都是「单类选择器」（优先级相同），此时 CSS 的「后者覆盖前者」规则就由它们在样式表中的物理顺序决定
    <div className={`relative w-full ${wrapperClassName}`}>
      {showLeftIcon && <RiSearchLine className={'absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary'} />}
      <input
        style={styleCss}
        // appearance-none：移除浏览器对 input 元素的默认样式
        // 设置未聚焦时边框为透明色，背景为灰色，垂直方向上下边距为 7px
        // 字体颜色为文本填充颜色，占位符字体颜色为文本占位符颜色
        // 交互状态样式（hover/focus）
        className={`
          w-full appearance-none border border-border-color bg-primary-50 py-[7px] text-text-primary caret-secondary !outline-none placeholder:text-text-tertiary hover:border-border-dark hover:bg-tertiary-50 focus:border-border-dark focus:bg-tertiary-50 focus:box-shadow-xs
          ${inputVariants({ size })}
          ${showLeftIcon && 'pl-[26px]'}
          ${showLeftIcon && size === 'large' && 'pl-7'}
          ${showClearIcon && value && 'pr-[26px]'}
          ${showClearIcon && value && size === 'large' && 'pr-7'}
          ${destructive && 'pr-[26px]'}
          ${destructive && size === 'large' && 'pr-7'}
          ${disabled && 'cursor-not-allowed !border-transparent !bg-gray-100 !text-text-disabled hover:border-transparent hover:bg-gray-100'}
          ${destructive && '!border-error !bg-error-50 !caret-error !text-error-600 hover:border-error-200 hover:bg-error-50 focus:border-error focus:bg-error-50'}
          ${className}
        `}
        placeholder={placeholder ?? (showLeftIcon ? '搜索' : '请输入')}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {showClearIcon && value && !disabled && !destructive && (
        <div className={'group absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-[1px]'} onClick={onClear}>
          <RiCloseCircleFill className='h-3.5 w-3.5 cursor-pointer text-text-quinary group-hover:text-text-tertiary' />
        </div>
      )}
      {destructive && (
        <RiErrorWarningLine className='absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-warning' />
      )}
      {
        unit && (
          <div className='text-sm absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary'>
            {unit}
          </div>
        )
      }
    </div>
  )
}

Input.displayName = 'Input'

export default Input
