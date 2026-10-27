mod scrape;

// Runs Scrapling off the async runtime: a stealth browser fetch blocks for several seconds.
#[tauri::command]
async fn fetch_page(url: String, bin: Option<String>) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || scrape::fetch_page(&url, bin.as_deref()))
        .await
        .map_err(|e| e.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![fetch_page])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
