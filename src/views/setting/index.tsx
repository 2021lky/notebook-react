

import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useToastContext } from '@/components/base/toast'
import PasswordEditModal from './password-edit-modal'
import UserEditModal from './user-edit-modal'
import TaskEditModal from './task-edit-modal'
import { updateBatchTasks } from '@/service/schedule'
import { StudyGoal } from "@/components/base/canlendar"
import { useAuthStore } from '@/stores/use-auth-store';
import { updateUser, resetPassword } from '@/service/login';
import { changeLanguage } from '@/i18n/i18next-config'


const Setting = () => {
  const { t, i18n } = useTranslation()
  const { notify } = useToastContext();
  const { user, updateUser: updateUserInStore } = useAuthStore(); // 获取updateUser方法
  const [showPasswordEditModal, setShowPasswordEditModal] = useState(false)
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [showTaskEditModal, setShowTaskEditModal] = useState(false)

  const handlePasswordSave = async (data: { oldPassword: string, newPassword: string }) => {
    // 处理密码保存逻辑
    try {
      await resetPassword(data)
      notify({ type: 'success', message: t('operate.success.passwordResetSuccess') })
      setShowPasswordEditModal(false)
    } catch (e) {
      console.error('重置密码失败: ', e)
      notify({ type: 'error', message: t('operate.error.passwordResetFailed') })
    }
  }

  const handleUserSave = async (data: { name: string, email: string }) => {
    // 处理用户保存逻辑
    try {
      await updateUser(data)
      // 同步更新store中的用户信息
      updateUserInStore(data)
      notify({ type: 'success', message: t('operate.success.userInfoSaveSuccess') })
      setShowUserEditModal(false)
    } catch (e) {
      console.error('保存用户信息失败: ', e)
      notify({ type: 'error', message: t('operate.error.userInfoSaveFailed') })
    }
  }

  const handleTaskSave = async (date: string, newTasks: StudyGoal[]) => {
    try {
      await updateBatchTasks(date, newTasks)
      notify({ type: 'success', message: t('operate.success.taskSaveSuccess') })
      setShowTaskEditModal(false)
    } catch (e) {
      console.error('保存任务失败: ', e)
      notify({ type: 'error', message: t('operate.error.taskSaveFailed') })
    }
  }

  return (
    <div className="theme-transition max-w-4xl mx-auto p-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('common.settings.title')}</h1>
        <p className="text-text-secondary text-sm">{t('common.settings.description')}</p>
      </div>

      {/* 设置内容 */}
      <div className="space-y-6">
        {/* 用户设置 */}
        <div className="card p-6 border border-border-primary rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('common.settings.userSettings')}</h2>
              <p className="text-text-secondary text-sm">{t('common.settings.userProfileDesc')}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border-secondary last:border-b-0">
              <div>
                <h3 className="font-medium text-text-primary">{t('common.settings.userProfile')}</h3>
                <p className="text-sm text-text-secondary">{t('common.settings.userProfileDesc')}</p>
              </div>
              <button 
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setShowUserEditModal(true)}
              >
                {t('common.settings.editButton')}
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-border-secondary last:border-b-0">
              <div>
                <h3 className="font-medium text-text-primary">{t('common.settings.accountSecurity')}</h3>
                <p className="text-sm text-text-secondary">{t('common.settings.accountSecurityDesc')}</p>
              </div>
              <button 
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setShowPasswordEditModal(true)}
              >
                {t('common.settings.manageButton')}
              </button>
            </div>
          </div>
        </div>

        {/* 语言设置 */}
        <div className="card p-6 border border-border-primary rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('common.settings.languageSettings')}</h2>
              <p className="text-text-secondary text-sm">{t('common.settings.languageRegionDesc')}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-text-primary">{t('common.settings.interfaceLanguage')}</h3>
                <p className="text-sm text-text-secondary">{t('common.settings.interfaceLanguageDesc')}</p>
              </div>
              <select 
                className="relative z-10 text-center py-2 text-sm font-medium rounded-md transition-colors outline-none hover:outline-none focus:outline-none cursor-pointer"
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="zh" className="text-center py-2 px-4 hover:bg-tertiary">🇨🇳 中文</option>
                <option value="en" className="text-center py-2 px-4 hover:bg-tertiary">🇺🇸 English</option>
              </select>
            </div>
          </div>
        </div>

        {/* 任务设置 */}
        <div className="card p-6 border border-border-primary rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('common.settings.taskSettings')}</h2>
              <p className="text-text-secondary text-sm">{t('common.settings.workflowDesc')}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border-secondary last:border-b-0">
              <div>
                <h3 className="font-medium text-text-primary">{t('common.settings.taskListManagement')}</h3>
                <p className="text-sm text-text-secondary">{t('common.settings.taskListManagementDesc')}</p>
              </div>
              <button
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                onClick={() => setShowTaskEditModal(true)}
              >
                {t('common.settings.editTaskButton')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 密码编辑弹窗 */}
      <PasswordEditModal
        open={showPasswordEditModal}
        onClose={() => setShowPasswordEditModal(false)}
        onSave={handlePasswordSave}
      />

      {/* 用户编辑弹窗 */}
      <UserEditModal
        open={showUserEditModal}
        onClose={() => setShowUserEditModal(false)}
        onSave={handleUserSave}
        user={user}
      />

      {/* 任务编辑弹窗 */}
      <TaskEditModal
        open={showTaskEditModal}
        onClose={() => setShowTaskEditModal(false)}
        onSave={handleTaskSave}
      />
    </div>
  )
}

export default Setting