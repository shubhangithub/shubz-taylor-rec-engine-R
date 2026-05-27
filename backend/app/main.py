from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from app.recommender import MusicRecommender
from app.spotify_client import SpotifyClient

load_dotenv()

app = FastAPI(title="Music Recommender API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
spotify_client = SpotifyClient()
recommender = MusicRecommender()

class RecommendationRequest(BaseModel):
    liked_songs: List[str]  # List of song IDs or names
    target_artist: Optional[str] = None
    num_recommendations: int = 10

class SongSearchRequest(BaseModel):
    query: str
    artist: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Music Recommender API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/search")
async def search_songs(request: SongSearchRequest):
    """Search for songs on Spotify"""
    try:
        results = await spotify_client.search_songs(
            query=request.query,
            artist=request.artist
        )
        return {"songs": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend")
async def get_recommendations(request: RecommendationRequest):
    """Get music recommendations based on liked songs"""
    try:
        recommendations = await recommender.recommend(
            liked_songs=request.liked_songs,
            target_artist=request.target_artist,
            num_recommendations=request.num_recommendations
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/artist/{artist_name}")
async def get_artist_info(artist_name: str):
    """Get artist information and top tracks"""
    try:
        artist_info = await spotify_client.get_artist_info(artist_name)
        return artist_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/song/{song_id}")
async def get_song_info(song_id: str):
    """Get detailed song information"""
    try:
        song_info = await spotify_client.get_song_info(song_id)
        return song_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

