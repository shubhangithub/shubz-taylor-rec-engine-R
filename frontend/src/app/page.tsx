'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SongSelector from '@/components/SongSelector';
import Recommendations from '@/components/Recommendations';
import Visualizations from '@/components/Visualizations';
import ArtistSelector from '@/components/ArtistSelector';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [targetArtist, setTargetArtist] = useState<string>('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Hide loading after initial load
    const timer = setTimeout(() => setShowLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleGetRecommendations = async () => {
    if (likedSongs.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liked_songs: likedSongs.map(s => s.id),
          target_artist: targetArtist || null,
          num_recommendations: 10,
        }),
      });
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showLoading && (
          <LoadingScreen onComplete={() => setShowLoading(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Floating orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                width: Math.random() * 400 + 200,
                height: Math.random() * 400 + 200,
                background: i % 2 === 0 
                  ? 'radial-gradient(circle, #00ff00, transparent)'
                  : 'radial-gradient(circle, #ff00ff, transparent)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 200 - 100, 0],
                y: [0, Math.random() * 200 - 100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Animated header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-8"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-4"
              animate={{
                textShadow: [
                  '0 0 20px #00ff00, 0 0 40px #00ff00',
                  '0 0 30px #ff00ff, 0 0 60px #ff00ff',
                  '0 0 20px #00ff00, 0 0 40px #00ff00',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                🎵 MUSIC MATRIX
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-300 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {'>'} DISCOVER SONGS ACROSS DIMENSIONS {'<'}
            </motion.p>

            {/* Decorative elements */}
            <motion.div
              className="flex justify-center gap-4 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <SongSelector
                likedSongs={likedSongs}
                setLikedSongs={setLikedSongs}
              />
              
              <ArtistSelector
                targetArtist={targetArtist}
                setTargetArtist={setTargetArtist}
              />

              <motion.button
                onClick={handleGetRecommendations}
                disabled={likedSongs.length === 0 || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 opacity-75 blur-xl" />
                <div className="relative bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 hover:from-green-400 hover:via-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all border-2 border-cyan-400 shadow-lg shadow-cyan-500/50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⚡
                      </motion.span>
                      PROCESSING...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      🚀 GENERATE RECOMMENDATIONS
                    </span>
                  )}
                </div>
              </motion.button>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-6"
            >
              <AnimatePresence mode="wait">
                {recommendations.length > 0 ? (
                  <motion.div
                    key="recommendations"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Recommendations recommendations={recommendations} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border-2 border-cyan-400/50"
                  >
                    <p className="text-gray-300 text-center font-mono">
                      {'>'} AWAITING INPUT {'<'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8"
            >
              <Visualizations recommendations={recommendations} />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

