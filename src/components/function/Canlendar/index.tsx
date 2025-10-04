import { useState, useEffect } from 'react'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/PortalToFollowElem'
import Toast from '@/components/base/Toast/index'
import { useTranslation } from 'react-i18next'
import { RiCalendar2Line, RiCheckboxCircleLine, RiCheckboxBlankCircleLine } from '@remixicon/react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Tooltip from '@/components/base/tooltip'
import { getTaskDaily, updateTask } from '@/service/schedule'
import TaskEditModal from '@/views/setting/task-edit-modal'
import { updateBatchTasks } from '@/service/schedule'
import './index.css'

export type StudyGoal = {
  id: string
  title: string
  completed: boolean
}

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const Schedule = () => {
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([])
  const [value, setValue] = useState<Date>(new Date());
  const [calendarKey, setCalendarKey] = useState(0); // 用于强制重新渲染Calendar
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date()); // 跟踪日历当前显示的月份

  // 获取当日计划
  useEffect(() => {
    if (!open) {
      return
    }
    getTaskDaily().then(res => {
      setStudyGoals(res.data?.tasks || [])
    }).catch(err => {
      console.log(err)
    })
  }, [open])

  // 根据当前语言设置locale
  const getCalendarLocale = () => {
    return i18n.language === 'zh' ? 'zh-CN' : 'en-US';
  };
  // 监听语言变化，强制重新渲染Calendar组件
  useEffect(() => {
    setCalendarKey(prev => prev + 1);
  }, [i18n.language]);

  const onChange = (newValue: Value) => {
    // newValue Fri Aug 22 2025 00:00:00 GMT+0800 (中国标准时间) 转换成 YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      // 月份和日期需要补零（确保两位数）
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let formattedDate = '';
    if (newValue instanceof Date) {
      setValue(newValue);
      formattedDate = formatDate(newValue);
    } else if (Array.isArray(newValue) && newValue[0] instanceof Date) {
      setValue(newValue[0]);
      formattedDate = formatDate(newValue[0]);
    }
    getTaskDaily(formattedDate).then(async res => {
      setStudyGoals(res.data.tasks || [])
    }).catch(error => {
      console.error('获取日程数据失败:', error)
    })
  };

  // 处理日历视图变化（月份切换）
  const onActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setActiveStartDate(activeStartDate);
    }
  };

  // 切换学习目标完成状态
  const toggleGoalCompletion = (goalId: string) => {
    setStudyGoals(prev =>
      prev.map(goal => {
        if (goal.id === goalId) {
          // 发送请求
          updateTask(goalId, {
            completed: !goal.completed,
            title: goal.title,
            id: goal.id,
          }).then(res => {
            console.log(res)
          }).catch(err => {
            console.log(err)
          })
          return {
            ...goal,
            completed: !goal.completed,
          }
        }
        return goal
      })
    )
  }

  // 判断日期是否属于当前显示的月份
  const isSameMonth = (date: Date) => {
    return date.getMonth() === activeStartDate.getMonth() &&
      date.getFullYear() === activeStartDate.getFullYear();
  };

  // 计算完成进度
  const completedCount = studyGoals.filter(goal => goal.completed).length
  const totalCount = studyGoals.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const [showTaskEditModal, setShowTaskEditModal] = useState(false);
  const handleTaskSave = async (date: string, newTasks: StudyGoal[]) => {
    try {
      await updateBatchTasks(date, newTasks)
      Toast.notify({ type: 'success', message: t('operate.success.taskSaveSuccess') })
      // 强制渲染组件
      setCalendarKey(prev => prev + 1);
      setShowTaskEditModal(false)
    } catch (e) {
      console.error('保存任务失败: ', e)
      Toast.notify({ type: 'error', message: t('operate.error.taskSaveFailed') })
    }
  }
  return (
    <PortalToFollowElem
      open={open}
      onOpenChange={() => {
        setOpen(!open)
      }}
      placement='left-start'
      offset={{
        mainAxis: 8,  // 增加与触发元素的距离
        alignmentAxis: -124,
      }}
    >
      <PortalToFollowElemTrigger onClick={() => {
        if (!open) {
          setValue(new Date())
        }
        setOpen(!open)
      }}>
        <div className="flex items-center rounded-lg p-2 hover:bg-secondary-200 cursor-pointer transition-colors">
          <RiCalendar2Line className="w-5 h-5 text-text-primary" />
          <div className="text-text-primary text-xs">{t('common.studyPlan.progress', { progress: Math.round(progressPercentage) })}</div>
        </div>
      </PortalToFollowElemTrigger>

      <PortalToFollowElemContent className='z-[100] w-96'>
        <div className="flex flex-col gap-1 px-4 py-2 rounded bg-secondary-200">
          <div
            className="bg-secondary-300 rounded p-2 mb-4"
          >
            <Calendar
              key={calendarKey}
              onChange={onChange}
              value={value}
              locale={getCalendarLocale()}
              className="w-full"
              onActiveStartDateChange={onActiveStartDateChange}
              tileContent={({ date, view }) => {
                if (view === 'month' && !isSameMonth(date)) {
                  return null; // 完全隐藏非当前月份的日期
                }
                // 如果是今天，显示"今"字
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                if (isToday) {
                  return (
                    <Tooltip
                      needsDelay={true}
                      popupContent={studyGoals.length > 0 ? t('common.studyPlan.task', { total: totalCount }) : t('common.common.noArrangement')}
                      popupClassName="bg-white rounded text-sm max-w-32 text-text-primary"
                    >
                      <div className="today-text">{t('common.studyPlan.today')}</div>
                    </Tooltip>
                  );
                }
                // 为其他日期添加Tooltip
                return (
                  <Tooltip
                    needsDelay={true}
                    popupContent={studyGoals.length > 0 ? t('common.studyPlan.task', { total: totalCount }) : t('common.common.noArrangement')}
                    popupClassName="bg-white rounded text-sm max-w-32 text-text-primary"
                  >
                    <div className="date-text"></div>
                  </Tooltip>
                );
              }}
              tileClassName={({ date, view }) => {
                if (view === 'month') {
                  if (!isSameMonth(date)) {
                    return 'hidden-tile'; // 隐藏非当前月份的日期
                  }
                  const isSelected = value.toDateString() === date.toDateString();
                  const today = new Date();
                  const isToday = date.toDateString() === today.toDateString();

                  let className = '';
                  if (isSelected) {
                    className += 'custom-today-tile';
                  }
                  if (isToday) {
                    className += (className ? ' ' : '') + 'today-tile';
                  }
                  return className;
                }
                return '';
              }}
            />
          </div>
          {/* 添加任务 */}
          {studyGoals.length === 0 && <a onClick={() => setShowTaskEditModal(true)}> {t("common.studyPlan.addTask")} </a>}
          {/* 学习进度 */}
          {studyGoals.length > 0 && <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-text-primary">
                {t('common.studyPlan.taskProcess')}
              </h3>
              <span className="text-sm text-text-secondary">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-bg-primary rounded-full h-2">
              <div
                className="bg-tertiary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>}

          {/* 今日学习目标 */}
          {studyGoals.length > 0 && <div>
            <h3 className="text-sm font-medium text-text-primary mb-3">
              {t('common.studyPlan.studyTask')}
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {studyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-transparent cursor-pointer"
                  onClick={() => toggleGoalCompletion(goal.id)}
                >
                  {goal.completed ? (
                    <RiCheckboxCircleLine className="w-4 h-4 text-text-primary flex-shrink-0" />
                  ) : (
                    <RiCheckboxBlankCircleLine className="w-4 h-4 text-text-disabled flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm flex-1 truncate ${goal.completed
                        ? 'text-text-primary'
                        : 'text-text-disabled'
                      }`}
                    title={goal.title}
                  >
                    {goal.title}
                  </span>
                </div>
              ))}
            </div>
          </div>}

          {/* 底部统计 */}
          {studyGoals.length > 0 && <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-text-primary text-center">
              {completedCount > 0 && (
                <span className="text-text-primary">
                  {t('common.studyPlan.completed', { completed: completedCount })}
                </span>
              )}
              {totalCount - completedCount > 0 && (
                <span className={completedCount > 0 ? 'ml-2 text-text-primary' : 'text-text-primary'}>
                  {t('common.studyPlan.remaining', { remaining: totalCount - completedCount })}
                </span>
              )}
            </div>
          </div>}

          <TaskEditModal
            open={showTaskEditModal}
            onClose={() => setShowTaskEditModal(false)}
            onSave={handleTaskSave}
          />
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default Schedule