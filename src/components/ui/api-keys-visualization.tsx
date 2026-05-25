import { useEffect, useRef } from 'react';

export function ApiKeysVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 300);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 300;
    };

    window.addEventListener('resize', handleResize);

    // Wave parameters
    let time = 0;
    const numWaves = 5;
    const dotsPerWave = 140;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.0018;

      // Draw waves
      for (let w = 0; w < numWaves; w++) {
        const offset = w * 28;
        const waveHeight = 22 + w * 6;
        const waveSpeed = 0.4 + w * 0.08;
        
        for (let i = 0; i < dotsPerWave; i++) {
          const t = i / dotsPerWave;
          // Starts from center/left and stretches to the right, matching the image
          const x = width * (0.35 + t * 0.65);
          
          // Curve mathematical model: sine wave with time variable
          const angle = t * Math.PI * 2.8 + time * waveSpeed;
          const y = height * 0.42 + Math.sin(angle) * waveHeight + Math.cos(time * 0.5 + t * Math.PI) * 12 + offset;
          
          // Fading at the boundaries
          const fadeLeft = Math.min(1, (x - width * 0.35) / (width * 0.12));
          const fadeRight = Math.min(1, (width - x) / (width * 0.15));
          const alpha = 0.22 * fadeLeft * fadeRight * (1 - w * 0.18);

          if (alpha <= 0) continue;

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          
          // Draw dot particle
          const size = 1.0 + (1 - w * 0.15) * 0.8 + (Math.sin(time * 3 + i) * 0.2);
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-45 select-none z-0"
    />
  );
}
export default ApiKeysVisualization;
