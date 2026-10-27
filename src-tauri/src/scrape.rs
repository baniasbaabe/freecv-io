// Std-only so it can be tested without the WebView stack: `rustc --edition 2024 --test src/scrape.rs`.
use std::path::PathBuf;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

const INSTALL_HINT: &str = "Scrapling isn't installed or wasn't found. Install it with: pip install \"scrapling[fetchers,rag]==0.4.15\" && scrapling install. If it is installed, set its full path in Settings.";

// GUI apps on macOS/Linux don't inherit the shell PATH, so also try where pip/Homebrew usually put it.
fn candidates(custom: Option<&str>) -> Vec<PathBuf> {
    if let Some(c) = custom.map(str::trim).filter(|c| !c.is_empty()) {
        return vec![PathBuf::from(c)];
    }
    let mut v = vec![PathBuf::from("scrapling")];
    if let Some(home) = std::env::var_os("HOME").or_else(|| std::env::var_os("USERPROFILE")) {
        let home = PathBuf::from(home);
        v.push(home.join(".local/bin/scrapling"));
        if let Ok(dirs) = std::fs::read_dir(home.join("Library/Python")) {
            v.extend(dirs.flatten().map(|d| d.path().join("bin/scrapling")));
        }
    }
    // Windows `pip install --user` puts it in %APPDATA%\Python\PythonXY\Scripts, which isn't on PATH.
    if let Some(appdata) = std::env::var_os("APPDATA") {
        if let Ok(dirs) = std::fs::read_dir(PathBuf::from(appdata).join("Python")) {
            v.extend(dirs.flatten().map(|d| d.path().join("Scripts").join("scrapling.exe")));
        }
    }
    v.push("/opt/homebrew/bin/scrapling".into());
    v.push("/usr/local/bin/scrapling".into());
    v
}

/// Fetches `url` with Scrapling's StealthyFetcher and returns the page as Markdown.
pub fn fetch_page(url: &str, custom_bin: Option<&str>) -> Result<String, String> {
    let url = url.trim();
    // Trust boundary: only plain web links reach the subprocess (also rules out values that look like CLI flags).
    if !(url.starts_with("https://") || url.starts_with("http://")) || url.chars().any(char::is_whitespace) {
        return Err("Enter a full link starting with https://".into());
    }
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or(0);
    let out = std::env::temp_dir().join(format!("freecv-job-{nanos}.md"));

    for bin in candidates(custom_bin) {
        let result = Command::new(&bin)
            .args(["extract", "stealthy-fetch", url])
            .arg(&out)
            .args(["--solve-cloudflare", "--block-ads", "--network-idle", "--timeout", "60000"])
            .output();
        let output = match result {
            Ok(o) => o,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => continue,
            Err(e) => return Err(format!("Couldn't start Scrapling: {e}")),
        };
        let text = std::fs::read_to_string(&out).unwrap_or_default();
        let _ = std::fs::remove_file(&out);
        if !output.status.success() || text.trim().is_empty() {
            let log = String::from_utf8_lossy(&output.stderr);
            let last = log.lines().rev().find(|l| !l.trim().is_empty()).unwrap_or("no output");
            return Err(format!("Scrapling couldn't load that page ({last})."));
        }
        return Ok(text);
    }
    Err(INSTALL_HINT.into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_non_http_input() {
        for bad in ["", "file:///etc/passwd", "--help", "javascript:alert(1)", "https://a.com/x --wait 1"] {
            assert!(fetch_page(bad, None).unwrap_err().starts_with("Enter a full link"), "{bad}");
        }
    }

    #[test]
    fn missing_binary_gives_install_hint() {
        assert_eq!(fetch_page("https://example.com", Some("/nonexistent/scrapling")).unwrap_err(), INSTALL_HINT);
    }

    #[test]
    fn finds_windows_user_install() {
        let appdata = std::env::temp_dir().join(format!("freecv-appdata-{}", std::process::id()));
        std::fs::create_dir_all(appdata.join("Python/Python313/Scripts")).unwrap();
        unsafe { std::env::set_var("APPDATA", &appdata) };
        assert!(candidates(None).contains(&appdata.join("Python/Python313").join("Scripts").join("scrapling.exe")));
        let _ = std::fs::remove_dir_all(&appdata);
    }

    #[test]
    #[ignore = "needs scrapling + network"]
    fn fetches_real_page() {
        assert!(fetch_page("https://example.com", None).unwrap().contains("Example Domain"));
    }
}
