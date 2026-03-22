import { useEffect, useState } from "react"
import { listen } from "@tauri-apps/api/event"
import { emit } from "@tauri-apps/api/event"

const MOCK_TASKS = [
  "Разработка UI десктоп-панели",
  "Ревью pull request",
  "Настройка CI/CD",
  "Написание тестов",
]

export default function TaskDropdownPage() {
  const [filter, setFilter] = useState("")

  useEffect(() => {
    let unlisten: (() => void) | undefined
    listen<string>("task-filter", (event) => {
      setFilter(event.payload)
    }).then((fn) => {
      unlisten = fn
    })
    return () => unlisten?.()
  }, [])

  const filtered = MOCK_TASKS.filter((t) =>
    t.toLowerCase().includes(filter.toLowerCase())
  )

  const handleSelect = async (task: string) => {
    await emit("task-selected", task)
  }

  return (
    <div className="flex flex-col bg-popover border border-border rounded-md overflow-hidden h-screen">
      {filtered.length === 0 ? (
        <div className="px-3 py-2 text-xs text-muted-foreground">
          Нажми Enter чтобы создать «{filter}»
        </div>
      ) : (
        <ul>
          {filtered.map((task) => (
            <li
              key={task}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent select-none"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(task)}
            >
              {task}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
