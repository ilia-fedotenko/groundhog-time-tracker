import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@groundhog/ui"

// Domain types
interface Task {
  id: string
  name: string
}

interface TimeEntry {
  id: string
  taskId: string
  startedAt: Date
  stoppedAt: Date
}

// Mock data
const tasks: Task[] = [
  { id: "1", name: "Backend API" },
  { id: "2", name: "Frontend work" },
  { id: "3", name: "Design review" },
  { id: "4", name: "Meetings" },
  { id: "5", name: "Documentation" },
]

function dt(s: string): Date { return new Date(s) }

const timeEntries: TimeEntry[] = [
  // Today: Thu 26 Mar
  { id: "e01", taskId: "1", startedAt: dt("2026-03-26T08:57:23"), stoppedAt: dt("2026-03-26T10:34:11") },
  { id: "e02", taskId: "1", startedAt: dt("2026-03-26T14:03:47"), stoppedAt: dt("2026-03-26T15:19:02") },
  { id: "e03", taskId: "2", startedAt: dt("2026-03-26T10:41:58"), stoppedAt: dt("2026-03-26T13:02:34") },
  // Yesterday: Wed 25 Mar
  { id: "e04", taskId: "3", startedAt: dt("2026-03-25T09:28:41"), stoppedAt: dt("2026-03-25T11:03:17") },
  { id: "e05", taskId: "1", startedAt: dt("2026-03-25T11:19:05"), stoppedAt: dt("2026-03-25T12:47:53") },
  { id: "e06", taskId: "4", startedAt: dt("2026-03-25T14:01:22"), stoppedAt: dt("2026-03-25T14:58:44") },
  { id: "e07", taskId: "4", startedAt: dt("2026-03-25T15:33:09"), stoppedAt: dt("2026-03-25T16:02:31") },
  // Tue 24 Mar
  { id: "e08", taskId: "2", startedAt: dt("2026-03-24T09:04:37"), stoppedAt: dt("2026-03-24T11:28:19") },
  { id: "e09", taskId: "5", startedAt: dt("2026-03-24T13:11:52"), stoppedAt: dt("2026-03-24T14:07:28") },
  // Mon 23 Mar
  { id: "e10", taskId: "1", startedAt: dt("2026-03-23T08:52:14"), stoppedAt: dt("2026-03-23T10:06:39") },
  { id: "e11", taskId: "1", startedAt: dt("2026-03-23T10:29:51"), stoppedAt: dt("2026-03-23T12:01:07") },
  { id: "e12", taskId: "3", startedAt: dt("2026-03-23T13:08:33"), stoppedAt: dt("2026-03-23T14:37:54") },
  { id: "e13", taskId: "3", startedAt: dt("2026-03-23T14:58:22"), stoppedAt: dt("2026-03-23T16:03:48") },
  // Sun 22 Mar
  { id: "e14", taskId: "4", startedAt: dt("2026-03-22T10:14:07"), stoppedAt: dt("2026-03-22T11:02:43") },
  // Sat 21 Mar
  { id: "e15", taskId: "2", startedAt: dt("2026-03-21T10:07:29"), stoppedAt: dt("2026-03-21T12:03:11") },
  { id: "e16", taskId: "5", startedAt: dt("2026-03-21T13:22:48"), stoppedAt: dt("2026-03-21T14:31:05") },
  { id: "e17", taskId: "5", startedAt: dt("2026-03-21T15:04:16"), stoppedAt: dt("2026-03-21T16:09:37") },
  // Fri 20 Mar
  { id: "e18", taskId: "1", startedAt: dt("2026-03-20T09:11:43"), stoppedAt: dt("2026-03-20T10:58:29") },
  { id: "e19", taskId: "4", startedAt: dt("2026-03-20T14:06:18"), stoppedAt: dt("2026-03-20T15:34:52") },
]

// Helpers
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function getDayLabel(date: Date, today: Date): string {
  if (isSameDay(date, today)) return "Today"
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) return "Yesterday"
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" })
  const day = date.getDate()
  const month = date.toLocaleDateString("en-US", { month: "short" })
  return `${weekday}, ${day} ${month}`
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

// Build day data
interface TaskDayData {
  task: Task
  entryCount: number
  totalMs: number
}

interface DayData {
  date: Date
  label: string
  totalMs: number
  tasks: TaskDayData[]
}

function buildDays(entries: TimeEntry[], allTasks: Task[], today: Date): DayData[] {
  const taskMap = new Map(allTasks.map(t => [t.id, t]))
  const byDay = new Map<string, TimeEntry[]>()

  for (const entry of entries) {
    const key = entry.startedAt.toDateString()
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(entry)
  }

  const days: DayData[] = []

  for (const [, dayEntries] of byDay) {
    const date = new Date(dayEntries[0].startedAt.toDateString())
    const byTask = new Map<string, TimeEntry[]>()

    for (const entry of dayEntries) {
      if (!byTask.has(entry.taskId)) byTask.set(entry.taskId, [])
      byTask.get(entry.taskId)!.push(entry)
    }

    let totalMs = 0
    const taskDays: TaskDayData[] = []

    for (const [taskId, taskEntries] of byTask) {
      const ms = taskEntries.reduce(
        (sum, e) => sum + (e.stoppedAt.getTime() - e.startedAt.getTime()), 0
      )
      totalMs += ms
      taskDays.push({ task: taskMap.get(taskId)!, entryCount: taskEntries.length, totalMs: ms })
    }

    days.push({ date, label: getDayLabel(date, today), totalMs, tasks: taskDays })
  }

  return days.sort((a, b) => b.date.getTime() - a.date.getTime())
}

const today = new Date("2026-03-26")
const days = buildDays(timeEntries, tasks, today)

export default function HistoryPage() {
  return (
    <div className="flex h-screen flex-col">
      <ScrollArea className="flex-1 bg-muted">
        <div className="flex flex-col gap-3 py-2 px-3 pb-3">
          {days.map((day) => (
            <Card key={day.date.toISOString()} size="sm" className="mx-auto w-full max-w-sm shadow-md">
              <CardHeader>
                <CardTitle>{day.label}</CardTitle>
                <CardAction>
                  <Badge>{formatDuration(day.totalMs)}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableBody>
                    {day.tasks.map(({ task, entryCount, totalMs }) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.name}</TableCell>
                        <TableCell>
                          {entryCount > 1 && (
                            <Button variant="outline" size="sm">{entryCount}</Button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{formatDuration(totalMs)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
