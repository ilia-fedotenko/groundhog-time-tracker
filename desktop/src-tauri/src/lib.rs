use tauri::{Manager, PhysicalPosition};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
