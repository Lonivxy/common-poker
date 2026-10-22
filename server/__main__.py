"""Start the single-process server with bounded transport buffers."""
import os
import uvicorn


if __name__ == "__main__":
    trusted_proxy_ips = os.getenv("FORWARDED_ALLOW_IPS", "")
    if "*" in trusted_proxy_ips:
        raise ValueError("FORWARDED_ALLOW_IPS must name trusted proxy IPs, not '*'")
    uvicorn.run(
        "server.main:app", host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8000")), workers=1,
        ws="auto", ws_max_size=1024, ws_max_queue=4,
        ws_ping_interval=10, ws_ping_timeout=20, ws_per_message_deflate=False,
        limit_concurrency=64, backlog=64, timeout_keep_alive=5,
        timeout_graceful_shutdown=5, h11_max_incomplete_event_size=8192,
        proxy_headers=bool(trusted_proxy_ips), forwarded_allow_ips=trusted_proxy_ips,
        access_log=False, server_header=False,
    )
