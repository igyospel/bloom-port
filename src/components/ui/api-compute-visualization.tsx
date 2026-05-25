import { useEffect, useRef } from 'react';

export function ApiComputeVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 400);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 400;
    };

    window.addEventListener('resize', handleResize);

    // Particle class for data streams
    class FlowParticle {
      x: number;
      y: number;
      speed: number;
      length: number;
      lineWidth: number;
      lineIndex: number;

      constructor(lineIndex: number) {
        this.lineIndex = lineIndex;
        this.x = Math.random() * width;
        this.speed = 1.2 + Math.random() * 1.5;
        this.length = 15 + Math.random() * 25;
        this.lineWidth = 1.0 + Math.random() * 0.8;
        this.y = 0;
      }

      update() {
        this.x += this.speed;
        if (this.x > width + this.length) {
          this.x = -this.length;
          this.speed = 1.2 + Math.random() * 1.5;
        }

        // Project coordinate on curve
        const t = this.x / width;
        const offset = this.lineIndex * 45;
        const amplitude = 30 + this.lineIndex * 8;
        const frequency = Math.PI * 2.2;
        this.y = height * 0.45 + Math.sin(t * frequency) * amplitude + offset;
      }

      draw() {
        if (this.x < 0 || this.x > width) return;

        // Gradient for particle tail
        const grad = ctx.createLinearGradient(this.x - this.length, this.y, this.x, this.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, `rgba(255, 255, 255, ${0.12 * (1 - this.lineIndex * 0.2)})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.x - this.length, this.y);
        
        // Draw segment
        const steps = 6;
        for (let j = 0; j <= steps; j++) {
          const sx = this.x - this.length + (this.length * j) / steps;
          const st = sx / width;
          const offset = this.lineIndex * 45;
          const amplitude = 30 + this.lineIndex * 8;
          const frequency = Math.PI * 2.2;
          const sy = height * 0.45 + Math.sin(st * frequency) * amplitude + offset;
          ctx.lineTo(sx, sy);
        }
        
        ctx.stroke();
      }
    }

    const lines = 4;
    const particles: FlowParticle[] = [];
    const particlesPerLine = 8;

    for (let l = 0; l < lines; l++) {
      for (let p = 0; p < particlesPerLine; p++) {
        particles.push(new FlowParticle(l));
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background guide lines
      ctx.lineWidth = 0.5;
      for (let l = 0; l < lines; l++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.015 * (1 - l * 0.2)})`;
        ctx.beginPath();
        const steps = 60;
        for (let j = 0; j <= steps; j++) {
          const sx = (width * j) / steps;
          const st = sx / width;
          const offset = l * 45;
          const amplitude = 30 + l * 8;
          const frequency = Math.PI * 2.2;
          const sy = height * 0.45 + Math.sin(st * frequency) * amplitude + offset;
          if (j === 0) {
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();
      }

      // Draw moving particles
      for (const p of particles) {
        p.update();
        p.draw();
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
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 select-none z-0"
    />
  );
}
export default ApiComputeVisualization;
