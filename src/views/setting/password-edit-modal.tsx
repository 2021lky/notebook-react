import { useState } from 'react'
import Modal from '@/components/base/modal'
import { useToastContext } from '@/components/base/toast';
import { useTranslation } from 'react-i18next'

const validPassword = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

type PasswordEditModalProps = {
  open: boolean;
  onClose: () => void
  onSave: (data: { oldPassword: string, newPassword: string}) => void
}

const PasswordEditModal: React.FC<PasswordEditModalProps> = ({
  onClose,
  onSave,
  open
}) => {
  const { t } = useTranslation()
  const { notify } = useToastContext();

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = () => {
    // 校验新密码格式
    if (!validPassword.test(newPassword)) {
      notify({ type: 'warning', message: t('operate.error.passwordValid') });
      return
    }
    // 校验旧密码格式
    if (!validPassword.test(oldPassword)) {
      notify({ type: 'warning', message: t('operate.error.passwordValid') });
      return
    }

    // 校验新密码和确认密码是否一致
    if (newPassword !== confirmPassword) {
      notify({ type: 'warning', message: t('operate.error.newPasswordNotSame') });
      return
    }
    onSave({ oldPassword, newPassword })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave()
  }

  return (
    <Modal 
      isShow={open}
      title={t('common.settings.editPassword')}
      onClose={onClose}
      closable
      className='w-[400px]'
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-2">
          <label htmlFor="oldPassword" className="w-1/4">{t('common.settings.oldPassword')}</label>
          <input 
            id="oldPassword"
            name="oldPassword"
            type='password' 
            value={oldPassword} 
            onChange={(e) => setOldPassword(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
        </div>
        <div className="flex items-center mb-2">
          <label htmlFor="newPassword" className="w-1/4">{t('common.settings.newPassword')}</label>
          <input 
            id="newPassword"
            name="newPassword"
            type='password' 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
        </div>
        <div className="flex items-center mb-2">
          <label htmlFor="confirmPassword" className="w-1/4">{t('common.settings.confirmPassword')}</label>
          <input 
            id="confirmPassword"
            name="confirmPassword"
            type='password' 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
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

export default PasswordEditModal
