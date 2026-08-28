import React from 'react';
import { motion } from 'motion/react';

interface AnimatedBlobProps {
  size?: number; // scale multiplier e.g. 3.5 (350px)
  className?: string;
}

export const AnimatedBlob: React.FC<AnimatedBlobProps> = ({
  size = 3.5,
  className = ''
}) => {
  return (
    <div
      id="nimbus-hero-blob-wrapper"
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{
        width: `${100 * size}px`,
        height: `${100 * size}px`
      }}
    >
      {/* Soft ambient light radiating behind the core - slower, grayish-white */}
      <motion.div 
        animate={{
          scale: [size * 0.72, size * 0.84, size * 0.72],
          opacity: [0.28, 0.42, 0.28]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute w-[200px] h-[200px] rounded-full blur-[75px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(120, 126, 140, 0.25) 55%, transparent 100%)',
        }}
      />

      {/* Exact Uiverse.io component by andrew-manzyk */}
      <div
        id="uiverse-andrew-manzyk-blob"
        className="loader"
        style={{
          ['--size' as any]: size,
          transformOrigin: 'center center'
        }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <defs>
            <mask id="clipping">
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div className="box" />
      </div>
    </div>
  );
};

