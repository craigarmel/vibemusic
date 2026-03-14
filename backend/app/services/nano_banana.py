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

        avatar_id = f"avatar-{int(time.time())}"
        return {
            "avatar_id": avatar_id,
            "image_url": f"/media/avatars/{avatar_id}.png",
            "prompt": prompt,
            "source": source,
            "provider": "nano-banana-2",
            "created_at": datetime.now(tz=timezone.utc),
        }


nano_banana_service = NanaBananaService()
