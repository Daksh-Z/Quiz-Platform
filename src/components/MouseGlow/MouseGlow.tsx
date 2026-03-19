'use client';
import { useEffect, useRef } from 'react';
import styles from './MouseGlow.module.css';

export function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  
  // Store target and current position entirely outside of React State for raw 120fps DOM performance
  const mouse = useRef({ x: -1000, y: -1000 });
  const pos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const renderLoop = () => {
      // Lerp (Linear Interpolation) applies a heavy fractional curve acting precisely like fluid water drag
      const friction = 0.04;
      const dx = mouse.current.x - pos.current.x;
      const dy = mouse.current.y - pos.current.y;
      
      pos.current.x += dx * friction;
      pos.current.y += dy * friction;

      // Direct DOM mutation completely bypassing React scheduling
      if (glowRef.current) {
        glowRef.current.style.left = `${pos.current.x}px`;
        glowRef.current.style.top = `${pos.current.y}px`;
        
        // Calculate the raw distance between the orb and the mouse (velocity proxy)
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate the exact angle of the movement trajectory
        const angle = Math.atan2(dy, dx);
        
        // Fluid droplet physics: Stretch the orb forward on the movement axis, and squish it vertically
        const stretchX = 1 + (distance * 0.0035);
        const squishY = Math.max(0.3, 1 - (distance * 0.002));
        
        // Asymmetrical Teardrop lighting core
        // Shift the brightest center heavily towards the leading edge (right) to construct a massive fading drop tail!
        const coreShift = Math.min(distance * 0.45, 35); // Shift up to 35% forward on the X axis

        // Inject the geometry and the custom CSS property into the GPU styling safely
        // Subtraction pushes the massive liquid head to follow tightly from the back directly
        glowRef.current.style.setProperty('--core-x', `${50 - coreShift}%`);
        glowRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}rad) scale(${stretchX}, ${squishY})`;
      }
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    renderLoop(); // Ignite the fluid physics engine

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <div ref={glowRef} className={styles.glow} />;
}
