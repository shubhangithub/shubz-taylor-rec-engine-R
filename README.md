# 🎵 Music Matrix - AI-Powered Music Recommender

A beautiful, sci-fi themed music recommendation engine that uses Spotify's API and machine learning to recommend songs across artists. Built with Python FastAPI backend and Next.js frontend.

## ✨ Features

- 🎨 **Sci-fi UI** with animated loading screen featuring snake logo
- 🎵 **Multi-artist support** - Get recommendations from any artist
- 🔄 **Cross-artist recommendations** - Like Drake? Get Taylor Swift recommendations!
- 📊 **Interactive visualizations** - See audio features and similarity scores
- ⚡ **Real-time search** - Search Spotify's entire catalog
- 🎯 **ML-powered** - Uses scikit-learn for similarity matching

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Spotify Developer Account (free)

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your **Client ID** and **Client Secret**

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Spotify credentials:
# SPOTIFY_CLIENT_ID=your_client_id
# SPOTIFY_CLIENT_SECRET=your_client_secret

# Run the backend
uvicorn app.main:app --reload
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
music-recommender/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── recommender.py   # ML recommendation engine
│   │   ├── spotify_client.py # Spotify API client
│   │   └── models.py        # Data models
│   ├── requirements.txt
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx     # Main page
│   │   │   └── layout.tsx  # Layout
│   │   └── components/
│   │       ├── LoadingScreen.tsx    # Animated loading
│   │       ├── SongSelector.tsx     # Song search & selection
│   │       ├── Recommendations.tsx  # Display recommendations
│   │       ├── Visualizations.tsx   # Charts & graphs
│   │       └── ArtistSelector.tsx    # Target artist input
│   ├── package.json
│   └── next.config.js
│
└── README.md
```

## 🎮 How to Use

1. **Search for songs** - Type in the search box and select songs you like
2. **Optional: Set target artist** - Want recommendations from a specific artist? Enter their name
3. **Get recommendations** - Click "GENERATE RECOMMENDATIONS"
4. **Explore** - View recommendations with similarity scores and audio features

## 🚀 Deployment

### Backend (Render)

1. Push code to GitHub
2. Go to [Render](https://render.com)
3. Create new Web Service
4. Connect your GitHub repo
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repo
4. Set root directory to `frontend`
5. Add environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL
6. Deploy!

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Spotipy** - Spotify Web API wrapper
- **scikit-learn** - Machine learning for recommendations
- **pandas/numpy** - Data processing

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualizations
- **Lucide React** - Icons

## 🎨 Features in Detail

### Loading Screen
- Animated snake logo (S-shaped)
- Particle effects
- Progress bar
- Sci-fi aesthetic

### Recommendations
- Cosine similarity matching
- Audio feature analysis
- Cross-artist support
- Real-time Spotify search

### Visualizations
- Radar charts for audio features
- Bar charts for similarity scores
- Interactive tooltips

## 📝 Environment Variables

### Backend (.env)
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SUPABASE_URL=optional_supabase_url
SUPABASE_KEY=optional_supabase_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Backend won't start
- Make sure virtual environment is activated
- Check that .env file exists with Spotify credentials
- Verify Python version is 3.9+

### Frontend won't start
- Run `npm install` again
- Check Node.js version (18+)
- Clear `.next` folder and try again

### API errors
- Verify Spotify credentials are correct
- Check backend is running on port 8000
- Check CORS settings in backend

## 📄 License

MIT License - Feel free to use this project!

## 🙏 Credits

- Spotify Web API for music data
- All the amazing open-source libraries used

---

**Made with ❤️ and lots of ☕**

