mod metrics;
use serde_json::{json, Value};
use std::io::{self, Read, Write};

const MAX_REQUEST_BYTES: usize = 65536;

fn answer(value: &Value) -> Value {
    match value.get("op").and_then(Value::as_str) {
        Some("ping") => json!({
            "ok": true,
            "app": "datapass-edge-bridge",
            "version": env!("CARGO_PKG_VERSION"),
            "capabilities": ["ping", "system_snapshot"]
        }),
        Some("system_snapshot") => json!({
            "ok": true,
            "app": "datapass-edge-bridge",
            "version": env!("CARGO_PKG_VERSION"),
            "snapshot": metrics::snapshot()
        }),
        _ => json!({"ok": false, "error": "unsupported_operation"})
    }
}

fn serve() -> io::Result<()> {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut input = stdin.lock();
    let mut output = stdout.lock();

    loop {
        let mut length = [0_u8; 4];
        match input.read_exact(&mut length) {
            Ok(()) => {}
            Err(err) if err.kind() == io::ErrorKind::UnexpectedEof => return Ok(()),
            Err(err) => return Err(err),
        }
        let size = u32::from_le_bytes(length) as usize;
        if size > MAX_REQUEST_BYTES {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "oversized request"));
        }
        let mut message = vec![0_u8; size];
        input.read_exact(&mut message)?;
        let response = match serde_json::from_slice::<Value>(&message) {
            Ok(request) => answer(&request),
            Err(_) => json!({"ok": false, "error": "invalid_json"}),
        };
        let bytes = serde_json::to_vec(&response)
            .map_err(|err| io::Error::new(io::ErrorKind::InvalidData, err))?;
        output.write_all(&(bytes.len() as u32).to_le_bytes())?;
        output.write_all(&bytes)?;
        output.flush()?;
    }
}

fn main() {
    if let Err(err) = serve() {
        eprintln!("DataPass Edge host: {err}");
        std::process::exit(1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn ping_is_accepted() {
        let reply = answer(&json!({"op": "ping"}));
        assert_eq!(reply["ok"], true);
        assert_eq!(reply["capabilities"][0], "ping");
    }
    #[test]
    fn ping_declares_read_only_snapshot() {
        let reply = answer(&json!({"op": "ping"}));
        assert_eq!(reply["capabilities"][1], "system_snapshot");
    }
    #[test]
    fn arbitrary_operations_are_rejected() {
        for op in ["read_file", "run_command", "upload", "list_files", "delete_file", "spawn", "shell"] {
            assert_eq!(answer(&json!({"op": op}))["ok"], false);
        }
    }
}
