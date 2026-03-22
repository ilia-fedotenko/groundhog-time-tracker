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

    if let Some(existing) = app.get_webview_window("task-dropdown") {
        existing
            .set_position(PhysicalPosition::new(
                (dropdown_x * scale) as i32,
                (dropdown_y * scale) as i32,
            ))
            .map_err(|e| e.to_string())?;
        show_without_focus(&existing)?;
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
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn close_task_dropdown(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("task-dropdown") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_task_dropdown,
            close_task_dropdown
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

            // Hide the dropdown whenever the panel loses OS focus
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
