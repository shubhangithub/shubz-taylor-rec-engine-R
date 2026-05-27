'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface VisualizationsProps {
  recommendations: any[];
}

export default function Visualizations({ recommendations }: VisualizationsProps) {
  if (recommendations.length === 0) return null;

  // Prepare data for radar chart
  const radarData = recommendations.slice(0, 3).map(rec => ({
    name: rec.name.substring(0, 15),
    danceability: rec.features?.danceability || 0,
    energy: rec.features?.energy || 0,
    valence: rec.features?.valence || 0,
    acousticness: rec.features?.acousticness || 0,
    speechiness: rec.features?.speechiness || 0,
  }));

  // Prepare data for bar chart
  const barData = recommendations.map(rec => ({
    name: rec.name.substring(0, 20),
    similarity: parseFloat((rec.similarity * 100).toFixed(1)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-cyan-400">📊</span>
        VISUALIZATIONS
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-white mb-4 font-mono">AUDIO FEATURES (TOP 3)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#00ffff" strokeOpacity={0.3} />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fill: '#00ffff', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 1]} 
                tick={{ fill: '#00ffff', fontSize: 10 }}
              />
              <Radar 
                name="danceability" 
                dataKey="danceability" 
                stroke="#00ff00" 
                fill="#00ff00" 
                fillOpacity={0.6} 
              />
              <Radar 
                name="energy" 
                dataKey="energy" 
                stroke="#ff00ff" 
                fill="#ff00ff" 
                fillOpacity={0.6} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid #00ffff',
                  borderRadius: '8px',
                  color: '#00ffff'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#00ffff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white mb-4 font-mono">SIMILARITY SCORES</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#00ffff', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#00ffff', fontSize: 10 }}
                label={{ value: 'Similarity %', angle: -90, position: 'insideLeft', fill: '#00ffff' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid #00ffff',
                  borderRadius: '8px',
                  color: '#00ffff'
                }}
              />
              <Bar 
                dataKey="similarity" 
                fill="url(#colorGradient)"
                radius={[8, 8, 0, 0]}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff00" />
                    <stop offset="50%" stopColor="#00ffff" />
                    <stop offset="100%" stopColor="#ff00ff" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}

