

import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import Toast from '@/components/base/Toast'
import PasswordEditModal from './password-edit-modal'
import UserEditModal from './user-edit-modal'
import TaskEditModal from './task-edit-modal'
import { updateBatchTasks } from '@/service/schedule'
import { StudyGoal } from "@/components/function/Canlendar"
import { useAuthStore } from '@/stores/use-auth-store';
import { updateUser, resetPassword } from '@/service/login';
import { changeLanguage } from '@/i18n/i18next-config'
import { default as Languages } from '@/i18n/language'
import { getLocale } from "@/i18n/index"
import { RiCloseLine } from '@remixicon/react'
import { useNavigate } from "react-router-dom"
import Button from "@/components/base/Button"
import {SimpleSelect} from "@/components/base/Select"
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react"

const Setting = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, updateUser: updateUserInStore } = useAuthStore(); // 获取updateUser方法
  const [showPasswordEditModal, setShowPasswordEditModal] = useState(false)
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [showTaskEditModal, setShowTaskEditModal] = useState(false)

  const [show, setShow] = useState(false)

  const handlePasswordSave = async (data: { oldPassword: string, newPassword: string }) => {
    // 处理密码保存逻辑
    try {
      await resetPassword(data)
      Toast.notify({ type: 'success', message: t('operate.success.passwordResetSuccess') })
      setShowPasswordEditModal(false)
    } catch (e) {
      console.error('重置密码失败: ', e)
      Toast.notify({ type: 'error', message: t('operate.error.passwordResetFailed') })
    }
  }

  const handleUserSave = async (data: { name: string, email: string }) => {
    // 处理用户保存逻辑
    try {
      await updateUser(data)
      // 同步更新store中的用户信息
      updateUserInStore(data)
      Toast.notify({ type: 'success', message: t('operate.success.userInfoSaveSuccess') })
      setShowUserEditModal(false)
    } catch (e) {
      console.error('保存用户信息失败: ', e)
      Toast.notify({ type: 'error', message: t('operate.error.userInfoSaveFailed') })
    }
  }

  const handleTaskSave = async (date: string, newTasks: StudyGoal[]) => {
    try {
      await updateBatchTasks(date, newTasks)
      Toast.notify({ type: 'success', message: t('operate.success.taskSaveSuccess') })
      setShowTaskEditModal(false)
    } catch (e) {
      console.error('保存任务失败: ', e)
      Toast.notify({ type: 'error', message: t('operate.error.taskSaveFailed') })
    }
  }

  return (
    <div className="w-full bg-bg-primary-200">
    <div className="max-w-4xl mx-auto p-6 bg-bg-primary">
      {/* 页面标题 */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{t('common.settings.title')}</h1>
          <p className="text-text-secondary text-sm">{t('common.settings.description')}</p>
        </div>
        <RiCloseLine className="w-6 h-6 text-text-primary cursor-pointer" onClick={() => navigate('/')} />
      </div>

      {/* 设置内容 */}
      <div className="space-y-6">
        {/* 用户设置 */}
        <div className="p-6 border border-border-primary rounded-lg box-shadow-md">
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
              <Button
                className="px-4 py-2 text-sm font-medium rounded-md"
                onClick={() => setShowUserEditModal(true)}
              >
                {t('common.settings.editButton')}
              </Button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border-secondary last:border-b-0">
              <div>
                <h3 className="font-medium text-text-primary">{t('common.settings.accountSecurity')}</h3>
                <p className="text-sm text-text-secondary">{t('common.settings.accountSecurityDesc')}</p>
              </div>
              <Button
                className="px-4 py-2 text-sm font-medium rounded-md"
                onClick={() => setShowPasswordEditModal(true)}
              >
                {t('common.settings.manageButton')}
              </Button>
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
              <SimpleSelect
                defaultValue={getLocale()}
                className="!w-32 text-center py-2 !text-white text-sm font-medium cursor-pointer !bg-primary"
                items={Languages.map((item) => ({
                  value: item.value,
                  name: item.name,
                }))}
                onSelect={(value) => changeLanguage(value.value)}
                renderTrigger={(item) => (
                  <div className="flex items-center w-full bg-primary px-4 justify-between items-center" onClick={() => setShow(!show)}>
                    <span className="truncate text-sm font-medium text-white">{item?.name ?? '请选择'}</span>
                    { show ? <RiArrowUpSLine className="w-4 h-4 text-white" /> : <RiArrowDownSLine className="w-4 h-4 text-white" /> }
                  </div>
                )}
                optionWrapClassName="!bg-primary-200 flex flex-col gap-1 focus:outline-none"
                optionClassName="text-center py-2 hover:bg-tertiary text-white bg-primary"
                notClearable={true}
              />
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
              <Button
                className="px-4 py-2 text-sm font-medium rounded-md"
                onClick={() => setShowTaskEditModal(true)}
              >
                {t('common.settings.editTaskButton')}
              </Button>
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
    </div>
  )
}

export default Setting