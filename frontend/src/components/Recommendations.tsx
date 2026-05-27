'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Play } from 'lucide-react';

interface RecommendationsProps {
  recommendations: any[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border-2 border-cyan-400/50">
        <h2 className="text-2xl font-bold text-white mb-4">Recommendations</h2>
        <p className="text-gray-300">Select some songs you like to get recommendations!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
    >
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-cyan-400">⚡</span>
        YOUR RECOMMENDATIONS
      </h2>
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 10 }}
            className="p-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 rounded-lg border border-cyan-400/30 hover:border-cyan-400 transition-all"
          >
            <div className="flex items-start gap-4">
              {rec.image && (
                <motion.img
                  src={rec.image}
                  alt={rec.name}
                  className="w-16 h-16 rounded"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold">{rec.name}</h3>
                  <motion.span
                    className="text-purple-400 text-sm font-bold bg-purple-500/20 px-2 py-1 rounded"
                    whileHover={{ scale: 1.1 }}
                  >
                    #{index + 1}
                  </motion.span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{rec.artist}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <motion.span
                    className="text-green-400 text-sm font-mono"
                    whileHover={{ scale: 1.1 }}
                  >
                    {(rec.similarity * 100).toFixed(1)}% match
                  </motion.span>
                  {rec.preview_url && (
                    <audio controls className="h-8">
                      <source src={rec.preview_url} type="audio/mpeg" />
                    </audio>
                  )}
                  {rec.external_url && (
                    <motion.a
                      href={rec.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

