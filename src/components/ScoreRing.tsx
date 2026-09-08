import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  maxScore: number;
  passed: boolean;
  size?: number;
}

export default function ScoreRing({ score, maxScore, passed, size = 180 }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();
    let animationFrame: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [score]);

  const color = passed ? '#10b981' : '#ef4444';
  const bgColor = passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-5xl font-bold"
          style={{ color }}
        >
          {displayScore}
        </span>
        <span className="text-sm text-slate-400 dark:text-slate-500">/ {maxScore}</span>
        <span
          className={`mt-1 px-3 py-0.5 rounded-full text-xs font-medium ${
            passed
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
          }`}
        >
          {passed ? '✓ 及格' : '✗ 不及格'}
        </span>
      </div>
    </div>
  );
}
