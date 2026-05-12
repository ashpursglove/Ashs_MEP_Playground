//! Thread-safe collector for everything the Rust `setup` hook does on launch.
//!
//! The splash screen reads this log via the `get_startup_log` Tauri command
//! and prints each entry as a styled line, so the user can see exactly what
//! the program is doing while WebView2 / Vite / our own bootstrap finish. On
//! a clean machine some of those steps (file-association write, registry
//! reads, exe-path resolution) can briefly look like the app has stalled —
//! the streaming log keeps it honest.

use std::sync::Mutex;

use serde::Serialize;

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum StartupEntryStatus {
    /// Step finished successfully.
    Done,
    /// Step finished without changing anything (e.g. registry already correct).
    Skipped,
    /// Recoverable failure — the user sees the message but the app continues.
    Warning,
    /// Informational only — no specific success / failure semantic.
    Info,
}

#[derive(Debug, Clone, Serialize)]
pub struct StartupEntry {
    pub status: StartupEntryStatus,
    /// Short verb-phrase for the splash, e.g. "Registered .pid handler".
    pub message: String,
    /// Optional finer-grained detail (file path, ms timing, …) shown in
    /// the second-line muted style under the main message.
    pub detail: Option<String>,
}

/// Process-wide bag of startup events. Mutex is fine here — we only touch it
/// from the main thread during `setup` and the command callback, and the
/// total number of entries is < 10.
#[derive(Default)]
pub struct StartupLog(Mutex<Vec<StartupEntry>>);

impl StartupLog {
    pub fn push(&self, status: StartupEntryStatus, message: impl Into<String>) {
        self.push_with_detail(status, message, None::<String>);
    }

    pub fn push_with_detail(
        &self,
        status: StartupEntryStatus,
        message: impl Into<String>,
        detail: Option<impl Into<String>>,
    ) {
        if let Ok(mut guard) = self.0.lock() {
            guard.push(StartupEntry {
                status,
                message: message.into(),
                detail: detail.map(Into::into),
            });
        }
    }

    pub fn snapshot(&self) -> Vec<StartupEntry> {
        self.0.lock().map(|g| g.clone()).unwrap_or_default()
    }
}
