from pydantic import BaseModel


class ArtistCreateRequest(BaseModel):
    prompt: str


class LoreData(BaseModel):
    name: str
    biography: str
    personality_traits: list[str]
    lyrics: str


class ArtistResponse(BaseModel):
    artist_id: str
    lore: LoreData


class AvatarResponse(BaseModel):
    artist_id: str
    avatar_url: str
