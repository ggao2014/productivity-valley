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
import type {
  Difficulty,
  HabitSchedule,
  HabitScheduleType,
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
          dueHabits={dueHabits}
          rewardedHabitIds={rewardedHabitIds}
          activeProjects={activeProjects}
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
  dueHabits,
  rewardedHabitIds,
  activeProjects,
  onboardingStep,
}: {
  dueHabits: ReturnType<typeof useGameStore.getState>['habits']
  rewardedHabitIds: string[]
  activeProjects: Project[]
  onboardingStep: number
}) {
  const tasks = useGameStore((s) => s.tasks)
  const projects = useGameStore((s) => s.projects)
  const adjustHabit = useGameStore((s) => s.adjustHabit)
  const completeProjectBlock = useGameStore((s) => s.completeProjectBlock)
  const addTask = useGameStore((s) => s.addTask)
  const editTask = useGameStore((s) => s.editTask)
  const completeTask = useGameStore((s) => s.completeTask)
  const undoCompleteTask = useGameStore((s) => s.undoCompleteTask)
  const undoProjectBlock = useGameStore((s) => s.undoProjectBlock)
  const deleteTask = useGameStore((s) => s.deleteTask)
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('small')
  const [category, setCategory] = useState<TaskCategory>('errand')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>('small')
  const [editCategory, setEditCategory] = useState<TaskCategory>('errand')
  const open = tasks.filter((task) => !task.done)
  const done = tasks.filter((task) => task.done && taskCompletedOn(task)).slice(0, 8)
  const nextBlocks = activeProjects
    .map((project) => ({ project, block: project.blocks.find((block) => !block.done) }))
    .filter((item) => item.block)
  const completedHabits = dueHabits.filter((habit) => (habitEntryFor(habit)?.count ?? 0) >= habit.targetCount)
  const completedBlocks = projects.flatMap((project) => project.blocks
    .filter((block) => block.done && block.completedAt && localDayKey(new Date(block.completedAt)) === localDayKey())
    .map((block) => ({ project, block })))
  const completedCount = completedHabits.length + completedBlocks.length + done.length

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

      <TodaySectionHeading title="习惯" done={completedHabits.length} total={dueHabits.length} />
      <div className="list today-action-list">
        {dueHabits.length === 0 && <p className="inline-empty">今天没有到期习惯</p>}
        {dueHabits.map((habit) => {
          const entry = habitEntryFor(habit)
          const count = entry?.count ?? 0
          const doneToday = count >= habit.targetCount
          const rewarded = rewardedHabitIds.includes(habit.id)
          return (
            <div className={`row productivity-row today-action-row is-habit${doneToday ? ' done' : ''}`} key={habit.id}>
              <div className="row-main">
                <strong className="task-title-with-category"><CategoryMark category={habit.category} />{habit.title}</strong>
                <span className="muted">{count}/{habit.targetCount}</span>
              </div>
              <RewardInline coins={rewarded ? HABIT_REWARD.coins : 0} bond={rewarded ? HABIT_REWARD.bond : 0} />
              {habit.mode === 'count' ? (
                <button
                  className={doneToday ? 'btn secondary today-complete' : 'btn today-complete'}
                  disabled={doneToday}
                  onClick={() => adjustHabit(habit.id, 1)}
                  aria-label={`${habit.title}记录一次，当前 ${count}/${habit.targetCount}`}
                >
                  <GameIcon name="check" />{doneToday ? '已完成' : '记录一次'}
                </button>
              ) : (
                <button className={doneToday ? 'btn secondary today-complete' : 'btn today-complete'} onClick={() => adjustHabit(habit.id, doneToday ? -1 : 1)}>
                  <GameIcon name={doneToday ? 'undo' : 'check'} />{doneToday ? '撤销' : '打卡'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <TodaySectionHeading title="项目下一步" done={completedBlocks.length} total={activeProjects.length} />
      <div className="list today-action-list">
        {nextBlocks.length === 0 && <p className="inline-empty">没有进行中的项目分块</p>}
        {nextBlocks.map(({ project, block }) => {
          if (!block) return null
          const progress = projectProgress(project)
          const reward = nextBlockReward(project, block.id)
          return (
            <div className="row productivity-row today-action-row is-project" key={project.id}>
              <div className="row-main">
                <strong className="task-title-with-category"><CategoryMark category={project.category} />{block.title}</strong>
                <span className="muted">{project.title} · {progress.percent}% · {DIFFICULTY_LABELS[block.difficulty]}</span>
              </div>
              <RewardInline coins={reward.coins} bond={reward.bond} />
              <button className="btn today-complete" onClick={() => completeProjectBlock(project.id, block.id)}><GameIcon name="check" />完成</button>
            </div>
          )
        })}
      </div>

      <TodaySectionHeading title="临时待办" done={done.length} total={open.length + done.length} />
      <div className="list today-action-list">
        {open.length === 0 && <p className="inline-empty">没有临时待办</p>}
        {open.map((task) => (
          <div key={task.id} className={`row task-row today-action-row is-todo${onboardingStep === 2 ? ' guide-target' : ''}`}>
            {editingId === task.id ? (
              <form className="task-edit-form" onSubmit={(event) => {
                event.preventDefault()
                if (!editTitle.trim()) return
                editTask(task.id, editTitle, editDifficulty, editCategory)
                setEditingId(null)
              }}>
                <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} aria-label="编辑待办标题" autoFocus />
                <DifficultySelect value={editDifficulty} onChange={setEditDifficulty} label="编辑难度" />
                <CategoryPicker value={editCategory} onChange={setEditCategory} compact />
                <button className="btn" type="submit">保存</button>
                <button className="btn secondary" type="button" onClick={() => setEditingId(null)}>取消</button>
              </form>
            ) : (
              <>
                <div className="row-main">
                  <strong className="task-title-with-category">
                    <CategoryMark category={task.category} />{task.title}
                  </strong>
                  <span className="muted">{TASK_REWARDS[task.difficulty].label}</span>
                </div>
                <RewardInline coins={TASK_REWARDS[task.difficulty].coins} bond={TASK_REWARDS[task.difficulty].bond} />
                <div className="task-actions">
                  <button className="btn today-complete" onClick={() => completeTask(task.id)}><GameIcon name="check" />完成</button>
                  <button className="icon-button" aria-label={`编辑${task.title}`} title="编辑" onClick={() => {
                    setEditingId(task.id)
                    setEditTitle(task.title)
                    setEditDifficulty(task.difficulty)
                    setEditCategory(task.category ?? 'errand')
                  }}><GameIcon name="edit" /></button>
                  <button className="icon-button danger-text" aria-label={`删除${task.title}`} title="删除" onClick={() => deleteTask(task.id)}><GameIcon name="trash" /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {completedCount > 0 && (
        <details className="completed-details">
          <summary>已完成 {completedCount}</summary>
          <div className="list">
            {completedHabits.map((habit) => (
              <div key={`habit-${habit.id}`} className="row done task-row"><div className="row-main"><strong>{habit.title}</strong><span className="muted">习惯</span></div>{habit.mode === 'check' && <button className="btn secondary" onClick={() => adjustHabit(habit.id, -1)}><GameIcon name="undo" />撤销</button>}</div>
            ))}
            {completedBlocks.map(({ project, block }) => (
              <div key={`block-${block.id}`} className="row done task-row"><div className="row-main"><strong>{block.title}</strong><span className="muted">{project.title}</span></div><button className="btn secondary" onClick={() => undoProjectBlock(project.id, block.id)}><GameIcon name="undo" />撤销</button></div>
            ))}
            {done.map((task) => (
              <div key={task.id} className="row done task-row">
                <div className="row-main"><strong className="task-title-with-category"><CategoryMark category={task.category} />{task.title}</strong><span className="muted">+{task.awardedCoins ?? 0} 金币</span></div>
                {taskCompletedOn(task) && <button className="btn secondary" onClick={() => undoCompleteTask(task.id)}><GameIcon name="undo" />撤销</button>}
              </div>
            ))}
          </div>
        </details>
      )}
    </>
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
                      {block.done ? <button className="btn secondary" onClick={() => undoProjectBlock(selected.id, block.id)}><GameIcon name="undo" />撤销</button> : selected.status === 'active' ? <button className="btn" onClick={() => completeProjectBlock(selected.id, block.id)}><GameIcon name="check" />完成</button> : null}
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

function TodaySectionHeading({ title, done, total }: { title: string; done: number; total: number }) {
  return <div className="today-section-heading"><h2>{title}</h2><span>{done}/{total}</span></div>
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
