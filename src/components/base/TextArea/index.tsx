import type { CSSProperties } from 'react'
import React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'

const textareaVariants = cva(
  '',
  {
    variants: {
      size: {
        small: 'py-1 rounded-md font-normal text-xs',
        regular: 'px-3 rounded-md font-normal text-sm',
        large: 'px-4 rounded-lg font-medium text-base',
      },
    },
    defaultVariants: {
      size: 'regular',
    },
  },
)

export type TextareaProps = {
  value: string
  disabled?: boolean
  destructive?: boolean
  styleCss?: CSSProperties
} & React.TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps<typeof textareaVariants>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, disabled, size, destructive, styleCss, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        style={styleCss}
        className={`
          min-h-20 w-full appearance-none border border-transparent bg-primary-50 p-2 text-text-primary caret-secondary outline-none placeholder:text-text-tertiary hover:border-border-dark hover:bg-primary-50 focus:border-border-dark focus:bg-primary-50 focus:box-shadow-xs
          ${textareaVariants({ size })}
          ${disabled && 'cursor-not-allowed !border-transparent !bg-gray-100 !text-text-disabled hover:border-transparent hover:bg-gray-100'}
          ${destructive && '!border-error !bg-error-50 !caret-error !text-error-600 hover:border-error-200 hover:bg-error-50 focus:border-error focus:bg-error-50'}
          ${className}
        `}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      >
      </textarea>
    )
  },
)
Textarea.displayName = 'Textarea'

export default Textarea
export { Textarea, textareaVariants }
