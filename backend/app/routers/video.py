from fastapi import APIRouter

from app.models.audio import AvatarGenerateRequest, AvatarResponse
from app.services.nano_banana import nano_banana_service

router = APIRouter(prefix="/api", tags=["video"])


@router.post("/avatars/generate")
async def generate_avatar(request: AvatarGenerateRequest):
    avatar = nano_banana_service.generate_avatar(
        prompt=request.prompt,
        source=request.source,
        reference_image=request.reference_image,
    )
    return {"status": "success", "data": AvatarResponse.model_validate(avatar).model_dump(mode="json")}
