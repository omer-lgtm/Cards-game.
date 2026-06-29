import { useWarGame } from './hooks/useWarGame';
import { Card, DeckStack } from './components/Card';
import { Confetti } from './components/Confetti';
import { cn } from './utils/cn';

export default function App() {
  const { state, deal, manualFlip, toggleAutoPlay, setSpeed } = useWarGame();

  const hasDealt = state.playerDeck.length > 0 || state.cpuDeck.length > 0;
  const playerCount = state.playerDeck.length;
  const cpuCount = state.cpuDeck.length;
  const warPotSize = state.warPile.length;
  const isWar = state.phase === 'war-pending' || state.phase === 'war-flipping';
  const showingCards = state.playerCard && state.cpuCard;

  // Determine winner highlight for current face-up cards
  let playerHighlight: 'win' | 'lose' | 'war' | null = null;
  let cpuHighlight: 'win' | 'lose' | 'war' | null = null;

  if (showingCards && state.phase === 'flipping') {
    if (state.playerCard!.value > state.cpuCard!.value) {
      playerHighlight = 'win';
      cpuHighlight = 'lose';
    } else if (state.cpuCard!.value > state.playerCard!.value) {
      playerHighlight = 'lose';
      cpuHighlight = 'win';
    } else {
      playerHighlight = 'war';
      cpuHighlight = 'war';
    }
  } else if (isWar) {
    if (state.playerCard) playerHighlight = 'war';
    if (state.cpuCard) cpuHighlight = 'war';
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-slate-950 text-white font-sans">
      <Confetti active={state.phase === 'game-over' && state.winner === 'player'} />

      {/* Header */}
      <header className="w-full max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/40">
            <span className="text-white font-black text-xl">♠</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-200 to-red-400 bg-clip-text text-transparent">
              WAR
            </h1>
            <p className="text-xs text-slate-400">The Classic Card Battle</p>
          </div>
        </div>

        {hasDealt && (
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700">
              <span className="text-slate-400">Round:</span>
              <span className="font-bold text-amber-300">{state.roundNumber}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700">
              <span className="text-slate-400">Wars:</span>
              <span className="font-bold text-red-400">⚔️ {state.warsFought}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main table */}
      <main className="flex-1 w-full max-w-6xl px-4 pb-4">
        <div className="relative felt-bg rounded-3xl border-4 border-amber-900/60 shadow-2xl overflow-hidden min-h-[600px]">
          <div className="felt-bg absolute inset-0 rounded-3xl" />
          <div className="relative z-10 p-4 sm:p-8 flex flex-col min-h-[600px]">

            {!hasDealt ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="text-center space-y-3">
                  <div className="text-6xl mb-2 animate-trophy">🂡</div>
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                    Ready for War?
                  </h2>
                  <p className="text-slate-300 max-w-md mx-auto text-sm sm:text-base">
                    The classic card game where higher card wins the pot. Tie? Go to War — burn 3 cards and battle for all the marbles!
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-xs sm:text-sm text-slate-300 max-w-lg">
                  <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                    <div className="text-2xl mb-1">🎴</div>
                    <div className="font-semibold text-white">52 Cards</div>
                    <div className="text-slate-400">26 per player</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                    <div className="text-2xl mb-1">⚔️</div>
                    <div className="font-semibold text-white">Ties = War</div>
                    <div className="text-slate-400">High card takes all</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                    <div className="text-2xl mb-1">👑</div>
                    <div className="font-semibold text-white">Win All Cards</div>
                    <div className="text-slate-400">To win the game</div>
                  </div>
                </div>

                <button
                  onClick={deal}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 font-black text-lg shadow-lg shadow-red-900/50 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Deal Cards
                </button>
              </div>
            ) : state.phase === 'game-over' ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className={cn(
                  'text-center space-y-4 animate-bounce-in',
                )}>
                  <div className="text-8xl mb-2 animate-trophy">
                    {state.winner === 'player' ? '🏆' : '💀'}
                  </div>
                  <h2 className={cn(
                    'text-5xl sm:text-6xl font-black tracking-tight',
                    state.winner === 'player'
                      ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent'
                  )}>
                    {state.winner === 'player' ? 'Victory!' : 'Defeat!'}
                  </h2>
                  <p className="text-slate-200 text-lg">
                    {state.winner === 'player'
                      ? `You conquered the deck in ${state.roundNumber} rounds with ${state.warsFought} wars!`
                      : `The CPU took all cards after ${state.roundNumber} rounds and ${state.warsFought} wars.`}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={deal}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* CPU side */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-center">
                    <div className={cn(
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3',
                      'bg-red-900/50 border border-red-700/60 text-red-200',
                    )}>
                      <span className="text-lg">🤖</span> CPU
                    </div>
                    <div className="flex gap-0.5 justify-center h-2 items-center mb-1">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                          style={{ width: `${(cpuCount / 52) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 self-start pt-1">
                    {cpuCount} / 52
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 sm:gap-12 mb-4">
                  <DeckStack count={cpuCount} label="Deck" />

                  <div className="flex flex-col items-center gap-3">
                    {/* CPU war burn cards (behind the main card) */}
                    <div className="relative w-24 h-36">
                      {state.warBurnCards.slice(1, 7).reverse().map((_, idx) => {
                        // Show 3 CPU burn cards
                        if (idx % 2 !== 0) return null;
                        const offsetPos = Math.floor(idx / 2);
                        return (
                          <div
                            key={`cpu-burn-${idx}`}
                            className="absolute rounded-lg border-2 border-white/30 bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 shadow w-24 h-36"
                            style={{
                              top: -10 - (2 - offsetPos) * 4,
                              left: -10 - (2 - offsetPos) * 4,
                              zIndex: offsetPos,
                              opacity: 0.7 - offsetPos * 0.15,
                              transform: `rotate(${(offsetPos - 1) * 3}deg)`,
                            }}
                          >
                            <div className="absolute inset-1 rounded-md border border-white/20" />
                          </div>
                        );
                      })}

                      {state.cpuCard ? (
                        <div className={cn(
                              'relative z-10',
                              state.phase === 'flipping' && 'animate-slide-right',
                              isWar && state.phase === 'war-flipping' && 'animate-slide-right',
                            )}>
                          <Card
                            card={state.cpuCard}
                            highlight={cpuHighlight}
                            className={cn(
                              isWar && !state.cpuCard && 'animate-war-shake',
                            )}
                          />
                        </div>
                      ) : isWar && state.warBurnCards.length > 0 ? (
                        <div className="w-24 h-36 rounded-lg border-2 border-yellow-500/50 bg-yellow-900/20 flex items-center justify-center animate-pulse">
                          <span className="text-yellow-400 font-bold text-2xl">⚔️</span>
                        </div>
                      ) : (
                        <div className="w-24 h-36 rounded-lg border-2 border-dashed border-white/10" />
                      )}
                    </div>
                    <div className="text-xs text-red-300 font-semibold h-4">
                      {state.cpuCard ? 'CPU' : ''}
                    </div>
                  </div>
                </div>

                {/* Center battle area / message */}
                <div className="flex items-center justify-center my-2">
                  <div className="relative">
                    {isWar && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-32 h-32 rounded-full bg-yellow-500/20 animate-ping" />
                      </div>
                    )}
                    <div className={cn(
                      'relative px-6 py-2 rounded-full font-bold text-sm sm:text-base text-center',
                      isWar
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-900/50 animate-war-shake'
                        : state.phase === 'flipping' && state.playerCard && state.cpuCard
                          ? state.playerCard.value > state.cpuCard.value
                            ? 'bg-green-600/80 text-white'
                            : state.cpuCard.value > state.playerCard.value
                              ? 'bg-red-600/80 text-white'
                              : 'bg-yellow-500/80 text-black'
                          : 'bg-black/40 text-amber-200 border border-amber-500/30',
                    )}>
                      {state.message}
                      {warPotSize > 2 && !showingCards && (
                        <span className="ml-2 text-xs bg-black/30 px-2 py-0.5 rounded-full">
                          Pot: {warPotSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Player side */}
                <div className="flex items-center justify-center gap-4 sm:gap-12 mt-4">
                  <DeckStack count={playerCount} label="Your Deck" />

                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-24 h-36">
                      {state.warBurnCards.slice(0, 6).map((_, idx) => {
                        if (idx % 2 !== 0) return null;
                        const offsetPos = Math.floor(idx / 2);
                        return (
                          <div
                            key={`p-burn-${idx}`}
                            className="absolute rounded-lg border-2 border-white/30 bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 shadow w-24 h-36"
                            style={{
                              top: 10 + offsetPos * 4,
                              left: -10 - offsetPos * 4,
                              zIndex: offsetPos,
                              opacity: 0.7 - offsetPos * 0.15,
                              transform: `rotate(${(offsetPos - 1) * -3}deg)`,
                            }}
                          >
                            <div className="absolute inset-1 rounded-md border border-white/20" />
                          </div>
                        );
                      })}

                      {state.playerCard ? (
                        <div className="relative z-10">
                          <Card
                            card={state.playerCard}
                            highlight={playerHighlight}
                            className={cn(
                              state.phase === 'flipping' && 'animate-slide-left',
                              isWar && state.phase === 'war-flipping' && 'animate-slide-left',
                            )}
                          />
                        </div>
                      ) : isWar && state.warBurnCards.length > 0 ? (
                        <div className="w-24 h-36 rounded-lg border-2 border-yellow-500/50 bg-yellow-900/20 flex items-center justify-center animate-pulse">
                          <span className="text-yellow-400 font-bold text-2xl">⚔️</span>
                        </div>
                      ) : (
                        <div className="w-24 h-36 rounded-lg border-2 border-dashed border-white/10" />
                      )}
                    </div>
                    <div className="text-xs text-blue-300 font-semibold h-4">
                      {state.playerCard ? 'You' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-4">
                  <div className="text-center">
                    <div className={cn(
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3',
                      'bg-blue-900/50 border border-blue-700/60 text-blue-200',
                    )}>
                      <span className="text-lg">😊</span> You
                    </div>
                    <div className="flex gap-0.5 justify-center h-2 items-center mb-1">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${(playerCount / 52) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 self-end pb-1">
                    {playerCount} / 52
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Controls */}
      {hasDealt && state.phase !== 'game-over' && (
        <footer className="w-full max-w-6xl px-4 pb-4">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={manualFlip}
                disabled={state.phase !== 'idle' || state.isAutoPlay}
                className={cn(
                  'px-5 py-2.5 rounded-xl font-bold transition-all',
                  state.phase === 'idle' && !state.isAutoPlay
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/40'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed',
                )}
              >
                Flip Cards
              </button>

              <button
                onClick={toggleAutoPlay}
                className={cn(
                  'px-5 py-2.5 rounded-xl font-bold transition-all border',
                  state.isAutoPlay
                    ? 'bg-red-600 border-red-500 hover:bg-red-700 shadow-lg shadow-red-900/40'
                    : 'bg-slate-800 border-slate-600 hover:bg-slate-700',
                )}
              >
                {state.isAutoPlay ? '⏸ Pause' : '▶ Auto-Play'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Speed</span>
              <div className="flex gap-1">
                {[
                  { label: 'Slow', value: 1400 },
                  { label: 'Normal', value: 800 },
                  { label: 'Fast', value: 400 },
                  { label: 'Turbo', value: 150 },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSpeed(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      state.speed === opt.value
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1" />

            <button
              onClick={deal}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              🔄 New Deal
            </button>
          </div>

          {/* Battle Log */}
          {state.battleLog.length > 0 && (
            <div className="mt-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3 max-h-28 overflow-y-auto">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Battle Log</div>
              <div className="space-y-0.5">
                {state.battleLog.slice(0, 8).map((log, i) => (
                  <div
                    key={i}
                    className={cn(
                      'text-xs font-mono animate-slide-up',
                      i === 0 ? 'text-amber-200' : 'text-slate-400',
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
