'use client'
import { useState } from 'react'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/PortalToFollowElem'
import { useTranslation } from 'react-i18next'
import { RiLogoutCircleRLine } from '@remixicon/react'
import LanguageTrigger from './language-trigger'
import { getLocale } from "@/i18n/index"
import ThemeTrigger from "@/components/function/theme-select"
import { useTheme } from "@/contexts/theme-context"
import getThemeColors  from "@/components/function/theme-select/theme-colors"
import { useAuth } from "@/hooks/use-auth"
import { useNavigate } from "react-router-dom"

type Props = {
  data: any
}

const Account = ({
  data
}: Props) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { setTheme, theme } = useTheme()
  const themeColors = getThemeColors()
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <PortalToFollowElem
      open={open}
      onOpenChange={() => {
        setOpen(!open)
      }}
      placement='bottom-end'
      offset={{
        mainAxis: 8,
        alignmentAxis: 0,
      }}
    >
      <PortalToFollowElemTrigger onClick={() => {
        setOpen(!open)
      }}>
        <div className="flex items-center">
          <img src="/avatar.jpg" className="w-8 h-8 rounded-full" />
          <div className="text-text-primary">{data?.name}</div>
        </div>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className='z-[1000]'>
        <div className="flex flex-col gap-1 w-26 rounded-md p-2 bg-secondary-200 boxShadow-sm">
            <LanguageTrigger data={getLocale()}>
                <div className="cursor-pointer rounded select-text pl-2 hover:bg-tertiary bg-primary-400 text-text-primary">
                    {t('common.account.language')}
                </div>
            </LanguageTrigger>
            <ThemeTrigger
            onSelect={(theme) => {
              setTheme(theme.value)
              setOpen(false)
            }}
            data={themeColors.find((item) => item.value === theme)}
            >
              <div className="cursor-pointer rounded select-text pl-2 hover:bg-tertiary bg-primary-400 text-text-primary">
                  {t('common.account.theme')}
              </div>
            </ThemeTrigger>
            <div 
              onClick={() => {
                setOpen(false)
                navigate('/setting')
              }}
              className="cursor-pointer rounded select-text pl-2 hover:bg-tertiary bg-primary-400 text-text-primary"
            >
                {t('common.account.setting')}
            </div>
            <div 
              onClick={() => {
                  logout()
                  setOpen(false)
                  navigate('/signin')
              }}
              className="flex items-center cursor-pointer rounded select-text pl-2 hover:bg-tertiary bg-primary-400 text-text-primary"
            >
                <div>{t('common.account.logout')}</div>
                <RiLogoutCircleRLine className="w-4 h-4" />
            </div>
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default Account
