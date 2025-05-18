from dataclasses import dataclass, field
from typing import List, Dict, Optional

@dataclass
class User:
    userId: str
    name: str
    email: str
    displayName: Optional[str] = None
    joinedClubs: List[str] = field(default_factory=List)
    notificationPreferences: Dict[str, bool] = field(default_factory=dict)
    isOfficerOf: List[str] = field(default_factory=list)
    likedContent: List[str] = field(default_factory=list)
    eventsAttend: List[str] = field(default_factory=list)