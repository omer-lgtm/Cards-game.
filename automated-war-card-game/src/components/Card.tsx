import { cn } from '../utils/cn';
import type { Card as CardType } from '../types';

interface CardProps {
  card?: CardType | null;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animateIn?: boolean;
  highlight?: 'win' | 'lose' | 'war' | null;
  style?: React.CSSProperties;
}

const suitColors: Record<string, string> = {
  '♠': 'text-slate-900',
  '♣': 'text-slate-900',
  '♥': 'text-red-600',
  '♦': 'text-red-600',
};

export function Card({ card, faceDown = false, size = 'md', className, animateIn = false, highlight = null, style }: CardProps) {
  const sizeClasses = {
    sm: 'w-14 h-20 text-xs',
    md: 'w-24 h-36 text-base',
    lg: 'w-32 h-48 text-lg',
  };

  const cornerSize = {
    sm: 'text-[10px]',
    md: 'text-sm',
    lg: 'text-base',
  };

  const rankSize = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  if (!card) {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-dashed border-white/20 bg-transparent',
          sizeClasses[size],
          className
        )}
        style={style}
      />
    );
  }

  if (faceDown) {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-white/30 shadow-lg relative overflow-hidden',
          'bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900',
          sizeClasses[size],
          animateIn && 'animate-card-deal',
          className
        )}
        style={style}
      >
        <div className="absolute inset-1 rounded-md border border-white/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-0.5 opacity-30">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  const highlightRing = {
    win: 'ring-4 ring-green-400 ring-offset-2 ring-offset-transparent shadow-green-400/50 shadow-xl',
    lose: 'ring-4 ring-red-400 ring-offset-2 ring-offset-transparent shadow-red-400/50 shadow-xl',
    war: 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-transparent shadow-yellow-400/50 shadow-xl animate-pulse',
    null: '',
  }[highlight as string] ?? '';

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-300 bg-white shadow-lg relative flex flex-col',
        'transition-all duration-300',
        sizeClasses[size],
        animateIn && 'animate-card-flip',
        highlightRing,
        className
      )}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Top left corner */}
      <div className={cn('absolute top-1 left-1.5 flex flex-col items-center font-bold leading-none', cornerSize[size], suitColors[card.suit])}>
        <span>{card.rank}</span>
        <span className={cn(size !== 'sm' ? 'text-base' : 'text-xs')}>{card.suit}</span>
      </div>

      {/* Center suit */}
      <div className="flex-1 flex items-center justify-center">
        <span className={cn(rankSize[size], isRed ? 'text-red-600' : 'text-slate-900', 'font-bold')}>
          {card.suit}
        </span>
      </div>

      {/* Bottom right corner (rotated) */}
      <div className={cn('absolute bottom-1 right-1.5 flex flex-col items-center font-bold leading-none rotate-180', cornerSize[size], suitColors[card.suit])}>
        <span>{card.rank}</span>
        <span className={cn(size !== 'sm' ? 'text-base' : 'text-xs')}>{card.suit}</span>
      </div>
    </div>
  );
}

// Stack of face-down cards to represent a deck
export function DeckStack({ count, label, align = 'left' }: { count: number; label: string; align?: 'left' | 'right' }) {
  const maxVisible = Math.min(count, 5);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('text-sm font-semibold uppercase tracking-wider', align === 'left' ? 'text-blue-300' : 'text-red-300')}>
        {label}
      </div>
      <div className={cn('relative', count > 0 ? 'w-24 h-36' : 'w-24 h-36')}>
        {count === 0 ? (
          <div className="w-24 h-36 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
            <span className="text-white/30 text-xs">Empty</span>
          </div>
        ) : (
          <>
            {Array.from({ length: maxVisible }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-lg border-2 border-white/30 bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 shadow-md w-24 h-36"
                style={{
                  top: -(maxVisible - 1 - i) * 2,
                  left: -(maxVisible - 1 - i) * 1,
                  zIndex: i,
                }}
              >
                <div className="absolute inset-1 rounded-md border border-white/20" />
              </div>
            ))}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded-full text-xs font-bold text-white whitespace-nowrap">
              {count} card{count !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
