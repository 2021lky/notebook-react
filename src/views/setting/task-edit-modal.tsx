import { useState, useEffect } from 'react'
import Modal from '@/components/base/modal'
import { useToastContext } from '@/components/base/toast'
import { useTranslation } from 'react-i18next'
import { RiDeleteBinLine } from '@remixicon/react'
import { StudyGoal } from '@/components/base/canlendar'
import { getTaskDaily } from '@/service/schedule'

type TaskEditModalProps = {
  open: boolean
  onClose: () => void
  onSave: (date: string, tasks: StudyGoal[]) => void // 添加 date 参数
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  onClose,
  onSave,
  open
}) => {
  const { t } = useTranslation()
  const { notify } = useToastContext()

  const [tasks, setTasks] = useState<StudyGoal[]>([])
  // 修复第36行 - 初始化为今天的日期
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
  })
  
  const handleUpdateTask = (index: number, title: string) => {
    setTasks(prev => prev.map((task, i) => (i === index ? { ...task, title } : task)))
  }

  const handleDeleteTask = (index: number) => {
    const task = tasks[index]
    if (!task.title.trim()) {
      notify({ type: 'warning', message: '空任务不可删除' })
      return
    }
    setTasks(prev => prev.map((task, i) => (i === index ? { ...task, title: '' } : task)))
  }

  // 修复 handleSubmit 函数 - 根据 onSave 类型定义调整
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedTask = tasks.filter(t => t.title.trim() !== '')
    if (normalizedTask.length === 0) {
      notify({ type: 'warning', message: '请添加任务' })
      return
    }
    onSave(date, normalizedTask)
  }

  useEffect(() => {
    getTaskDaily(date).then(res => {
      const newTasks = res.data.tasks
      setTasks(Array.from({ length: 6 }, (_, index) => 
        newTasks[index] || { id: '', title: '', completed: false }
      ))
    })
  }, [date])

  return (
    <Modal
      isShow={open}
      title={t('common.settings.editTask')}
      onClose={onClose}
      closable
      wrapperClassName="w-[500px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <input 
            id="task-date"
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {tasks.map((task, index) => (
            <div key={task.id || `task-${index}`} className="flex items-center mb-2 mt-1 rounded-lg border-none transition-colors">
              <div className="mr-2 flex-shrink-0 w-[36px] h-[36px] flex items-center justify-center bg-secondary text-primary rounded text-sm font-medium">
                {index + 1}
              </div>
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleUpdateTask(index, e.target.value)}
                placeholder={`任务 ${index + 1}`}
                className="mr-1 flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => handleDeleteTask(index)}
                disabled={!task.title.trim()}
                className={`flex-shrink-0 rounded-md bg-transparent  border-none hover:border-none outline-none hover:outline-none ${task.title.trim() ? 'text-red-600' : 'text-gray-300 cursor-not-allowed'}`}
                title={task.title.trim() ? '删除任务' : '空任务不可删除'}
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </div>
          ))}

        </div>

        <div className="flex w-full items-center justify-end gap-2 pt-4 ">
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

export default TaskEditModal