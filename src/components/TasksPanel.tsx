import { useMemo, useState } from 'react'
import { GameIcon } from '../assets/icons/GameIcon'
import { TASK_REWARDS } from '../core/constants'
import { activeDayStreak, localDayKey, taskCompletedOn, todayTaskProgress } from '../core/economy'
import { useGameStore } from '../core/gameStore'
import {
  HABIT_REWARD,
  HABIT_REWARD_SLOTS,
  PROJECT_REWARDS,
  habitCompletedOn,
  habitDueOn,
  habitEntryFor,
  habitWeeklyProgress,
  nextBlockReward,
  projectProgress,
} from '../core/productivity'
import {
  PLAN_SLOTS,
  PLAN_SLOT_LABELS,
  buildTimelineItems,
  groupBySlot,
  type TimelineItem,
} from '../core/plan'
import type {
  Difficulty,
  HabitSchedule,
  HabitScheduleType,
  PlanSlot,
  PlanTarget,
  Project,
  ProjectSize,
  TaskCategory,
} from '../core/types'
import { TASK_CATEGORIES, taskCategory } from '../core/taskCategories'

type TaskView = 'today' | 'habits' | 'projects'

const WEEKDAYS = [
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '五' },
  { value: 6, label: '六' },
  { value: 0, label: '日' },
]

const PROJECT_SIZE_LABELS: Record<ProjectSize, string> = {
  small: '小项目',
  medium: '中项目',
  large: '大项目',
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  small: '小任务',
  medium: '中块',
  large: '大块',
}

export function TasksPanel({ onOpenSettings }: { onOpenSettings: () => void }) {
  const state = useGameStore()
  const {
    tasks,
    habits,
    projects,
    habitRewardSnapshots,
    onboardingStep,
  } = state
  const [view, setView] = useState<TaskView>('today')

  const todayKey = localDayKey()
  const dueHabits = habits.filter((habit) => habitDueOn(habit))
  const activeProjects = projects.filter((project) => project.status === 'active')
  const rewardedHabitIds =
    habitRewardSnapshots[todayKey] ??
    habits.filter((habit) => habit.active).slice(0, HABIT_REWARD_SLOTS).map((habit) => habit.id)
  const taskToday = todayTaskProgress(tasks)
  const habitDoneToday = habits.filter((habit) => habitCompletedOn(habit)).length
  const blocksDoneToday = projects.reduce(
    (total, project) =>
      total +
      project.blocks.filter(
        (block) => block.done && block.completedAt && localDayKey(new Date(block.completedAt)) === todayKey,
      ).length,
    0,
  )
  const todayCompleted = taskToday.completed + habitDoneToday + blocksDoneToday
  const todayTotal = dueHabits.length + activeProjects.length + tasks.filter((task) => !task.done).length + taskToday.completed

  return (
    <div className="panel productivity-panel">
      <header className="desk-toolbar">
        <div><GameIcon name="book" /><h2>案头</h2></div>
        <button type="button" onClick={onOpenSettings} aria-label="打开设置" title="设置">
          <GameIcon name="settings" />
        </button>
      </header>
      <nav className="productivity-tabs" aria-label="任务分类">
        <button className={view === 'today' ? 'active' : ''} onClick={() => setView('today')}>今天</button>
        <button className={view === 'habits' ? 'active' : ''} onClick={() => setView('habits')}>习惯</button>
        <button className={view === 'projects' ? 'active' : ''} onClick={() => setView('projects')}>项目</button>
      </nav>

      {view === 'today' && (
        <>
        <section className="today-summary" aria-label="今日概况">
          <div className="today-summary-total"><span>今天</span><strong>{todayCompleted}/{Math.max(todayCompleted, todayTotal)}</strong></div>
          <div className="today-summary-items">
            <span>习惯 <b>{habitDoneToday}/{dueHabits.length}</b></span>
            <span>项目 <b>{blocksDoneToday}/{activeProjects.length}</b></span>
            <span>待办 <b>{taskToday.completed}/{tasks.filter((task) => !task.done).length + taskToday.completed}</b></span>
          </div>
          <small>{activeDayStreak(tasks)} 天活跃</small>
        </section>
        <TodayView
          rewardedHabitIds={rewardedHabitIds}
          onboardingStep={onboardingStep}
        />
        </>
      )}
      {view === 'habits' && <HabitsView rewardedHabitIds={rewardedHabitIds} />}
      {view === 'projects' && <ProjectsView />}
    </div>
  )
}

function TodayView({
  rewardedHabitIds,
  onboardingStep,
}: {
  rewardedHabitIds: string[]
  onboardingStep: number
}) {
  const tasks = useGameStore((s) => s.tasks)
  const habits = useGameStore((s) => s.habits)
  const projects = useGameStore((s) => s.projects)
  const plans = useGameStore((s) => s.plans)
  const adjustHabit = useGameStore((s) => s.adjustHabit)
  const completeProjectBlock = useGameStore((s) => s.completeProjectBlock)
  const addTask = useGameStore((s) => s.addTask)
  const editTask = useGameStore((s) => s.editTask)
  const completeTask = useGameStore((s) => s.completeTask)
  const undoCompleteTask = useGameStore((s) => s.undoCompleteTask)
  const undoProjectBlock = useGameStore((s) => s.undoProjectBlock)
  const deleteTask = useGameStore((s) => s.deleteTask)
  const setPlan = useGameStore((s) => s.setPlan)
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('small')
  const [category, setCategory] = useState<TaskCategory>('errand')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>('small')
  const [editCategory, setEditCategory] = useState<TaskCategory>('errand')

  const todayKey = localDayKey()
  const timelineItems = useMemo(
    () =>
      buildTimelineItems({
        plans: plans ?? [],
        tasks,
        habits,
        projects,
        dayKey: todayKey,
      }),
    [plans, tasks, habits, projects, todayKey],
  )
  const grouped = groupBySlot(timelineItems)
  const openCount = timelineItems.filter((item) => !item.done).length
  const doneCount = timelineItems.filter((item) => item.done).length

  function targetFor(item: TimelineItem): PlanTarget {
    if (item.kind === 'task') return { kind: 'task', id: item.task.id }
    if (item.kind === 'habit') return { kind: 'habit', id: item.habit.id }
    return { kind: 'block', projectId: item.project.id, blockId: item.blockId }
  }

  return (
    <>
      <form className={`composer today-quick-add${onboardingStep === 1 ? ' guide-target' : ''}`} onSubmit={(event) => {
        event.preventDefault()
        if (!title.trim()) return
        addTask(title, difficulty, category)
        setTitle('')
      }}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="添加临时待办" aria-label="待办标题" />
        <CategoryPicker value={category} onChange={setCategory} />
        <DifficultySelect value={difficulty} onChange={setDifficulty} label="难度" />
        <button className="btn" type="submit"><GameIcon name="plus" />添加</button>
      </form>

      <p className="hint timeline-hint">把事情排进上午 / 下午 / 晚上</p>

      <div className="day-timeline" aria-label="今日时间轴">
        {PLAN_SLOTS.map((slot) => {
          const items = grouped[slot]
          const openInSlot = items.filter((item) => !item.done).length
          const doneInSlot = items.filter((item) => item.done).length
          return (
            <section key={slot} className={`timeline-slot slot-${slot}`}>
              <header className="timeline-slot-head">
                <h3>{PLAN_SLOT_LABELS[slot]}</h3>
                <span className="muted">
                  {items.length === 0 ? '空' : `${doneInSlot}/${items.length}`}
                </span>
              </header>
              <div className="list today-action-list">
                {items.length === 0 && <p className="inline-empty">还没有安排</p>}
                {items.map((item) => (
                  <TimelineRow
                    key={item.id}
                    item={item}
                    slot={slot}
                    rewardedHabitIds={rewardedHabitIds}
                    onboardingStep={onboardingStep}
                    editingId={editingId}
                    editTitle={editTitle}
                    editDifficulty={editDifficulty}
                    editCategory={editCategory}
                    setEditingId={setEditingId}
                    setEditTitle={setEditTitle}
                    setEditDifficulty={setEditDifficulty}
                    setEditCategory={setEditCategory}
                    editTask={editTask}
                    completeTask={completeTask}
                    deleteTask={deleteTask}
                    adjustHabit={adjustHabit}
                    completeProjectBlock={completeProjectBlock}
                    setPlan={(nextSlot) => setPlan(targetFor(item), nextSlot)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {(openCount > 0 || doneCount > 0) && (
        <p className="muted timeline-foot">今天 {doneCount}/{openCount + doneCount}</p>
      )}

      {doneCount > 0 && (
        <details className="completed-details">
          <summary>已完成 {doneCount}</summary>
          <div className="list">
            {timelineItems.filter((item) => item.done).map((item) => {
              if (item.kind === 'habit') {
                return (
                  <div key={`done-${item.id}`} className="row done task-row">
                    <div className="row-main">
                      <strong>{item.habit.title}</strong>
                      <span className="muted">习惯 · {PLAN_SLOT_LABELS[item.slot]}</span>
                    </div>
                    {item.habit.mode === 'check' && (
                      <button className="btn secondary" onClick={() => adjustHabit(item.habit.id, -1)}>
                        <GameIcon name="undo" />撤销
                      </button>
                    )}
                  </div>
                )
              }
              if (item.kind === 'block') {
                const block = item.project.blocks.find((entry) => entry.id === item.blockId)
                if (!block) return null
                return (
                  <div key={`done-${item.id}`} className="row done task-row">
                    <div className="row-main">
                      <strong>{block.title}</strong>
                      <span className="muted">{item.project.title} · {PLAN_SLOT_LABELS[item.slot]}</span>
                    </div>
                    <button className="btn secondary" onClick={() => undoProjectBlock(item.project.id, item.blockId)}>
                      <GameIcon name="undo" />撤销
                    </button>
                  </div>
                )
              }
              return (
                <div key={`done-${item.id}`} className="row done task-row">
                  <div className="row-main">
                    <strong className="task-title-with-category">
                      <CategoryMark category={item.task.category} />
                      {item.task.title}
                    </strong>
                    <span className="muted">+{item.task.awardedCoins ?? 0} 金币 · {PLAN_SLOT_LABELS[item.slot]}</span>
                  </div>
                  {taskCompletedOn(item.task) && (
                    <button className="btn secondary" onClick={() => undoCompleteTask(item.task.id)}>
                      <GameIcon name="undo" />撤销
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </details>
      )}
    </>
  )
}

function TimelineRow({
  item,
  slot,
  rewardedHabitIds,
  onboardingStep,
  editingId,
  editTitle,
  editDifficulty,
  editCategory,
  setEditingId,
  setEditTitle,
  setEditDifficulty,
  setEditCategory,
  editTask,
  completeTask,
  deleteTask,
  adjustHabit,
  completeProjectBlock,
  setPlan,
}: {
  item: TimelineItem
  slot: PlanSlot
  rewardedHabitIds: string[]
  onboardingStep: number
  editingId: string | null
  editTitle: string
  editDifficulty: Difficulty
  editCategory: TaskCategory
  setEditingId: (id: string | null) => void
  setEditTitle: (title: string) => void
  setEditDifficulty: (difficulty: Difficulty) => void
  setEditCategory: (category: TaskCategory) => void
  editTask: (id: string, title: string, difficulty: Difficulty, category?: TaskCategory) => void
  completeTask: (id: string) => void
  deleteTask: (id: string) => void
  adjustHabit: (id: string, delta: number) => void
  completeProjectBlock: (projectId: string, blockId: string) => void
  setPlan: (slot: PlanSlot) => void
}) {
  const kindClass =
    item.kind === 'habit' ? 'is-habit' : item.kind === 'block' ? 'is-project' : 'is-todo'

  if (item.kind === 'task' && editingId === item.task.id) {
    return (
      <div className={`row productivity-row today-action-row ${kindClass}`}>
        <form
          className="task-edit-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!editTitle.trim()) return
            editTask(item.task.id, editTitle, editDifficulty, editCategory)
            setEditingId(null)
          }}
        >
          <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} aria-label="编辑待办标题" autoFocus />
          <DifficultySelect value={editDifficulty} onChange={setEditDifficulty} label="编辑难度" />
          <CategoryPicker value={editCategory} onChange={setEditCategory} compact />
          <button className="btn" type="submit">保存</button>
          <button className="btn secondary" type="button" onClick={() => setEditingId(null)}>取消</button>
        </form>
      </div>
    )
  }

  return (
    <div
      className={`row productivity-row today-action-row timeline-row ${kindClass}${item.done ? ' done' : ''}${
        item.kind === 'task' && onboardingStep === 2 ? ' guide-target' : ''
      }`}
    >
      <div className="row-main">
        <strong className="task-title-with-category">
          {item.kind === 'task' && <CategoryMark category={item.task.category} />}
          {item.kind === 'habit' && <CategoryMark category={item.habit.category} />}
          {item.kind === 'block' && <CategoryMark category={item.project.category} />}
          {item.kind === 'task' && item.task.title}
          {item.kind === 'habit' && item.habit.title}
          {item.kind === 'block' &&
            (item.project.blocks.find((block) => block.id === item.blockId)?.title ?? '分块')}
        </strong>
        <span className="muted">
          {item.kind === 'task' && TASK_REWARDS[item.task.difficulty].label}
          {item.kind === 'habit' && (() => {
            const entry = habitEntryFor(item.habit)
            return `${entry?.count ?? 0}/${item.habit.targetCount} · 习惯`
          })()}
          {item.kind === 'block' &&
            `${item.project.title} · ${projectProgress(item.project).percent}%`}
        </span>
        {!item.done && (
          <label className="slot-picker">
            <span className="visually-hidden">时段</span>
            <select
              value={slot}
              aria-label="排到时段"
              onChange={(event) => setPlan(event.target.value as PlanSlot)}
            >
              {PLAN_SLOTS.map((option) => (
                <option key={option} value={option}>
                  {PLAN_SLOT_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {item.kind === 'task' && !item.done && (
        <>
          <RewardInline
            coins={TASK_REWARDS[item.task.difficulty].coins}
            bond={TASK_REWARDS[item.task.difficulty].bond}
          />
          <div className="task-actions">
            <button className="btn today-complete" onClick={() => completeTask(item.task.id)} aria-label="完成">
              <GameIcon name="check" />
            </button>
            <button
              className="icon-button"
              aria-label={`编辑${item.task.title}`}
              title="编辑"
              onClick={() => {
                setEditingId(item.task.id)
                setEditTitle(item.task.title)
                setEditDifficulty(item.task.difficulty)
                setEditCategory(item.task.category ?? 'errand')
              }}
            >
              <GameIcon name="edit" />
            </button>
            <button
              className="icon-button danger-text"
              aria-label={`删除${item.task.title}`}
              title="删除"
              onClick={() => deleteTask(item.task.id)}
            >
              <GameIcon name="trash" />
            </button>
          </div>
        </>
      )}

      {item.kind === 'habit' && !item.done && (
        <>
          <RewardInline
            coins={rewardedHabitIds.includes(item.habit.id) ? HABIT_REWARD.coins : 0}
            bond={rewardedHabitIds.includes(item.habit.id) ? HABIT_REWARD.bond : 0}
          />
          {item.habit.mode === 'count' ? (
            <button
              className="btn today-complete"
              onClick={() => adjustHabit(item.habit.id, 1)}
              aria-label={`${item.habit.title}记录一次`}
            >
              <GameIcon name="check" />记录一次
            </button>
          ) : (
            <button className="btn today-complete" onClick={() => adjustHabit(item.habit.id, 1)}>
              <GameIcon name="check" />打卡
            </button>
          )}
        </>
      )}

      {item.kind === 'block' && !item.done && (() => {
        const block = item.project.blocks.find((entry) => entry.id === item.blockId)
        if (!block) return null
        const reward = nextBlockReward(item.project, block.id)
        return (
          <>
            <RewardInline coins={reward.coins} bond={reward.bond} />
            <button
              className="btn today-complete"
              onClick={() => completeProjectBlock(item.project.id, item.blockId)}
              aria-label="完成"
            >
              <GameIcon name="check" />
            </button>
          </>
        )
      })()}
    </div>
  )
}

function HabitsView({ rewardedHabitIds }: { rewardedHabitIds: string[] }) {
  const habits = useGameStore((s) => s.habits)
  const addHabit = useGameStore((s) => s.addHabit)
  const archiveHabit = useGameStore((s) => s.archiveHabit)
  const [title, setTitle] = useState('')
  const [mode, setMode] = useState<'check' | 'count'>('check')
  const [target, setTarget] = useState(2)
  const [scheduleType, setScheduleType] = useState<HabitScheduleType>('daily')
  const [days, setDays] = useState<number[]>([1, 3, 5])
  const [weeklyTarget, setWeeklyTarget] = useState(3)
  const [category, setCategory] = useState<TaskCategory>('errand')
  const active = habits.filter((habit) => habit.active)

  function submit() {
    if (!title.trim()) return
    const schedule: HabitSchedule = scheduleType === 'selected'
      ? { type: scheduleType, days }
      : scheduleType === 'weekly'
        ? { type: scheduleType, weeklyTarget }
        : { type: scheduleType }
    addHabit(title, mode, target, schedule, category)
    setTitle('')
  }

  return (
    <>
      <SectionHeading title="习惯" detail="每天最多 5 个习惯有奖励" />
      <form className="productivity-form" onSubmit={(event) => { event.preventDefault(); submit() }}>
        <label>名称<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：散步 20 分钟" /></label>
        <CategoryPicker value={category} onChange={setCategory} />
        <div className="form-grid">
          <label>记录方式<select value={mode} onChange={(event) => setMode(event.target.value as 'check' | 'count')}><option value="check">完成 / 未完成</option><option value="count">累计次数</option></select></label>
          {mode === 'count' && <label>每天目标<input type="number" min="1" value={target} onChange={(event) => setTarget(Math.max(1, Number(event.target.value)))} /></label>}
          <label>频率<select value={scheduleType} onChange={(event) => setScheduleType(event.target.value as HabitScheduleType)}><option value="daily">每天</option><option value="weekdays">工作日</option><option value="selected">指定星期</option><option value="weekly">每周若干次</option></select></label>
          {scheduleType === 'weekly' && <label>每周目标<input type="number" min="1" max="7" value={weeklyTarget} onChange={(event) => setWeeklyTarget(Math.max(1, Math.min(7, Number(event.target.value))))} /></label>}
        </div>
        {scheduleType === 'selected' && (
          <div className="weekday-picker" aria-label="选择星期">
            {WEEKDAYS.map((day) => <button type="button" className={days.includes(day.value) ? 'active' : ''} key={day.value} onClick={() => setDays((current) => current.includes(day.value) ? current.filter((value) => value !== day.value) : [...current, day.value])}>{day.label}</button>)}
          </div>
        )}
        <button className="btn" type="submit"><GameIcon name="plus" />添加习惯</button>
      </form>

      <div className="habit-grid">
        {active.length === 0 && <p className="inline-empty">还没有习惯</p>}
        {active.map((habit) => {
          const week = habitWeeklyProgress(habit)
          const rewarded = rewardedHabitIds.includes(habit.id)
          return (
            <article className="productivity-card" key={habit.id}>
              <div className="card-heading">
                <strong className="task-title-with-category"><CategoryMark category={habit.category} />{habit.title}</strong>
                <span
                  className={rewarded ? 'reward-badge' : 'muted-badge'}
                  aria-label={rewarded ? `奖励 ${HABIT_REWARD.coins} 金币和 ${HABIT_REWARD.bond} 精力` : '奖励 0'}
                >
                  {rewarded ? (
                    <>
                      <GameIcon name="coin" />+{HABIT_REWARD.coins}
                      <GameIcon name="energy" />+{HABIT_REWARD.bond}
                    </>
                  ) : '+0'}
                </span>
              </div>
              <p>{scheduleLabel(habit.schedule)} · {habit.mode === 'count' ? `每天 ${habit.targetCount} 次` : '打卡'}</p>
              <ProgressBar value={week.completed} max={week.target} label={`本周 ${week.completed}/${week.target}`} />
              <button
                className="quiet-remove"
                title="从当前列表移除，历史记录和奖励会保留"
                onClick={() => archiveHabit(habit.id)}
              >
                移除
              </button>
            </article>
          )
        })}
      </div>
    </>
  )
}

function ProjectsView() {
  const projects = useGameStore((s) => s.projects)
  const addProject = useGameStore((s) => s.addProject)
  const addProjectBlock = useGameStore((s) => s.addProjectBlock)
  const deleteProjectBlock = useGameStore((s) => s.deleteProjectBlock)
  const moveProjectBlock = useGameStore((s) => s.moveProjectBlock)
  const startProject = useGameStore((s) => s.startProject)
  const completeProjectBlock = useGameStore((s) => s.completeProjectBlock)
  const undoProjectBlock = useGameStore((s) => s.undoProjectBlock)
  const archiveProject = useGameStore((s) => s.archiveProject)
  const visible = projects.filter((project) => project.status !== 'archived')
  const [selectedId, setSelectedId] = useState<string | null>(visible[0]?.id ?? null)
  const selected = visible.find((project) => project.id === selectedId) ?? visible[0]
  const [title, setTitle] = useState('')
  const [size, setSize] = useState<ProjectSize>('small')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState<TaskCategory>('errand')
  const [blockTitle, setBlockTitle] = useState('')
  const [blockDifficulty, setBlockDifficulty] = useState<Difficulty>('small')
  const reward = useMemo(() => selected ? PROJECT_REWARDS[selected.size] : null, [selected])

  return (
    <>
      <SectionHeading title="项目" detail="拆成分块完成，阶段进度会发放额外奖励" />
      <form className="productivity-form compact-form" onSubmit={(event) => {
        event.preventDefault()
        if (!title.trim()) return
        addProject(title, size, dueDate || undefined, category)
        setTitle('')
      }}>
        <label>项目名称<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：整理作品集" /></label>
        <CategoryPicker value={category} onChange={setCategory} />
        <div className="form-grid">
          <label>规模<select value={size} onChange={(event) => setSize(event.target.value as ProjectSize)}><option value="small">小项目 · 120 金币</option><option value="medium">中项目 · 300 金币</option><option value="large">大项目 · 600 金币</option></select></label>
          <label>截止日期（可选）<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        </div>
        <button className="btn" type="submit"><GameIcon name="plus" />新建项目</button>
      </form>

      {visible.length === 0 ? <p className="inline-empty">还没有项目</p> : (
        <div className="project-workspace">
          <div className="project-list" aria-label="项目列表">
            {visible.map((project) => {
              const progress = projectProgress(project)
              return <button key={project.id} className={selected?.id === project.id ? 'active' : ''} onClick={() => setSelectedId(project.id)}><strong className="task-title-with-category"><CategoryMark category={project.category} />{project.title}</strong><span>{progress.percent}% · {statusLabel(project.status)}</span></button>
            })}
          </div>
          {selected && reward && (
            <section className="project-detail">
              <div className="project-detail-heading">
                <div><span className="eyebrow">{PROJECT_SIZE_LABELS[selected.size]} · 总奖励 {reward.coins} 金币</span><h3 className="task-title-with-category"><CategoryMark category={selected.category} />{selected.title}</h3>{selected.dueDate && <p>截止 {selected.dueDate}</p>}</div>
              </div>
              <ProgressBar value={projectProgress(selected).percent} max={100} label={`进度 ${projectProgress(selected).percent}%`} />
              <div className="milestone-track" aria-label="项目里程碑">{([25, 50, 75, 100] as const).map((point) => <span className={selected.awardedMilestones.includes(point) ? 'earned' : ''} key={point}>{point}%</span>)}</div>
              <div className="project-blocks">
                {selected.blocks.map((block, index) => (
                  <div className={`project-block${block.done ? ' done' : ''}`} key={block.id}>
                    <div><strong>{block.title}</strong><span>{DIFFICULTY_LABELS[block.difficulty]}{block.awardedCoins !== undefined ? ` · +${block.awardedCoins} 金币` : ''}</span></div>
                    <div className="block-actions">
                      {block.done ? <button className="btn secondary" onClick={() => undoProjectBlock(selected.id, block.id)}><GameIcon name="undo" />撤销</button> : selected.status === 'active' ? <button className="btn" onClick={() => completeProjectBlock(selected.id, block.id)} aria-label="完成"><GameIcon name="check" /></button> : null}
                      {!block.done && <><button className="icon-button" disabled={index === 0} onClick={() => moveProjectBlock(selected.id, block.id, -1)} aria-label="上移">↑</button><button className="icon-button" disabled={index === selected.blocks.length - 1} onClick={() => moveProjectBlock(selected.id, block.id, 1)} aria-label="下移">↓</button><button className="icon-button danger-text" onClick={() => deleteProjectBlock(selected.id, block.id)} aria-label="删除分块">×</button></>}
                    </div>
                  </div>
                ))}
              </div>
              {selected.status !== 'completed' && (
                <form className="block-composer" onSubmit={(event) => {
                  event.preventDefault()
                  if (!blockTitle.trim()) return
                  addProjectBlock(selected.id, blockTitle, blockDifficulty)
                  setBlockTitle('')
                }}>
                  <input value={blockTitle} onChange={(event) => setBlockTitle(event.target.value)} placeholder="添加一个可完成的分块" aria-label="分块标题" />
                  <DifficultySelect value={blockDifficulty} onChange={setBlockDifficulty} label="分块大小" />
                  <button className="btn" type="submit">添加</button>
                </form>
              )}
              {selected.status === 'draft' && <div className="project-start"><span className="project-start-tooltip" title={`至少需要 ${reward.minBlocks} 个任务`}><button className="btn" disabled={selected.blocks.length < reward.minBlocks} onClick={() => startProject(selected.id)}>开始项目</button></span></div>}
              {selected.status === 'completed' && <p className="project-complete-note">项目已完成</p>}
              <button
                className="quiet-remove project-remove"
                title="从当前列表移除，历史进度和奖励会保留"
                onClick={() => archiveProject(selected.id)}
              >
                移除项目
              </button>
            </section>
          )}
        </div>
      )}
    </>
  )
}

function SectionHeading({ title, detail }: { title: string; detail: string }) {
  return <div className="productivity-section-heading"><h2>{title}</h2><span className="section-info" title={detail} aria-label={detail}>ⓘ</span></div>
}

function RewardInline({ coins, bond }: { coins: number; bond: number }) {
  return (
    <span className="today-reward" aria-label={`${coins} 金币${bond ? `，${bond} 精力` : ''}`}>
      <span className="coin-reward"><GameIcon name="coin" />+{coins}</span>
      {bond > 0 && <span className="bond-reward"><GameIcon name="energy" />+{bond}</span>}
    </span>
  )
}

function DifficultySelect({ value, onChange, label }: { value: Difficulty; onChange: (value: Difficulty) => void; label: string }) {
  return <select value={value} onChange={(event) => onChange(event.target.value as Difficulty)} aria-label={label}><option value="small">小</option><option value="medium">中</option><option value="large">大</option></select>
}

function CategoryPicker({ value, onChange, compact = false }: { value: TaskCategory; onChange: (value: TaskCategory) => void; compact?: boolean }) {
  return (
    <div className={`category-picker${compact ? ' compact' : ''}`} role="group" aria-label="待办分类">
      {TASK_CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          className={value === category.id ? 'active' : ''}
          data-category={category.id}
          title={category.label}
          aria-label={category.label}
          aria-pressed={value === category.id}
          onClick={() => onChange(category.id)}
        >
          <GameIcon name={category.icon} />
          <span className="category-tooltip" role="tooltip">{category.label}</span>
        </button>
      ))}
    </div>
  )
}

function CategoryMark({ category }: { category?: TaskCategory }) {
  const definition = taskCategory(category)
  return (
    <span className="category-mark" data-category={definition.id} title={definition.label} aria-label={definition.label}>
      <GameIcon name={definition.icon} />
    </span>
  )
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return <div className="progress-block"><div className="progress-label"><span>{label}</span><b>{Math.round(width)}%</b></div><div className="progress-rail"><i style={{ width: `${width}%` }} /></div></div>
}

function scheduleLabel(schedule: HabitSchedule) {
  if (schedule.type === 'daily') return '每天'
  if (schedule.type === 'weekdays') return '工作日'
  if (schedule.type === 'weekly') return `每周 ${schedule.weeklyTarget ?? 1} 次`
  return `周${WEEKDAYS.filter((day) => schedule.days?.includes(day.value)).map((day) => day.label).join('、')}`
}

function statusLabel(status: Project['status']) {
  if (status === 'draft') return '准备中'
  if (status === 'active') return '进行中'
  if (status === 'completed') return '已完成'
  return '已归档'
}
