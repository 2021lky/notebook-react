import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { RiCloseLine } from '@remixicon/react'
import { noop } from 'lodash-es'
// https://headlessui.com/react/dialog

type IModal = {
  className?: string
  wrapperClassName?: string
  isShow: boolean
  onClose?: () => void
  title?: React.ReactNode
  children?: React.ReactNode
  closable?: boolean
  overflowVisible?: boolean
}

export default function Modal({
  className,
  wrapperClassName,
  isShow,
  onClose = noop,
  title,
  children,
  closable = false,
  overflowVisible = false,
}: IModal) {
  return (
    <Transition appear show={isShow} as={Fragment}>
      {/* 仅作为堆叠上下文容器，不再使用内联 fixed/transform */}
      <Dialog as="div" className={`z-[999] ${wrapperClassName}`} onClose={onClose}
      >
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed top-0 left-0 right-0 z-[1]" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', 
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               zIndex: 996 }} />
        </TransitionChild>

        <div
          className="fixed inset-0 overflow-y-auto"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 997
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <TransitionChild>
              <DialogPanel className={`
                w-full max-w-[480px] rounded-2xl bg-white p-6 text-left align-middle shadow-xl
                ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}
                duration-100 ease-in data-[closed]:opacity-0 data-[closed]:scale-95
                data-[enter]:opacity-100 data-[enter]:scale-100
                data-[leave]:opacity-0 data-[leave]:scale-95
                rounded-xl
                ${className || ''}
              `}>
                <div className="flex justify-between items-center mb-4">
                  {title && <DialogTitle
                    as="h3"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </DialogTitle>}

                  {closable && (
                    <RiCloseLine className='h-4 w-4 text-primary cursor-pointer' onClick={(e) => { e.stopPropagation(); onClose() }}/>
                  )}
                </div>
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
