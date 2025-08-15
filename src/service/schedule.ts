import { get, put, post } from "./base"
import { StudyGoal } from "@/components/base/canlendar"

export const getTaskDaily = async (date?: string) => {
    const url = date ? 'tasks/daily?date=' + date : 'tasks/daily'
    return get(url).json<{ data: { 
        tasks: StudyGoal[],
        stats: {
            total: number,
            completed: number,
            pending: number
        }
    }}>()
}

// PUT /api/tasks/daily/:taskId computed
export const updateTask = async (taskId: string, params: StudyGoal) => {
    return put('tasks/daily/' + taskId, params).json()
}

// daily/bulk
export const updateBatchTasks = async (date: string, params: StudyGoal[]) => {
    return post('tasks/daily/bulk', { date: date, data: params }).json()
}
