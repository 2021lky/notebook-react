import { useState, useEffect } from 'react'
import Modal from '@/components/base/Modal'
import Toast from '@/components/base/Toast'
import { useTranslation } from 'react-i18next'
import { RiDeleteBinLine } from '@remixicon/react'
import { StudyGoal } from '@/components/function/Canlendar'
import { getTaskDaily } from '@/service/schedule'
import Button from '@/components/base/Button'
import Input from '@/components/base/Input'

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
      Toast.notify({ type: 'warning', message: '空任务不可删除' })
      return
    }
    setTasks(prev => prev.map((task, i) => (i === index ? { ...task, title: '' } : task)))
  }

  // 修复 handleSubmit 函数 - 根据 onSave 类型定义调整
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedTask = tasks.filter(t => t.title.trim() !== '')
    if (normalizedTask.length === 0) {
      Toast.notify({ type: 'warning', message: '请添加任务' })
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
          <Input 
            id="task-date"
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2"
          />
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {tasks.map((task, index) => (
            <div key={task.id || `task-${index}`} className="flex items-center mb-2 mt-1 rounded-lg border-none transition-colors">
              <div className="mr-2 flex-shrink-0 w-[36px] h-[36px] flex items-center justify-center bg-secondary text-text-primary rounded text-sm font-medium">
                {index + 1}
              </div>
              <Input
                type="text"
                value={task.title}
                onChange={(e) => handleUpdateTask(index, e.target.value)}
                placeholder={`任务 ${index + 1}`}
                className="mr-1 flex-1 px-3 py-2"
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

        <div className="flex w-full items-center justify-end pt-4 ">
          <Button
            type="button"
            variant={"secondary"}
            onClick={onClose}
            className="cursor-pointer mr-2 px-4 py-2"
          >
            {t('operate.cancel')}
          </Button>
          <Button
            type="submit"
            className="cursor-pointer px-4 py-2"
          >
            {t('operate.confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskEditModal