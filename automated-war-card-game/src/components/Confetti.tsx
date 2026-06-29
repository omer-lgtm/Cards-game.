import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  delay: number;
  duration: number;
  xDistance: number;
}

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colors = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#fbbf24', '#22d3ee'];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 720,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 2,
        xDistance: (Math.random() - 0.5) * 80,
      });
    }
    setParticles(newParticles);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // custom property for horizontal drift
            ['--x-drift' as string]: `${p.xDistance}vw`,
          }}
        />
      ))}
    </div>
  );
}
