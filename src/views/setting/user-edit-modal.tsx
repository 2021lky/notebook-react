import { useState } from 'react'
import Modal from '@/components/base/modal'
import { useToastContext } from '@/components/base/toast';
import { useTranslation } from 'react-i18next'

type UserEditModalProps = {
  open: boolean;
  onClose: () => void
  onSave: (data: { name: string, email: string}) => void
  user?: any
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  onClose,
  onSave,
  open,
  user
}) => {
  const { t } = useTranslation()
  const { notify } = useToastContext()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 验证
    
    // 用户名不能为空验证
    if (!name.trim()) {
      notify({
        type: 'error',
        message: t('operate.error.nameNoNone')
      })
      return
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      notify({
        type: 'error',
        message: t('operate.error..emailNoNone')
      })
      return
    }
    
    if (!emailRegex.test(email)) {
      notify({
        type: 'error',
        message: t('operate.error.emailValid')
      })
      return
    }
    onSave({ name, email })
  }
  return (
    <Modal 
      isShow={open}
      title={t('common.settings.editUser')}
      onClose={onClose}
      closable
      wrapperClassName='w-[400px]'
    >
       <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center mb-2">
          <label htmlFor="name" className="w-1/4">{t('common.settings.name')}</label>
          <input 
            id="name"
            name="name"
            type='text' 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="name"
          />
        </div>
        <div className="flex items-center mb-2">
          <label htmlFor="email" className="w-1/4">{t('common.settings.email')}</label>
          <input 
            id="email"
            name="email"
            type='text' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="email"
          />
        </div>

        <div className="flex w-full items-center justify-end pt-4 ">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer mr-2 px-4 py-2 text-sm font-medium bg-white rounded-md border border-gray-300 rounded-md"
          >
            {t('operate.cancel')}
          </button>
          <button
            type="submit"
            className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-tertiary rounded-md border-none rounded-md"
          >
            {t('operate.confirm')}
          </button>
        </div>
      </form>
     
    </Modal>
  )
}

export default UserEditModal
