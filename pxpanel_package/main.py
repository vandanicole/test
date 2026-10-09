"""
PXPANEL v13.9.4 - Iran Bypass & SNI Fixed Edition
نسخه بهینه‌سازی‌شده برای رفع باگ SNI و Clean IP در شبکه ایران
"""

import os
import sys
import json
import base64
from urllib.parse import quote, unquote

DEFAULT_PORT = 443
MIN_PORT = 1
MAX_PORT = 65535
DEFAULT_PROTOCOL = "vless-ws"
DEFAULT_FINGERPRINT = "chrome"

FINGERPRINTS = {
    "chrome", "firefox", "safari", "ios", "android",
    "edge", "360", "qq", "random", "randomized"
}

DEFAULT_ALPN_BY_PROTOCOL = {
    "vless-ws": "http/1.1",
    "xhttp-packet-up": "h2,http/1.1",
    "xhttp-stream-up": "h2,http/1.1",
    "xhttp-stream-one": "h2,http/1.1",
    "vmess-ws": "http/1.1",
    "trojan-ws": "http/1.1",
    "hysteria2": "h3",
    "tuic": "h3",
}

def safe_int(v, default=443, min_v=1, max_v=65535):
    try:
        val = int(v)
        return max(min_v, min(max_v, val))
    except (ValueError, TypeError):
        return default

def normalize_protocol(p: str) -> str:
    return str(p or DEFAULT_PROTOCOL).strip().lower()

def generate_vless_link(
    uuid: str,
    host: str,
    remark: str = "PXPanel-Fixed",
    protocol: str = DEFAULT_PROTOCOL,
    fingerprint: str | None = None,
    alpn: str | None = None,
    port: int | None = None,
    sni: str | None = None,
    host_header: str | None = None,
    custom_path: str | None = None,
) -> str:
    """
    تولید لینک سازگار با تفکیک آدرس اتصال، SNI و Host Header
    """
    protocol = normalize_protocol(protocol)
    fp = (fingerprint or DEFAULT_FINGERPRINT).strip().lower()
    if fp not in FINGERPRINTS:
        fp = DEFAULT_FINGERPRINT
    
    port_value = safe_int(port, DEFAULT_PORT, MIN_PORT, MAX_PORT)
    alpn_value = (alpn or DEFAULT_ALPN_BY_PROTOCOL.get(protocol, "http/1.1")).strip()
    label = quote(str(remark or "PXPanel"), safe="")

    effective_sni = (sni or host).strip()
    effective_host = (host_header or sni or host).strip()

    if protocol == "vless-ws":
        path = custom_path or f"/ws/{uuid}"
        q = {
            "encryption": "none",
            "security": "tls",
            "type": "ws",
            "host": effective_host,
            "path": path,
            "sni": effective_sni,
            "fp": fp,
            "alpn": alpn_value,
        }
        query_str = "&".join(f"{k}={quote(str(v), safe=',/')}" for k, v in q.items())
        return f"vless://{uuid}@{host}:{port_value}?{query_str}#{label}"

    if protocol.startswith("xhttp-"):
        mode = protocol.replace("xhttp-", "")
        path = custom_path or f"/xhttp-siz10/{mode}/{uuid}"
        q = {
            "encryption": "none",
            "security": "tls",
            "type": "xhttp",
            "mode": mode,
            "host": effective_host,
            "path": path,
            "sni": effective_sni,
            "fp": fp,
            "alpn": alpn_value,
        }
        query_str = "&".join(f"{k}={quote(str(v), safe=',/')}" for k, v in q.items())
        return f"vless://{uuid}@{host}:{port_value}?{query_str}#{label}"

    if protocol == "vmess-ws":
        raw = {
            "v": "2",
            "ps": remark,
            "add": host,
            "port": port_value,
            "id": uuid,
            "aid": 0,
            "scy": "auto",
            "net": "ws",
            "type": "none",
            "host": effective_host,
            "path": custom_path or f"/ws/{uuid}",
            "tls": "tls",
            "sni": effective_sni,
            "fp": fp,
        }
        encoded = base64.b64encode(json.dumps(raw, separators=(",", ":"), ensure_ascii=False).encode()).decode()
        return f"vmess://{encoded}"

    if protocol == "trojan-ws":
        path_str = quote(custom_path or f"/ws/{uuid}")
        return f"trojan://{uuid}@{host}:{port_value}?security=tls&type=ws&host={quote(effective_host)}&path={path_str}&sni={quote(effective_sni)}&fp={fp}#{label}"

    if protocol == "hysteria2":
        return f"hysteria2://{uuid}@{host}:{port_value}/?sni={quote(effective_sni)}&insecure=0#{label}"

    if protocol == "tuic":
        return f"tuic://{uuid}:{uuid}@{host}:{port_value}?sni={quote(effective_sni)}&alpn={alpn_value}#{label}"

    return f"vless://{uuid}@{host}:{port_value}"
