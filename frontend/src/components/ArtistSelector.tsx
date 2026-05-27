'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface ArtistSelectorProps {
  targetArtist: string;
  setTargetArtist: (artist: string) => void;
}

export default function ArtistSelector({ targetArtist, setTargetArtist }: ArtistSelectorProps) {
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
        <User className="w-6 h-6 text-cyan-400" />
        TARGET ARTIST (OPTIONAL)
      </motion.h2>
      
      <motion.input
        type="text"
        value={targetArtist}
        onChange={(e) => setTargetArtist(e.target.value)}
        placeholder="e.g., Taylor Swift, Drake..."
        className="w-full px-4 py-2 rounded-lg bg-black/30 text-white placeholder-gray-400 border-2 border-cyan-400/50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        whileFocus={{ scale: 1.02 }}
      />
      
      <p className="text-gray-400 text-sm mt-2">
        Leave empty to get recommendations from any artist
      </p>
    </motion.div>
  );
}

