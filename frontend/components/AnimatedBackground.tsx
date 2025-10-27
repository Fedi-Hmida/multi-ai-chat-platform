'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

export const AnimatedBackground = () => {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [mounted, setMounted] = useState(false);

  // Generate random values only once on mount - reduced to 30 particles for better performance
  const particles = useMemo(() => {
    return [...Array(30)].map(() => ({
      randomX1: Math.random() * 1920,
      randomX2: Math.random() * 1920,
      randomY1: Math.random() * 1080,
      randomY2: Math.random() * 1080,
      randomDuration: Math.random() * 10 + 10,
      randomLeft: Math.random() * 100,
      randomTop: Math.random() * 100,
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
    // Set dimensions on client side only
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) {
    return null; // Don't render on server to avoid hydration mismatch
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-1/4 -left-1/4 w-[900px] h-[900px] bg-gradient-to-tr from-emerald-500/30 via-teal-500/30 to-cyan-500/30 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 100, 0],
          y: [0, -100, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"
      />

      {/* Floating particles effect with pure CSS */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [
                particle.randomX1 * (dimensions.width / 1920),
                particle.randomX2 * (dimensions.width / 1920),
              ],
              y: [
                particle.randomY1 * (dimensions.height / 1080),
                particle.randomY2 * (dimensions.height / 1080),
              ],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.randomDuration,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              left: particle.randomLeft + '%',
              top: particle.randomTop + '%',
            }}
          />
        ))}
      </div>
    </div>
  );
};
