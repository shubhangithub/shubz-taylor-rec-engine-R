import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Optional
from app.spotify_client import SpotifyClient

class MusicRecommender:
    def __init__(self):
        self.spotify_client = SpotifyClient()
        self.scaler = StandardScaler()
        self.feature_columns = [
            'danceability', 'energy', 'key', 'loudness', 'mode',
            'speechiness', 'acousticness', 'instrumentalness',
            'liveness', 'valence', 'tempo', 'duration_ms'
        ]
    
    async def recommend(
        self,
        liked_songs: List[str],
        target_artist: Optional[str] = None,
        num_recommendations: int = 10
    ) -> List[Dict]:
        """Generate recommendations based on liked songs"""
        
        # Get audio features for liked songs
        liked_features = await self._get_features_for_songs(liked_songs)
        
        if not liked_features:
            return []
        
        # Calculate average features of liked songs
        avg_features = self._calculate_average_features(liked_features)
        
        # Search for songs by target artist if specified
        if target_artist:
            candidate_songs = await self._get_artist_songs(target_artist)
        else:
            # Get recommendations from Spotify based on seed tracks
            candidate_songs = await self._get_spotify_recommendations(liked_songs)
        
        if not candidate_songs:
            return []
        
        # Get features for candidate songs
        candidate_ids = [s['id'] for s in candidate_songs]
        candidate_features = await self._get_features_for_songs(candidate_ids)
        
        # Calculate similarity scores
        recommendations = self._calculate_similarity(
            avg_features,
            candidate_songs,
            candidate_features
        )
        
        # Sort by similarity and return top N
        recommendations.sort(key=lambda x: x['similarity'], reverse=True)
        
        return recommendations[:num_recommendations]
    
    async def _get_features_for_songs(self, song_ids: List[str]) -> List[Dict]:
        """Get audio features for a list of songs"""
        features = await self.spotify_client.get_audio_features(song_ids)
        return [f for f in features if f is not None]
    
    def _calculate_average_features(self, features: List[Dict]) -> np.ndarray:
        """Calculate average audio features"""
        df = pd.DataFrame(features)
        
        # Select only numeric feature columns that exist
        available_cols = [col for col in self.feature_columns if col in df.columns]
        feature_matrix = df[available_cols].values
        
        # Handle NaN values
        feature_matrix = np.nan_to_num(feature_matrix, nan=0.0)
        
        # Calculate mean
        avg_features = np.mean(feature_matrix, axis=0)
        
        return avg_features
    
    async def _get_artist_songs(self, artist_name: str, limit: int = 50) -> List[Dict]:
        """Get songs by a specific artist"""
        results = await self.spotify_client.search_songs(query="", artist=artist_name)
        return results[:limit]
    
    async def _get_spotify_recommendations(self, seed_tracks: List[str], limit: int = 50) -> List[Dict]:
        """Get Spotify's recommendations based on seed tracks"""
        try:
            recommendations = self.spotify_client.sp.recommendations(
                seed_tracks=seed_tracks[:5],  # Spotify allows max 5 seed tracks
                limit=limit
            )
            
            songs = []
            for track in recommendations['tracks']:
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
        except Exception as e:
            print(f"Error getting Spotify recommendations: {e}")
            return []
    
    def _calculate_similarity(
        self,
        avg_features: np.ndarray,
        candidate_songs: List[Dict],
        candidate_features: List[Dict]
    ) -> List[Dict]:
        """Calculate cosine similarity between average features and candidates"""
        
        if not candidate_features:
            return []
        
        # Create feature matrix for candidates
        df = pd.DataFrame(candidate_features)
        available_cols = [col for col in self.feature_columns if col in df.columns]
        candidate_matrix = df[available_cols].values
        candidate_matrix = np.nan_to_num(candidate_matrix, nan=0.0)
        
        # Normalize features
        all_features = np.vstack([avg_features.reshape(1, -1), candidate_matrix])
        normalized = self.scaler.fit_transform(all_features)
        
        avg_normalized = normalized[0].reshape(1, -1)
        candidates_normalized = normalized[1:]
        
        # Calculate cosine similarity
        similarities = cosine_similarity(avg_normalized, candidates_normalized)[0]
        
        # Combine with song info
        recommendations = []
        for i, song in enumerate(candidate_songs):
            if i < len(similarities):
                recommendations.append({
                    **song,
                    'similarity': float(similarities[i]),
                    'features': candidate_features[i] if i < len(candidate_features) else {}
                })
        
        return recommendations

