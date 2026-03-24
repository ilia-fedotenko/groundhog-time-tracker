use tauri::{AppHandle, Manager, PhysicalPosition, WebviewUrl, WebviewWindowBuilder, WindowEvent};

/// Show a window without stealing keyboard focus from the current key window.
/// On macOS this calls `orderFront:` instead of `makeKeyAndOrderFront:`.
/// On other platforms falls back to the regular `show()`.
fn show_without_focus(window: &tauri::WebviewWindow) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        window
            .with_webview(|webview| unsafe {
                use objc::{msg_send, runtime::Object, sel, sel_impl};
                let ns_window = webview.ns_window() as *mut Object;
                let _: () = msg_send![ns_window, orderFront: std::ptr::null::<Object>()];
            })
            .map_err(|e| e.to_string())?;
        return Ok(());
    }
    #[cfg(not(target_os = "macos"))]
    window.show().map_err(|e| e.to_string())
}

/// Wraps a raw NSWindow pointer so it can cross thread boundaries safely.
/// Safety: NSWindow manipulation is always marshalled to the main thread via
/// `with_webview`, so we never actually touch this pointer off-thread.
#[cfg(target_os = "macos")]
struct NsWindowPtr(*mut objc::runtime::Object);
#[cfg(target_os = "macos")]
unsafe impl Send for NsWindowPtr {}

/// Returns the underlying NSWindow pointer for a webview window.
#[cfg(target_os = "macos")]
fn get_ns_window(
    window: &tauri::WebviewWindow,
) -> Result<*mut objc::runtime::Object, String> {
    let (tx, rx) = std::sync::mpsc::channel::<NsWindowPtr>();
    window
        .with_webview(move |wv| unsafe {
            let ptr = wv.ns_window() as *mut objc::runtime::Object;
            let _ = tx.send(NsWindowPtr(ptr));
        })
        .map_err(|e| e.to_string())?;
    Ok(rx.recv().map_err(|e| e.to_string())?.0)
}

/// Attaches `child` as an NSWindow child of `parent`.
/// On macOS the OS then moves the child in sync with the parent — zero lag.
#[cfg(target_os = "macos")]
fn add_child_window(
    parent: &tauri::WebviewWindow,
    child: &tauri::WebviewWindow,
) -> Result<(), String> {
    use objc::{msg_send, sel, sel_impl};
    let ns_parent = get_ns_window(parent)?;
    let ns_child = get_ns_window(child)?;
    unsafe {
        // NSWindowOrderedAbove = 1
        let _: () = msg_send![ns_parent, addChildWindow: ns_child ordered: 1i32];
    }
    Ok(())
}

/// Detaches `child` from `parent`'s NSWindow child list.
#[cfg(target_os = "macos")]
fn remove_child_window(
    parent: &tauri::WebviewWindow,
    child: &tauri::WebviewWindow,
) -> Result<(), String> {
    use objc::{msg_send, sel, sel_impl};
    let ns_parent = get_ns_window(parent)?;
    let ns_child = get_ns_window(child)?;
    unsafe {
        let _: () = msg_send![ns_parent, removeChildWindow: ns_child];
    }
    Ok(())
}

#[tauri::command]
fn open_task_dropdown(app: AppHandle) -> Result<(), String> {
    let panel = app
        .get_webview_window("panel")
        .ok_or("panel window not found")?;

    let scale = panel.scale_factor().map_err(|e| e.to_string())?;
    let phys_pos = panel.outer_position().map_err(|e| e.to_string())?;
    let phys_size = panel.outer_size().map_err(|e| e.to_string())?;

    let logical_width = phys_size.width as f64 / scale;
    let logical_x = phys_pos.x as f64 / scale;
    let logical_y = phys_pos.y as f64 / scale;

    let dropdown_height = 200.0_f64;
    let dropdown_x = logical_x;
    let dropdown_y = logical_y - dropdown_height;

    let dropdown_window = if let Some(existing) = app.get_webview_window("task-dropdown") {
        existing
            .set_position(PhysicalPosition::new(
                (dropdown_x * scale) as i32,
                (dropdown_y * scale) as i32,
            ))
            .map_err(|e| e.to_string())?;
        show_without_focus(&existing)?;
        existing
    } else {
        WebviewWindowBuilder::new(
            &app,
            "task-dropdown",
            WebviewUrl::App("index.html".into()),
        )
        .title("")
        .decorations(false)
        .always_on_top(true)
        .resizable(false)
        .focused(false)
        .skip_taskbar(true)
        .inner_size(logical_width, dropdown_height)
        .position(dropdown_x, dropdown_y)
        .build()
        .map_err(|e| e.to_string())?
    };

    #[cfg(target_os = "macos")]
    add_child_window(&panel, &dropdown_window)?;

    Ok(())
}

#[tauri::command]
fn close_task_dropdown(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("task-dropdown") {
        #[cfg(target_os = "macos")]
        if let Some(panel) = app.get_webview_window("panel") {
            let _ = remove_child_window(&panel, &window);
        }
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn open_history_window(app: AppHandle) -> Result<(), String> {
    let panel = app
        .get_webview_window("panel")
        .ok_or("panel window not found")?;

    let scale = panel.scale_factor().map_err(|e| e.to_string())?;
    let phys_pos = panel.outer_position().map_err(|e| e.to_string())?;
    let phys_size = panel.outer_size().map_err(|e| e.to_string())?;

    let logical_width = phys_size.width as f64 / scale;
    let logical_x = phys_pos.x as f64 / scale;
    let logical_y = phys_pos.y as f64 / scale;

    let history_height = 300.0_f64;
    let gap = 8.0_f64;
    let history_x = logical_x;
    let history_y = logical_y - history_height - gap;

    let history_window = if let Some(existing) = app.get_webview_window("history") {
        existing
            .set_position(PhysicalPosition::new(
                (history_x * scale) as i32,
                (history_y * scale) as i32,
            ))
            .map_err(|e| e.to_string())?;
        show_without_focus(&existing)?;
        existing
    } else {
        WebviewWindowBuilder::new(&app, "history", WebviewUrl::App("index.html".into()))
            .title("")
            .decorations(false)
            .always_on_top(true)
            .resizable(false)
            .focused(false)
            .skip_taskbar(true)
            .inner_size(logical_width, history_height)
            .position(history_x, history_y)
            .build()
            .map_err(|e| e.to_string())?
    };

    // Attach as macOS child window so the OS moves it with the panel — no lag.
    #[cfg(target_os = "macos")]
    add_child_window(&panel, &history_window)?;

    Ok(())
}

#[tauri::command]
fn close_history_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("history") {
        #[cfg(target_os = "macos")]
        if let Some(panel) = app.get_webview_window("panel") {
            let _ = remove_child_window(&panel, &window);
        }
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_task_dropdown,
            close_task_dropdown,
            open_history_window,
            close_history_window
        ])
        .setup(|app| {
            let window = app.get_webview_window("panel").unwrap();

            if let Some(monitor) = window.current_monitor()? {
                let screen_size = monitor.size();
                let scale = monitor.scale_factor();

                let win_height: f64 = 160.0;
                let bottom_margin: f64 = 100.0;
                let win_width: f64 = 320.0;
                let right_margin: f64 = 12.0;

                let x = (screen_size.width as f64 - (win_width + right_margin) * scale) as i32;
                let y = (screen_size.height as f64 - (win_height + bottom_margin) * scale) as i32;

                window.set_position(PhysicalPosition::new(x, y))?;
            }

            window.show()?;

            // Hide the dropdown whenever the panel loses OS focus.
            let app_handle = app.handle().clone();
            window.on_window_event(move |event| {
                if let WindowEvent::Focused(false) = event {
                    if let Some(dropdown) = app_handle.get_webview_window("task-dropdown") {
                        let _ = dropdown.hide();
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
