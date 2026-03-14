from __future__ import annotations

import base64
from datetime import datetime, timezone
from uuid import uuid4


class NanoBananaService:
    provider = "nano-banana-mock"

    def generate_avatar(self, prompt: str, source: str, reference_image: str | None) -> dict:
        avatar_id = str(uuid4())
        label = (prompt or "AI stage avatar").strip()[:44]
        source_label = source.replace("-", " ").title()

        if reference_image:
            image_url = reference_image
        else:
            svg = f"""
            <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
              <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#2df6c7" />
                  <stop offset="50%" stop-color="#ff7a18" />
                  <stop offset="100%" stop-color="#111111" />
                </linearGradient>
              </defs>
              <rect width="1024" height="1024" rx="120" fill="url(#bg)" />
              <circle cx="512" cy="390" r="180" fill="#111111" fill-opacity="0.26" />
              <rect x="246" y="610" width="532" height="220" rx="64" fill="#111111" fill-opacity="0.22" />
              <text x="512" y="650" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#fff" letter-spacing="8">AI AVATAR</text>
              <text x="512" y="720" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#fff">{self._escape(label)}</text>
              <text x="512" y="786" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#fff" fill-opacity="0.8">{self._escape(source_label)}</text>
            </svg>
            """.strip()
            encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
            image_url = f"data:image/svg+xml;base64,{encoded}"

        return {
            "avatar_id": avatar_id,
            "image_url": image_url,
            "prompt": prompt or "AI stage avatar",
            "source": source,
            "provider": self.provider,
            "created_at": datetime.now(tz=timezone.utc),
        }

    def _escape(self, value: str) -> str:
        return (
            value.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&apos;")
        )


nano_banana_service = NanoBananaService()
