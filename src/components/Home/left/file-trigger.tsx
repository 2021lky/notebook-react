'use client'
import { useState } from 'react'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/portal-to-follow-elem'
import { RiMoreLine } from '@remixicon/react'
import { TreeNodeData } from './index'
import { useFileTreeOperations } from '@/hooks/use-file-tree-operations'
import { useTranslation } from 'react-i18next'

const FileMoreTrigger = ({ data }: { data: TreeNodeData }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState("")
  const { handleDeleteNode, handleRenameNode, confirmOperation } = useFileTreeOperations()

  return (
    <PortalToFollowElem
      open={open}
      onOpenChange={() => setOpen(!open)}
    >
      <PortalToFollowElemTrigger onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
      >
        <RiMoreLine className="custom-more-icon"/>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="flex flex-col gap-1 w-24 card p-2 bg-secondary">
          <div className={`${hover === "rename" ? 'bg-tertiary' : 'bg-white'} rounded select-text px-2 cursor-pointer`} 
            onMouseEnter={() => setHover("rename")} onMouseLeave={() => setHover("")} onClick={() => {
              const newName = prompt(t('common.fileOperations.inputNewFileName'), data.title)
              if (newName && newName.trim() && newName !== data.title) {
                handleRenameNode(data.key, newName.trim(), data.title)
              }
              setOpen(false)
            }}>{t('common.fileOperations.rename')}</div>
          <div className={`${hover === "delete" ? 'bg-tertiary' : 'bg-white'} rounded select-text px-2 cursor-pointer`} 
            onMouseEnter={() => setHover("delete")} onMouseLeave={() => setHover("")} onClick={() => {
              confirmOperation(
                t('common.fileOperations.confirmDeleteFile', { fileName: data.title }),
                () => {
                  handleDeleteNode(data.key, data.title)
                  setOpen(false)
                }
              )
            }}>{t('common.fileOperations.delete')}</div>
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default FileMoreTrigger