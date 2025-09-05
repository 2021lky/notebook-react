import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { RiCloseLine } from '@remixicon/react'
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
  onClose = () => {},
  title,
  children,
  closable = false,
  overflowVisible = false,
}: IModal) {
  return (
    <Transition appear show={isShow} as={Fragment}>
      {/* 只有点击「DialogPanel（弹窗面板）之外的 “非内容区域”」时，才会触发 onClose 关闭弹窗。 */}
      <Dialog as="div" className={`${wrapperClassName}`} onClose={onClose}>
        {/* 模态遮罩层，通过 CSS 样式实现全屏覆盖、视觉遮罩效果 */}
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed top-0 left-0 right-0 bottom-0 z-[996]" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}} 
          />
        </TransitionChild>

        <div
          className="fixed z-[997] inset-0 overflow-y-auto"  // inset-0 等效于top-0 left-0 right-0 bottom-0
        >
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"         // 进入动画：300ms 缓出
              enterFrom="opacity-0 scale-95"        // 进入起点：透明 + 缩小95%
              enterTo="opacity-100 scale-100"       // 进入终点：不透明 + 正常大小
              leave="ease-in duration-200"          // 离开动画：200ms 缓入
              leaveFrom="opacity-100 scale-100"     // 离开起点：不透明 + 正常大小
              leaveTo="opacity-0 scale-95"  
            >
              <DialogPanel className={`
                w-full max-w-[480px] rounded-2xl bg-white p-6 text-left align-middle shadow-xl
                ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}
                rounded-xl
                ${className || ''}
              `}>
                <div className="flex justify-between items-center mb-4">
                  {title && <DialogTitle
                    as="h3"
                    className="text-lg font-semibold text-[#0f172a]"
                  >
                    {title}
                  </DialogTitle>}

                  {closable && (
                    <RiCloseLine className='h-4 w-4 text-[#0f172a] cursor-pointer' onClick={(e) => { e.stopPropagation(); onClose() }}/>
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
