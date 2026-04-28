import base64
import hashlib
import hmac
import json
import os
import sys
import time
import urllib.error
import urllib.request


def build_payload(text: str) -> dict:
    payload = {
        "msg_type": "text",
        "content": {
            "text": text,
        },
    }

    secret = os.environ.get("FEISHU_BOT_SECRET")
    if secret:
        timestamp = str(int(time.time()))
        sign = hmac.new(
            f"{timestamp}\n{secret}".encode("utf-8"),
            b"",
            digestmod=hashlib.sha256,
        ).digest()
        payload["timestamp"] = timestamp
        payload["sign"] = base64.b64encode(sign).decode("utf-8")

    return payload


def main() -> int:
    webhook = os.environ.get("FEISHU_WEBHOOK_URL")
    if not webhook:
        print("FEISHU_WEBHOOK_URL is required.", file=sys.stderr)
        return 1

    text = " ".join(sys.argv[1:]).strip()
    if not text:
        text = "Codex Feishu notification test."

    data = json.dumps(build_payload(text), ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        webhook,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            body = response.read().decode("utf-8")
    except urllib.error.URLError as error:
        print(f"Feishu delivery failed: {error}", file=sys.stderr)
        return 1

    result = json.loads(body)
    if result.get("code", result.get("StatusCode")) not in (0, None):
        print(f"Feishu delivery failed: {body}", file=sys.stderr)
        return 1

    print(body)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
