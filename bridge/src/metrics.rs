// One-shot, read-only diagnostics. Never read files, env vars, command lines or credentials.
use serde_json::{json, Value};
use std::time::{SystemTime, UNIX_EPOCH};
use sysinfo::{Disks, System};

const PROCESS_GROUPS: &[(&str, &[&str])] = &[
    ("Edge", &["msedge.exe", "msedge"]),
    ("Ollama", &["ollama.exe", "ollama", "ollama app.exe"]),
    ("Docker", &["docker desktop.exe", "docker desktop", "com.docker.backend.exe", "com.docker.backend"]),
    ("Node", &["node.exe", "node"]),
];

pub fn snapshot() -> Value {
    let mut system = System::new_all();
    // CPU is a differential measurement: sample twice and wait at least the sysinfo interval.
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    system.refresh_cpu_usage();
    let cpu = system.global_cpu_usage();
    let processes: Vec<Value> = PROCESS_GROUPS.iter().map(|(label, names)| {
        let mut count = 0_u64;
        let mut resident_bytes = 0_u64;
        for process in system.processes().values() {
            let process_name = process.name().to_string_lossy().to_ascii_lowercase();
            if names.iter().any(|name| *name == process_name) {
                count += 1;
                resident_bytes = resident_bytes.saturating_add(process.memory());
            }
        }
        json!({"label": label, "count": count, "residentBytes": resident_bytes})
    }).collect();
    // Do not export volume mount points: they may embed user directory names.
    let disks = Disks::new_with_refreshed_list();
    let volumes: Vec<Value> = disks.iter().filter(|disk| disk.total_space() > 0).take(3)
        .map(|disk| json!({"totalBytes":disk.total_space(), "availableBytes":disk.available_space()}))
        .collect();
    let observed_at_ms = SystemTime::now().duration_since(UNIX_EPOCH)
        .ok().and_then(|d| u64::try_from(d.as_millis()).ok());
    json!({
        "platform": std::env::consts::OS,
        "observedAtMs":observed_at_ms,
        "cpuPercent":cpu,
        "memory":{
            "totalBytes": system.total_memory(),
            "usedBytes": system.used_memory(),
            "availableBytes": system.available_memory()
        },
        "processes": processes,
        "disks":volumes
    })
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn snapshot_only_contains_allowlisted_fields() {
        let snapshot = snapshot();
        let obj = snapshot.as_object().expect("snapshot object");
        let keys: std::collections::BTreeSet<_> = obj.keys().map(String::as_str).collect();
        let allowed: std::collections::BTreeSet<_> = ["platform", "observedAtMs", "cpuPercent", "memory", "processes", "disks"].into_iter().collect();
        assert_eq!(keys, allowed);
        assert!(snapshot["memory"]["totalBytes"].is_number());
        assert!(snapshot["processes"].as_array().unwrap().len() <= PROCESS_GROUPS.len());
        assert!(snapshot["disks"].as_array().unwrap().len() <= 3);
    }
}
