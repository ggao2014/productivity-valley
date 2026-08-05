import type { GameIconName } from '../assets/icons/GameIcon'
import type { TaskCategory } from './types'

export const TASK_CATEGORIES: Array<{
  id: TaskCategory
  label: string
  icon: GameIconName
}> = [
  { id: 'work', label: '工作', icon: 'briefcase' },
  { id: 'study', label: '学习', icon: 'book' },
  { id: 'life', label: '生活', icon: 'home' },
  { id: 'health', label: '健康', icon: 'heart' },
  { id: 'errand', label: '杂事', icon: 'basket' },
]

export function taskCategory(category?: TaskCategory) {
  return TASK_CATEGORIES.find((item) => item.id === category) ?? TASK_CATEGORIES[4]
}
