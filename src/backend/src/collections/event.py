from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

@dataclass
class Event:
    eventId: str
    clubId: str
    name: str
    description: str
    startTime: datetime
    endTime: datetime
    location: str
    gCalEventId: Optional[str] = None
    createdAt: datetime = field(default_factory=datetime.utcnow)
    organizerId: str = ""
