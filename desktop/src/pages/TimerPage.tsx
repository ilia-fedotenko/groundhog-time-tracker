import { useEffect, useRef, useState } from "react"
import { Badge, Button, Input } from "@groundhog/ui"
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
  const dropdownOpen = useRef(false)
  const hoveredTask = useRef<string | null>(null)

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
      {/* Row 0: history toggle */}
      <div className="flex justify-end">
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
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
          <History className="size-3.5" />
        </Button>
      </div>

      {/* Row 1: play button + task input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Что делаем?"
          value={inputValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />

        <Button
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setRunning((r) => !r)}
          disabled={!task}
        >
          {running ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
        </Button>
      </div>

      {/* Row 2: tags */}
      <div className="flex flex-wrap items-center gap-1.5 px-0.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            #{tag}
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
    </div>
  )
}
