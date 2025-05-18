from dataclasses import dataclass
from datetime import datetime


@dataclass
class ClubMember:
    membershipId: str
    clubId: str
    userId: str
    joinDate: datetime
    role: str = "member"
