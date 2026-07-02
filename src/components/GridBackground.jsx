import React, { useState, useEffect, useRef } from 'react';
import './GridBackground.css';

const GridBackground = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const containerRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        cancelAnimationFrame(animationFrameId);
        
        animationFrameId = requestAnimationFrame(() => {
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          setMousePos({ x, y });
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="grid-background-container absolute inset-0 overflow-hidden pointer-events-none z-[-1]"
      style={{
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`
      }}
    >
      <div className="grid-pattern w-full h-full absolute inset-0"></div>
      <div className="grid-pattern-spotlight w-full h-full absolute inset-0"></div>
    </div>
  );
};

export default GridBackground;
