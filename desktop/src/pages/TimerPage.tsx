import { useEffect, useRef, useState } from "react"
import { Badge, Button, Input } from "@groundhog/ui"
import { emit, listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/core"
import { Play, Plus, Square } from "lucide-react"

const MOCK_TAGS = ["frontend", "design", "review"]

export default function TimerPage() {
  const [task, setTask] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [running, setRunning] = useState(false)
  const [tags, setTags] = useState(MOCK_TAGS)
  const dropdownOpen = useRef(false)

  useEffect(() => {
    let unlisten: (() => void) | undefined
    listen<string>("task-selected", async (event) => {
      const selected = event.payload
      setTask(selected)
      setInputValue(selected)
      dropdownOpen.current = false
      await invoke("close_task_dropdown")
    }).then((fn) => {
      unlisten = fn
    })
    return () => unlisten?.()
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

  const handleBlur = () => {
    // Delay to let a dropdown item click (onMouseDown) fire first
    setTimeout(async () => {
      if (dropdownOpen.current) {
        dropdownOpen.current = false
        await invoke("close_task_dropdown")
      }
    }, 150)
  }

  return (
    <div className="flex h-screen flex-col justify-center gap-2 bg-background px-3 py-2">
      {/* Row 1: play button + task input */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setRunning((r) => !r)}
          disabled={!task}
        >
          {running ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
        </Button>

        <Input
          placeholder="Что делаем?"
          value={inputValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
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
