'use client'
import { useState } from 'react'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/portal-to-follow-elem'
import { useTranslation } from 'react-i18next'
import { RiLogoutCircleRLine } from '@remixicon/react'
import LanguageTrigger from './language-trigger'
import { getLocale } from "@/i18n/index"
import ThemeTrigger from "@/components/base/theme-select"
import { useThemeContext } from "@/contexts/theme-context"
import getThemeColors  from "@/components/base/theme-select/theme-colors"
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
  const { triggerTheme, theme } = useThemeContext()
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
          <img src="/avatar.jpg" className="w-6 h-6 rounded-full" />
          <div>{data?.name}</div>
        </div>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className='z-[1000]'>
        <div className="flex flex-col gap-sm w-24 card p-2 bg-secondary">
            <LanguageTrigger data={getLocale()}>
                <div className="cursor-pointer rounded select-text pl-2 hover:bg-tertiary bg-white">
                    {t('common.account.language')}
                </div>
            </LanguageTrigger>
            <ThemeTrigger
            onSelect={(theme) => {
              triggerTheme(theme.primary)
              setOpen(false)
            }}
            data={themeColors.find((item) => item.primary === theme.colorTheme)}
            >
              <div className="cursor-pointer rounded select-text pl-2 hover:bg-tertiary bg-white">
                  {t('common.account.theme')}
              </div>
            </ThemeTrigger>
            <div 
              onClick={() => {
                setOpen(false)
                navigate('/setting')
              }}
              className="cursor-pointer rounded select-text pl-2 hover:bg-tertiary bg-white"
            >
                {t('common.account.setting')}
            </div>
            <div 
              onClick={() => {
                  logout()
                  setOpen(false)
                  navigate('/signin')
              }}
              className="flex items-center cursor-pointer rounded select-text pl-2 hover:bg-tertiary bg-white"
            >
                <div>{t('common.account.logout')}</div>
                <RiLogoutCircleRLine style={{width: '16px', height: '16px'}} />
            </div>
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default Account
