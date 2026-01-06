import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-600 via-green-500 to-emerald-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: Math.random() * 100 + 50,
                    height: Math.random() * 100 + 50,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    scale: [0, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Logo Container */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Logo Icon */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.3 
              }}
            >
              <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                <Leaf className="w-12 h-12 text-green-600" />
                <motion.div
                  className="absolute -right-1 -bottom-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  <Zap className="w-4 h-4 text-yellow-900" />
                </motion.div>
              </div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              className="text-4xl font-bold text-white mb-2 tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              GreenPath
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-green-100 text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Mobilidade Sustentável
            </motion.p>
          </motion.div>

          {/* Loading Indicator */}
          <motion.div
            className="absolute bottom-20 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
