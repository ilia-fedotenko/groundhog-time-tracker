import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import TimerPage from "./pages/TimerPage"
import TaskDropdownPage from "./pages/TaskDropdownPage"

const windowLabel = getCurrentWebviewWindow().label

export default function App() {
  if (windowLabel === "task-dropdown") {
    return <TaskDropdownPage />
  }
  return <TimerPage />
}
