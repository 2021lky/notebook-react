import { useState } from 'react'
import Modal from '@/components/base/Modal'
import { useToastContext } from '@/components/base/toast';
import { useTranslation } from 'react-i18next'
import Button from '@/components/base/Button'
import Input from '@/components/base/Input'

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
          <Input 
            id="name"
            name="name"
            type='text' 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2"
            autoComplete="name"
          />
        </div>
        <div className="flex items-center mb-2">
          <label htmlFor="email" className="w-1/4">{t('common.settings.email')}</label>
          <Input 
            id="email"
            name="email"
            type='text' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2"
            autoComplete="email"
          />
        </div>

        <div className="flex w-full items-center justify-end pt-4 ">
          <Button
            type="button"
            variant={"secondary"}
            onClick={onClose}
            className="cursor-pointer mr-2 px-4 py-2"
          >
            {t('operate.cancel')}
          </Button>
          <Button
            type="submit"
            className="cursor-pointer px-4 py-2"
          >
            {t('operate.confirm')}
          </Button>
        </div>
      </form>
     
    </Modal>
  )
}

export default UserEditModal
