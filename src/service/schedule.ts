import { get, put, post } from "./base"
import { StudyGoal } from "@/components/function/Canlendar"

interface TaskResponse {
    data: {
        tasks: StudyGoal[],
        stats: {
            total: number,
            completed: number,
            pending: number
        }
    }
}
export const getTaskDaily = async (date?: string): Promise<TaskResponse> => {
    const url = date ? 'tasks/daily?date=' + date : 'tasks/daily'
    return get(url)
}

// PUT /api/tasks/daily/:taskId computed
export const updateTask = async (taskId: string, params: StudyGoal) => {
    return put('tasks/daily/' + taskId, { body: { ...params } })
}

// daily/bulk
export const updateBatchTasks = async (date: string, params: StudyGoal[]) => {
    return post('tasks/daily/bulk', { body: { date: date, data: params } })
}
