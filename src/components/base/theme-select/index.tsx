'use client'
import { ReactNode, useState, useRef } from 'react'
import ThemeModal  from './theme-variable'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/portal-to-follow-elem'

type Props = {
  data?: any
  onSelect: (data: any) => void
  children: ReactNode
}

const ThemeTrigger = ({
  data,
  onSelect,
  children
}: Props) => {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        mainAxis: 12,
        alignmentAxis: -44,
      }}
    >
      <PortalToFollowElemTrigger 
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
      >
        {children}
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent 
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
        className='z-[1000]'
      >
        <ThemeModal
          data={data}
          onSelect={onSelect}
          onClose={() => {
            setOpen(false)
          }}
        />
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default ThemeTrigger
