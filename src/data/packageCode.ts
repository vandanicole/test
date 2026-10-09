import { PackageFile } from '../types';

export const PACKAGE_FILES: PackageFile[] = [
  {
    name: 'کد اصلی پایتون (اصلاح‌شده)',
    filename: 'main.py',
    language: 'python',
    description: 'نسخه پچ‌شده PXPanel با تفکیک کامل SNI، Host Header و Clean IP در کانفیگ‌های VLESS و سابسکریپشن',
    content: `"""
PXPANEL v13.9.4 - Iran Bypass & SNI Fixed Edition
اصلاح شده برای عبور از فیلترینگ ایران با پشتیبانی از:
- SNI سفارشی (Custom SNI)
- Host Header مستقل از آدرس اتصال
- تفکیک Clean IP به عنوان آدرس سرور (بدون دستکاری SNI)
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
    p = str(p or DEFAULT_PROTOCOL).strip().lower()
    return p

def generate_vless_link(
    uuid: str,
    host: str,
    remark: str = "PXPanel-Fixed",
    protocol: str = DEFAULT_PROTOCOL,
    fingerprint: str | None = None,
    alpn: str | None = None,
    port: int | None = None,
    sni: str | None = None,          # <-- فیلد اختصاصی SNI
    host_header: str | None = None,  # <-- فیلد اختصاصی هدر وب‌سوکت
    custom_path: str | None = None,
) -> str:
    """
    تولید لینک سازگار با کلاینت‌های v2rayNG / NekoBox / Streisand / MahsaNG
    با تفکیک کامل:
    - host: آدرس سرور فیزیکی یا آی‌پی تمیز کلودفلر (Clean IP)
    - sni: دامنه دارای گواهی معتبر SSL (کلودفلر یا سرور)
    - host_header: دامنه مقصد در هدر HTTP/WS
    """
    protocol = normalize_protocol(protocol)
    fp = (fingerprint or DEFAULT_FINGERPRINT).strip().lower()
    if fp not in FINGERPRINTS:
        fp = DEFAULT_FINGERPRINT
    
    port_value = safe_int(port, DEFAULT_PORT, MIN_PORT, MAX_PORT)
    alpn_value = (alpn or DEFAULT_ALPN_BY_PROTOCOL.get(protocol, "http/1.1")).strip()
    label = quote(str(remark or "PXPanel"), safe="")

    # انتخاب SNI و Host مؤثر (اگر مقدار خاص داده نشده بود، همان دامنه اصلی)
    effective_sni = (sni or host).strip()
    effective_host = (host_header or sni or host).strip()

    # پروتکل VLESS با ترابرد WebSocket
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

    # پروتکل VLESS با ترابرد جدید XHTTP (Splithttp)
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

    # پروتکل VMess
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

    # پروتکل Trojan
    if protocol == "trojan-ws":
        path_str = quote(custom_path or f"/ws/{uuid}")
        return f"trojan://{uuid}@{host}:{port_value}?security=tls&type=ws&host={quote(effective_host)}&path={path_str}&sni={quote(effective_sni)}&fp={fp}#{label}"

    # هیستریا ۲ (Hysteria 2)
    if protocol == "hysteria2":
        return f"hysteria2://{uuid}@{host}:{port_value}/?sni={quote(effective_sni)}&insecure=0#{label}"

    # پروتکل TUIC
    if protocol == "tuic":
        return f"tuic://{uuid}:{uuid}@{host}:{port_value}?sni={quote(effective_sni)}&alpn={alpn_value}#{label}"

    return f"vless://{uuid}@{host}:{port_value}"


def build_subscription_output(
    uuid: str,
    railway_domain: str,
    clean_ips: list[str] | None = None,
    custom_sni: str | None = None,
    protocol: str = "vless-ws",
    config_count: int = 5,
    custom_names: list[str] | None = None,
) -> str:
    """
    تولید لیست کامل کانفیگ‌ها در قالب Base64 سابسکریپشن
    برای هر آی‌پی تمیز، یک کانفیگ مجزا با SNI سالم ساخته می‌شود.
    """
    lines = []
    effective_sni = custom_sni or railway_domain
    effective_host = railway_domain

    if clean_ips and len(clean_ips) > 0:
        for idx, cip in enumerate(clean_ips[:config_count]):
            remark_title = f"PX-Iran-{idx+1} | {cip}"
            link = generate_vless_link(
                uuid=uuid,
                host=cip,                         # آدرس اتصال = آی‌پی تمیز
                remark=remark_title,
                protocol=protocol,
                sni=effective_sni,                # SNI = دامنه معتبر بدون فیلتر
                host_header=effective_host,       # Host = دامنه سرور Railway
            )
            lines.append(link)
    else:
        # در صورت نبود آی‌پی تمیز، با دامنه مستقیم
        link = generate_vless_link(
            uuid=uuid,
            host=railway_domain,
            remark="PX-Direct",
            protocol=protocol,
            sni=effective_sni,
            host_header=effective_host,
        )
        lines.append(link)

    raw_text = "\\n".join(lines)
    return base64.b64encode(raw_text.encode("utf-8")).decode("utf-8")
`,
  },
  {
    name: 'اسکریپت Cloudflare Worker (ریورس پروکسی رایگان)',
    filename: 'cloudflare_worker.js',
    language: 'javascript',
    description: 'کد ورکر کلودفلر برای رفع فیلترینگ Railway بدون نیاز به خرید دامنه و دور زدن کامل فیلترینگ *.up.railway.app',
    content: `/**
 * Cloudflare Worker Reverse Proxy for PXPanel & Railway
 * این اسکریپت ترافیک کلاینت‌ها (شامل WebSocket و XHTTP) را از طریق شبکه کلودفلر
 * دریافت کرده و به سرور Railway شما هدایت می‌کند.
 * 
 * نیازی به خرید دامنه ندارید! از دامنه رایگان your-name.workers.dev یا دامنه خود استفاده کنید.
 */

// آدرس سرور Railway خود را اینجا بدون https:// وارد کنید
const BACKEND_DOMAIN = "your-app-name.up.railway.app";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get("Upgrade");

    // آماده‌سازی آدرس مقصد روی Railway
    const targetUrl = new URL(request.url);
    targetUrl.hostname = BACKEND_DOMAIN;
    targetUrl.protocol = "https:";

    // کپی هدرها با حفظ هدرهای حیاتی WebSocket
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", BACKEND_DOMAIN);
    newHeaders.set("X-Forwarded-Host", url.hostname);
    newHeaders.set("X-Real-IP", request.headers.get("CF-Connecting-IP") || "127.0.0.1");

    // در صورتی که اتصال WebSocket باشد (VLESS-WS)
    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      return fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.body,
      });
    }

    // درخواست‌های معمولی HTTP / XHTTP / Dashboard
    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
        redirect: "follow",
      });

      return response;
    } catch (err) {
      return new Response("Gateway Error: Unable to reach backend server. (" + err.message + ")", {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  },
};
`,
  },
  {
    name: 'فایل وابستگی‌ها (Dependencies)',
    filename: 'requirements.txt',
    language: 'text',
    description: 'پکیج‌های مورد نیاز پایتون برای اجرای بدون خطای PXPanel روی Railway یا سرور شخصی',
    content: `fastapi>=0.110.0
uvicorn[standard]>=0.28.0
aiohttp>=3.9.3
websockets>=12.0
httpx>=0.27.0
requests>=2.31.0
psutil>=5.9.8
pydantic>=2.6.4
python-multipart>=0.0.9
cryptography>=42.0.5
`,
  },
  {
    name: 'کانفیگ دیپلوی Railway',
    filename: 'railway.json',
    language: 'json',
    description: 'تنظیمات خودکار اجرای پروژه در ریل‌وی به همراه تخصیص پورت و دایرکتوری پایدار Volume',
    content: `{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
`,
  },
  {
    name: 'راهنمای کامل رفع فیلترینگ و اجرا (README_FA.md)',
    filename: 'README_FA.md',
    language: 'markdown',
    description: 'دستورالعمل قدم‌به‌قدم برای راه‌اندازی بدون فیلتر با آی‌پی‌های تمیز همراه اول، ایرانسل و مخابرات',
    content: `# 🛡️ راهنمای پکیج اصلاح‌شده PXPanel برای عبور از فیلترینگ ایران

این پکیج به صورت ویژه برای حل مشکلات مسدودسازی در ایران و نقص فنی تولید کانفیگ‌ها بازنویسی شده است.

---

### ❓ چرا نسخه قبلی در ایران وصل نمی‌شد؟
1. **فیلتر بودن دامنه Railway:** دامنه پیش‌فرض \`up.railway.app\` در کلیه اپراتورهای ایران به طور کامل فیلتر و آلوده به DNS Poisoning است.
2. **باگ SNI و Clean IP در کد:** در سورس قبلی، با وارد کردن آی‌پی تمیز، خود آی‌پی به عنوان SNI تنظیم می‌شد که باعث مسدود شدن اتصال TLS (Handshake Failure) می‌شد.

---

### 🚀 ۳ روش اجرای موفق:

#### روش اول: استفاده از ورکر رایگان کلودفلر (بدون نیاز به خرید دامنه - ساده‌ترین راه)
1. وارد پنل [Cloudflare.com](https://dash.cloudflare.com) شوید.
2. از منوی سمت چپ به **Workers & Pages** بروید و یک **Worker** جدید بسازید.
3. کد داخل فایل \`cloudflare_worker.js\` را کپی کرده و در ورکر پیست کنید.
4. در خط ۱۱، متغیر \`BACKEND_DOMAIN\` را با آدرس Railway خود جایگزین کنید (مثال: \`my-px.up.railway.app\`).
5. روی **Deploy** کلیک کنید.
6. اکنون دامنه ورکر شما (مثلاً \`px-gateway.user.workers.dev\`) به عنوان **SNI** و **Host** کار می‌کند و مستقیماً روی اینترنت ایران باز می‌شود!

#### روش دوم: دامنه اختصاصی با پروکسی کلودفلر
1. یک دامنه شخصی (مثل \`ir-cdn.mysite.com\`) به کلودفلر متصل کنید.
2. یک رکورد CNAME بسازید که به آدرس Railway اشاره کند و ابر نارنجی (Proxied) را روشن کنید.
3. در تنظیمات کلاینت:
   - **Address:** آی‌پی تمیز کلودفلر (از تب Clean IP انتخاب کنید).
   - **SNI:** دامنه اختصاصی شما.
   - **Host:** دامنه اختصاصی شما.

#### روش سوم: اعمال کد اصلاح‌شده \`main.py\`
فایل \`main.py\` موجود در این پکیج را در ریپازیتوری Fork شده خود جایگزین کنید تا لینک‌های تولید شده در داشبورد وب و ربات تلگرام، فیلدهای SNI و Clean IP را به درستی تفکیک کنند.
`,
  },
];
