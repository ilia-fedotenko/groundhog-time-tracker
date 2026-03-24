import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import TimerPage from "./pages/TimerPage"
import TaskDropdownPage from "./pages/TaskDropdownPage"
import HistoryPage from "./pages/HistoryPage"

const windowLabel = getCurrentWebviewWindow().label

export default function App() {
  if (windowLabel === "history") {
    return <HistoryPage />
  }
  if (windowLabel === "task-dropdown") {
    return <TaskDropdownPage />
  }
  return <TimerPage />
}
