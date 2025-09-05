'use client'
import { ReactNode, useState, useRef } from 'react'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/PortalToFollowElem'
import { changeLanguage } from '@/i18n/i18next-config'
import languages from "@/i18n/language"

type Props = {
  data?: string
  children: ReactNode
}

const LanguageTrigger = ({
  data,
  children
}: Props) => {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [hover, setHover] = useState<string>(data!)
  const mouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOpen(true)
  }
  const mouseLeave=() => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 300) // 1s延迟关闭
  }
  return (
    <PortalToFollowElem
      open={open}
      onOpenChange={() => {
        setOpen(!open)
      }}
      placement='left-start'
      offset={{
        mainAxis: 12,  // 增加与触发元素的距离
        alignmentAxis: -10,  // 向上偏移一点
      }}
    >
      <PortalToFollowElemTrigger 
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
        onClick={() => {
          setOpen(!open)
        }}>
        {children}
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent 
        className='z-[1000]'
        onMouseEnter={mouseEnter}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex flex-col gap-1 w-32 card p-2 bg-secondary-200 rounded boxShadow-sm">
            {languages.map((item) => (
              <div 
                onClick={() => {
                  changeLanguage(item.value)
                  setOpen(false)
                }}
                className={`${hover === item.value ? 'bg-tertiary' : 'bg-primary-400'} rounded select-text px-2 cursor-pointer`} key={item.value}
                onMouseEnter={() => setHover(item.value)}
                onMouseLeave={() => setHover(data!)}
              >
                <span className="text-text-primary">{item.name}</span>
              </div>
            ))}
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default LanguageTrigger
