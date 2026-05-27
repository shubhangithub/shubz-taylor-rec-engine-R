import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
from typing import List, Dict, Optional

class SpotifyClient:
    def __init__(self):
        client_id = os.getenv("SPOTIFY_CLIENT_ID")
        client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            raise ValueError("Spotify credentials not found in environment")
        
        client_credentials_manager = SpotifyClientCredentials(
            client_id=client_id,
            client_secret=client_secret
        )
        self.sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
    
    async def search_songs(self, query: str, artist: Optional[str] = None) -> List[Dict]:
        """Search for songs on Spotify"""
        search_query = f"{query}"
        if artist:
            search_query += f" artist:{artist}"
        
        results = self.sp.search(q=search_query, type='track', limit=20)
        
        songs = []
        for track in results['tracks']['items']:
            songs.append({
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join([a['name'] for a in track['artists']]),
                'album': track['album']['name'],
                'preview_url': track['preview_url'],
                'external_url': track['external_urls']['spotify'],
                'image': track['album']['images'][0]['url'] if track['album']['images'] else None
            })
        
        return songs
    
    async def get_audio_features(self, song_ids: List[str]) -> List[Dict]:
        """Get audio features for songs"""
        features = self.sp.audio_features(song_ids)
        return features
    
    async def get_song_info(self, song_id: str) -> Dict:
        """Get detailed information about a song"""
        track = self.sp.track(song_id)
        features = self.sp.audio_features([song_id])[0]
        
        return {
            'id': track['id'],
            'name': track['name'],
            'artist': ', '.join([a['name'] for a in track['artists']]),
            'album': track['album']['name'],
            'preview_url': track['preview_url'],
            'external_url': track['external_urls']['spotify'],
            'image': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'features': features
        }
    
    async def get_artist_info(self, artist_name: str) -> Dict:
        """Get artist information and top tracks"""
        results = self.sp.search(q=f"artist:{artist_name}", type='artist', limit=1)
        
        if not results['artists']['items']:
            return {}
        
        artist = results['artists']['items'][0]
        top_tracks = self.sp.artist_top_tracks(artist['id'])
        
        return {
            'id': artist['id'],
            'name': artist['name'],
            'genres': artist['genres'],
            'popularity': artist['popularity'],
            'image': artist['images'][0]['url'] if artist['images'] else None,
            'top_tracks': [
                {
                    'id': track['id'],
                    'name': track['name'],
                    'preview_url': track['preview_url'],
                    'external_url': track['external_urls']['spotify']
                }
                for track in top_tracks['tracks']
            ]
        }

