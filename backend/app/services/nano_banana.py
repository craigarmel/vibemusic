import asyncio
import base64

from google import genai
from google.genai import types

from app.config import settings

AVATAR_PROMPT_TEMPLATE = """Create a high-quality portrait of an AI-generated music artist with the following characteristics:

Artist name: {name}
Description: {description}

Style: Photorealistic digital portrait, dramatic lighting, music industry aesthetic.
The portrait should be a headshot/bust showing the face clearly.
Make the character visually striking and memorable, suitable for an album cover or artist profile picture.
Dark moody background with subtle neon accents."""


async def generate_avatar(
    artist_name: str,
    artist_description: str,
    existing_prompt: str | None = None,
) -> tuple[bytes, str]:
    """Generate an artist avatar image using Nano Banana 2.

    Returns a tuple of (image_bytes, prompt_used) for consistency tracking.
    """
    client = genai.Client(api_key=settings.google_ai_api_key)

    if existing_prompt:
        prompt = f"{existing_prompt}\n\nGenerate the SAME character but from a slightly different angle or pose. Maintain character consistency."
    else:
        prompt = AVATAR_PROMPT_TEMPLATE.format(
            name=artist_name,
            description=artist_description,
        )

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=settings.nano_banana_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
        ),
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data:
            image_bytes = base64.b64decode(part.inline_data.data) if isinstance(part.inline_data.data, str) else part.inline_data.data
            return image_bytes, prompt

    raise ValueError("No image data in Nano Banana 2 response")


class NanaBananaService:
    """Synchronous wrapper for the video router's avatar generation endpoint."""

    def generate_avatar(
        self,
        prompt: str = "",
        source: str = "prompt",
        reference_image: str | None = None,
    ) -> dict:
        import time
        from datetime import datetime, timezone
        from pathlib import Path

        avatar_id = f"avatar-{int(time.time())}"
        filename = f"{avatar_id}.png"

        # Create a real placeholder image file so /media/avatars/ serves it
        avatars_dir = settings.media_root / "avatars"
        avatars_dir.mkdir(parents=True, exist_ok=True)
        placeholder_path = avatars_dir / filename

        # Generate a minimal 1x1 PNG placeholder (valid PNG bytes)
        png_header = (
            b'\x89PNG\r\n\x1a\n'  # PNG signature
            b'\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02'
            b'\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx'
            b'\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N'
            b'\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        placeholder_path.write_bytes(png_header)

        return {
            "avatar_id": avatar_id,
            "image_url": f"/media/avatars/{filename}",
            "prompt": prompt,
            "source": source,
            "provider": "nano-banana-2",
            "created_at": datetime.now(tz=timezone.utc),
        }


nano_banana_service = NanaBananaService()
