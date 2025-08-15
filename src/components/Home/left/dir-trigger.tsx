'use client'
import { ReactNode, useState, useRef } from 'react'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/portal-to-follow-elem'
import { RiMoreLine } from '@remixicon/react'
import { TreeNodeData } from './index'
import { useFileTreeOperations } from '@/hooks/use-file-tree-operations'
import { useTranslation } from 'react-i18next'

const DirMoreTrigger = ({ data }: { data: TreeNodeData }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState("")
  const { handleCreateFile, handleCreateDir, handleDeleteNode, handleRenameNode, confirmOperation } = useFileTreeOperations()

  
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
        <RiMoreLine className="custom-more-icon" />
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="flex flex-col gap-1 w-28 card p-2 bg-secondary">
          <div 
            className={`${hover === "mkdirfile" ? 'bg-tertiary' : 'bg-white'} rounded select-text px-2 cursor-pointer`}
            onMouseEnter={() => setHover("mkdirfile")} onMouseLeave={() => setHover("")} onClick={() => {
              const fileName = prompt(t('common.fileOperations.inputFileName'))
              if (fileName && fileName.trim()) {
                handleCreateFile(data.key, fileName.trim())
              }
              setOpen(false)
            }}>{t('common.fileOperations.createFile')}</div>
          <div 
            className={`${hover === "mkdir" ? 'bg-tertiary' : 'bg-white'} rounded select-text px-2 cursor-pointer`}
            onMouseEnter={() => setHover("mkdir")} onMouseLeave={() => setHover("")} onClick={() => {
              const dirName = prompt(t('common.fileOperations.inputFolderName'))
              if (dirName && dirName.trim()) {
                handleCreateDir(data.key, dirName.trim())
              }
              setOpen(false)
            }}>{t('common.fileOperations.createFolder')}</div>
          <div 
            className={`${hover === "delete" ? 'bg-tertiary' : 'bg-white'} rounded select-text px-2 cursor-pointer`}
            onMouseEnter={() => setHover("delete")} onMouseLeave={() => setHover("")} onClick={() => {
              confirmOperation(
                t('common.fileOperations.confirmDeleteFolder', { folderName: data.title }),
                () => {
                  handleDeleteNode(data.key, data.title)
                  setOpen(false)
                }
              )
            }}>{t('common.fileOperations.delete')}</div>
          <div 
            className={`${hover === "rename" ? 'bg-tertiary' : 'bg-white'} rounded select-text px-2 cursor-pointer`}
            onMouseEnter={() => setHover("rename")} onMouseLeave={() => setHover("")} onClick={() => {
              const newName = prompt(t('common.fileOperations.inputNewFolderName'), data.title)
              if (newName && newName.trim() && newName !== data.title) {
                handleRenameNode(data.key, newName.trim(), data.title)
              }
              setOpen(false)
            }}>{t('common.fileOperations.rename')}</div>
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default DirMoreTrigger