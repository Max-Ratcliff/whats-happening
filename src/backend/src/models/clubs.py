from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field


# class ClubOfficerSchema(BaseModel):
#     """Schema for club officer information."""
#     user_id: str = Field(..., alias="userId")  # Matches your backend plan
#     role: str

#     class Config:
#         populate_by_name = True


class ClubBase(BaseModel):
    """Base model for club data, used for creation and updates."""
    name: str
    description: str
    category: List[str] = Field(default_factory=list)
    contactEmail: List[str] = Field(default_factory=list)
    logoURL: Optional[HttpUrl] = Field(default=None)
    memberCount: int = Field(default=0)

    # # From your dataclass and general plan:
    # cover_image_url: Optional[HttpUrl] = Field(
    #     default=None, alias="coverImageUrl"
    # )
    # social_media_links: Dict[str, HttpUrl] = Field(  # Assuming HttpUrl for values
    #     default_factory=dict, alias="socialMediaLinks"
    # )
    # # Assuming officers are stored as a list of objects, as per backend plan
    # officers: List[ClubOfficerSchema] = Field(default_factory=list)

    class Config:
        """Pydantic model configuration."""
        populate_by_name = True
        from_attributes = True


class ClubResponse(ClubBase):
    """
    Pydantic model for representing a club in API responses.
    Includes the club's ID.
    """
    clubId: str = Field(...)  # Firestore document ID

    class Config:
        """Pydantic model configuration."""
        populate_by_name = True
        from_attributes = True
