'use client';

import { useEffect, useState } from 'react';

interface ActiveEffect {
  type: 'speedBoost' | 'slowDown';
  endTime: number;
}

interface EffectIndicatorProps {
  effect: ActiveEffect | null;
}

export function EffectIndicator({ effect }: EffectIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!effect) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, effect.endTime - now);
      const remainingSeconds = Math.ceil(remaining / 1000);
      setTimeLeft(remainingSeconds);

      if (remaining <= 0) {
        clearInterval(updateTimer);
      }
    }, 100);

    return () => clearInterval(updateTimer);
  }, [effect]);

  if (!effect || timeLeft <= 0) {
    return null;
  }

  const percentage = (timeLeft / 10) * 100;
  const isSpeedBoost = effect.type === 'speedBoost';
  const bgGradient = isSpeedBoost 
    ? 'linear-gradient(to right, #f97316, #eab308)' 
    : 'linear-gradient(to right, #a855f7, #6366f1)';
  const label = isSpeedBoost ? '🍊 Laranja' : '🍇 Uva';
  const description = isSpeedBoost ? '+50% velocidade' : '-50% velocidade';

  return (
    <div className="fixed top-4 right-4 w-64 p-4 bg-gray-900/95 border-2 border-gray-700 rounded-lg backdrop-blur-sm z-40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-bold">{label}</span>
        <span className="text-white text-sm">{timeLeft}s</span>
      </div>
      
      <p className="text-gray-300 text-xs mb-3">{description}</p>
      
      <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div
          className="h-full transition-all duration-100"
          style={{ 
            width: `${percentage}%`,
            background: bgGradient
          }}
        />
      </div>
    </div>
  );
}
