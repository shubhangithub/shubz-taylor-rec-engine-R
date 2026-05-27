from pydantic import BaseModel
from typing import List, Optional

class Song(BaseModel):
    id: str
    name: str
    artist: str
    album: Optional[str] = None
    preview_url: Optional[str] = None
    external_url: Optional[str] = None
    image: Optional[str] = None

class Recommendation(BaseModel):
    song: Song
    similarity: float
    features: Optional[dict] = None

