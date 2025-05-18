from dataclasses import dataclass, field
from typing import List, Dict, Optional


@dataclass
class Club:
    clubId: str
    name: str
    description: str
    category: str
    logoUrl: str
    coverImageUrl: Optional[str] = None
    contactEmail: str = ""
    officers: List[str] = field(default_factory=list)
    memberCount: int = 0
    socialMediaLinks: Dict[str, str] = field(default_factory=dict)
