import asyncio
import json

from google import genai

from app.config import settings

LORE_PROMPT_TEMPLATE = """You are a creative AI artist identity designer. Generate a complete artist identity based on the following concept:

"{prompt}"

Return ONLY valid JSON (no markdown, no code blocks) with exactly this structure:
{{
  "name": "A unique, memorable stage name for the artist",
  "biography": "A compelling 2-3 paragraph biography for the artist (150-200 words)",
  "personality_traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "lyrics": "Original song lyrics (one verse + chorus, themed to the artist's style)"
}}

Be creative, evocative, and match the aesthetic described in the concept. The name should feel like a real artist name, not generic."""


async def generate_lore(prompt: str) -> dict:
    """Generate artist lore (name, biography, traits, lyrics) from a creative prompt."""
    client = genai.Client(api_key=settings.google_ai_api_key)

    full_prompt = LORE_PROMPT_TEMPLATE.format(prompt=prompt)

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=settings.gemini_model,
        contents=full_prompt,
    )

    text = response.text.strip()

    # Clean up potential markdown code blocks
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3].strip()
    if text.startswith("json"):
        text = text[4:].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}. Raw response: {text[:200]}")
