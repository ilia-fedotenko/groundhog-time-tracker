import { useEffect, useRef, useState } from "react"
import { Badge, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@groundhog/ui"
import { emit, listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/core"
import { History, Play, Plus, Square } from "lucide-react"

const MOCK_TAGS = ["frontend", "design", "review"]

export default function TimerPage() {
  const [task, setTask] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [running, setRunning] = useState(false)
  const [tags, setTags] = useState(MOCK_TAGS)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const dropdownOpen = useRef(false)
  const hoveredTask = useRef<string | null>(null)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    const unlistenHovered = listen<string | null>("task-hovered", (event) => {
      hoveredTask.current = event.payload
    })
    return () => {
      unlistenHovered.then((fn) => fn())
    }
  }, [])

  const openDropdown = async () => {
    if (!dropdownOpen.current) {
      await invoke("open_task_dropdown")
      dropdownOpen.current = true
    }
    await emit("task-filter", inputValue)
  }

  const handleFocus = async () => {
    await openDropdown()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (!dropdownOpen.current) {
      await invoke("open_task_dropdown")
      dropdownOpen.current = true
    }
    await emit("task-filter", value)
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      setTask(inputValue.trim())
      dropdownOpen.current = false
      await invoke("close_task_dropdown")
    } else if (e.key === "Escape") {
      dropdownOpen.current = false
      await invoke("close_task_dropdown")
    }
  }

  const handleBlur = async () => {
    if (!dropdownOpen.current) return
    if (hoveredTask.current) {
      const selected = hoveredTask.current
      hoveredTask.current = null
      setTask(selected)
      setInputValue(selected)
    }
    dropdownOpen.current = false
    await invoke("close_task_dropdown")
  }

  return (
    <div className="flex h-screen flex-col justify-center gap-2 bg-background px-3 py-2">
      {/* Fixed: history toggle */}
      <div className="fixed right-2 top-2">
        <Button
          size="icon"
          variant="ghost"
          className="group size-8"
          onClick={async () => {
            if (historyOpen) {
              await invoke("close_history_window")
              setHistoryOpen(false)
            } else {
              await invoke("open_history_window")
              setHistoryOpen(true)
            }
          }}
        >
          <History className="size-4 text-muted-foreground group-hover:text-foreground group-focus-visible:text-foreground" />
        </Button>
      </div>

      {/* Row 1: task input */}
      <div className="flex items-center gap-2">
        <Input
          className="border-transparent bg-transparent hover:border-input text-center"
          placeholder="Что делаем?"
          value={inputValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      </div>

      {/* Row 2: tags */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 px-0.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        <button
          className="flex size-5 items-center justify-center rounded-sm border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            const t = prompt("Новый тег")
            if (t?.trim()) setTags((prev) => [...prev, t.trim()])
          }}
        >
          <Plus className="size-3" />
        </button>
      </div>

      {/* Row 3: timer + scope select */}
      <div className="mt-2 flex flex-col items-center gap-1">
        <span className="font-mono text-4xl font-semibold tabular-nums">
          {[
            Math.floor(elapsed / 3600),
            Math.floor((elapsed % 3600) / 60),
            elapsed % 60,
          ]
            .map((n) => String(n).padStart(2, "0"))
            .join(":")}
        </span>
        <Select defaultValue="entry">
          <SelectTrigger size="sm" className="w-34 justify-center text-xs border-transparent text-muted-foreground hover:border-input hover:text-foreground focus-visible:text-foreground dark:bg-transparent dark:hover:bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry">Per time entry</SelectItem>
            <SelectItem value="task">Per task (today)</SelectItem>
            <SelectItem value="day">Per whole day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 5: start/stop button */}
      <div className="mt-2 flex justify-center">
        <Button
          size="icon"
          className="size-10 shrink-0 rounded-full"
          onClick={() => {
            if (!running) setElapsed(0)
            setRunning((r) => !r)
          }}
        >
          {running ? <Square className="size-4" /> : <Play className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
