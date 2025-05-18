from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime


@dataclass
class ClubPost:
    postId: str
    clubId: str
    authorId: str
    content: str
    imageUrl: Optional[str] = None
    videoUrl: Optional[str] = None
    createdAt: datetime = field(default_factory=datetime.utcnow)
    updatedAt: datetime = field(default_factory=datetime.utcnow)
    likesCount: int = 0
    likedBy: List[str] = field(default_factory=list)
