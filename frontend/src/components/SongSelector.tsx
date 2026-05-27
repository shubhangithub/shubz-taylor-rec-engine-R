'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music } from 'lucide-react';

interface SongSelectorProps {
  likedSongs: any[];
  setLikedSongs: (songs: any[]) => void;
}

export default function SongSelector({ likedSongs, setLikedSongs }: SongSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      const data = await response.json();
      setSearchResults(data.songs || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const addSong = (song: any) => {
    if (!likedSongs.find(s => s.id === song.id)) {
      setLikedSongs([...likedSongs, song]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeSong = (songId: string) => {
    setLikedSongs(likedSongs.filter(s => s.id !== songId));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
    >
      <motion.h2
        className="text-2xl font-bold text-white mb-4 flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
      >
        <Music className="w-6 h-6 text-cyan-400" />
        SONGS YOU LIKE
      </motion.h2>
      
      <div className="flex gap-2 mb-4">
        <motion.input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for songs..."
          className="flex-1 px-4 py-2 rounded-lg bg-black/30 text-white placeholder-gray-400 border-2 border-cyan-400/50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.button
          onClick={handleSearch}
          disabled={searching}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 px-6 py-2 rounded-lg text-white font-bold shadow-lg shadow-cyan-500/50"
        >
          {searching ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⚡
            </motion.span>
          ) : (
            <Search className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 max-h-48 overflow-y-auto space-y-2 custom-scrollbar"
          >
            {searchResults.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => addSong(song)}
                whileHover={{ scale: 1.02, x: 10 }}
                className="p-3 bg-black/30 hover:bg-cyan-500/20 rounded-lg cursor-pointer flex items-center gap-3 border border-cyan-400/30 hover:border-cyan-400 transition-all"
              >
                {song.image && (
                  <motion.img
                    src={song.image}
                    alt={song.name}
                    className="w-12 h-12 rounded"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">{song.name}</p>
                  <p className="text-gray-300 text-sm">{song.artist}</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="text-cyan-400"
                >
                  +
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence>
          {likedSongs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg border border-purple-400/30"
            >
              <div className="flex items-center gap-3">
                {song.image && (
                  <img src={song.image} alt={song.name} className="w-10 h-10 rounded" />
                )}
                <div>
                  <span className="text-white font-medium">{song.name}</span>
                  <p className="text-gray-300 text-xs">{song.artist}</p>
                </div>
              </div>
              <motion.button
                onClick={() => removeSong(song.id)}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.8 }}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

