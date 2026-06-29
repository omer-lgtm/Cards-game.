import { useState, useCallback, useRef, useEffect } from 'react';
import type { Card, Suit, Rank, GameState } from '../types';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return values[rank];
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}${suit}`,
        suit,
        rank,
        value: getRankValue(rank),
        faceUp: false,
      });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const initialState: GameState = {
  playerDeck: [],
  cpuDeck: [],
  playerCard: null,
  cpuCard: null,
  warPile: [],
  warBurnCards: [],
  phase: 'idle',
  warStage: 'initial',
  message: 'Press Deal to start a new game!',
  roundNumber: 0,
  warsFought: 0,
  winner: null,
  battleLog: [],
  isAutoPlay: false,
  speed: 800,
};

export function useWarGame() {
  const [state, setState] = useState<GameState>(initialState);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const deal = useCallback(() => {
    clearTimers();
    autoPlayRef.current = false;
    const shuffled = shuffleDeck(createDeck());
    const midpoint = Math.floor(shuffled.length / 2);
    setState({
      ...initialState,
      playerDeck: shuffled.slice(0, midpoint),
      cpuDeck: shuffled.slice(midpoint),
      message: 'Cards dealt! Click Flip or enable Auto-Play.',
    });
  }, [clearTimers]);



  const doFlip = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'idle' && prev.phase !== 'comparing' && prev.phase !== 'resolving') return prev;
      if (prev.playerDeck.length === 0 || prev.cpuDeck.length === 0) return prev;

      const playerDeck = [...prev.playerDeck];
      const cpuDeck = [...prev.cpuDeck];
      const playerCard = { ...playerDeck.shift()!, faceUp: true };
      const cpuCard = { ...cpuDeck.shift()!, faceUp: true };

      return {
        ...prev,
        playerDeck,
        cpuDeck,
        playerCard,
        cpuCard,
        warPile: [...prev.warPile, playerCard, cpuCard],
        warBurnCards: [],
        phase: 'flipping',
        warStage: 'initial',
        message: `${playerCard.rank}${playerCard.suit} vs ${cpuCard.rank}${cpuCard.suit}`,
        roundNumber: prev.roundNumber + 1,
      };
    });
  }, []);

  const compareCards = useCallback((delay: number) => {
    timeoutRef.current = setTimeout(() => {
      setState(prev => {
        if (!prev.playerCard || !prev.cpuCard) return prev;

        const pVal = prev.playerCard.value;
        const cVal = prev.cpuCard.value;

        if (pVal > cVal) {
          // Player wins
          const won = [...prev.warPile];
          const newPlayerDeck = [...prev.playerDeck, ...won.map(c => ({ ...c, faceUp: false }))];
          const warNote = prev.warPile.length > 2 ? ` ⚔️ War pot: ${won.length} cards!` : '';
          return {
            ...prev,
            playerDeck: newPlayerDeck,
            cpuDeck: prev.cpuDeck,
            playerCard: null,
            cpuCard: null,
            warPile: [],
            warBurnCards: [],
            phase: newPlayerDeck.length >= 52 || prev.cpuDeck.length === 0 ? 'game-over' : 'resolving',
            message: `You win! +${won.length} cards${warNote}`,
            winner: newPlayerDeck.length >= 52 ? 'player' : prev.winner,
            isAutoPlay: newPlayerDeck.length >= 52 ? false : prev.isAutoPlay,
            battleLog: [
              `Round ${prev.roundNumber}: You win with ${prev.playerCard.rank}${prev.playerCard.suit} vs ${prev.cpuCard.rank}${prev.cpuCard.suit} (+${won.length}${warNote ? ' WAR' : ''})`,
              ...prev.battleLog,
            ].slice(0, 30),
            warsFought: prev.warPile.length > 2 ? prev.warsFought + 1 : prev.warsFought,
          };
        } else if (cVal > pVal) {
          // CPU wins
          const won = [...prev.warPile];
          const newCpuDeck = [...prev.cpuDeck, ...won.map(c => ({ ...c, faceUp: false }))];
          const warNote = prev.warPile.length > 2 ? ` ⚔️ War pot: ${won.length} cards!` : '';
          return {
            ...prev,
            playerDeck: prev.playerDeck,
            cpuDeck: newCpuDeck,
            playerCard: null,
            cpuCard: null,
            warPile: [],
            warBurnCards: [],
            phase: newCpuDeck.length >= 52 || prev.playerDeck.length === 0 ? 'game-over' : 'resolving',
            message: `CPU wins! +${won.length} cards${warNote}`,
            winner: newCpuDeck.length >= 52 ? 'cpu' : prev.winner,
            isAutoPlay: newCpuDeck.length >= 52 ? false : prev.isAutoPlay,
            battleLog: [
              `Round ${prev.roundNumber}: CPU wins with ${prev.cpuCard.rank}${prev.cpuCard.suit} vs ${prev.playerCard.rank}${prev.playerCard.suit} (+${won.length}${warNote ? ' WAR' : ''})`,
              ...prev.battleLog,
            ].slice(0, 30),
            warsFought: prev.warPile.length > 2 ? prev.warsFought + 1 : prev.warsFought,
          };
        } else {
          // WAR!
          return {
            ...prev,
            phase: 'war-pending',
            warStage: 'burning',
            message: `⚔️ WAR! Both played ${prev.playerCard.rank}! Burning 3 cards...`,
            battleLog: [
              `Round ${prev.roundNumber}: ⚔️ WAR declared! Both played ${prev.playerCard.rank}`,
              ...prev.battleLog,
            ].slice(0, 30),
          };
        }
      });
    }, delay);
  }, []);

  const doWarBurn = useCallback((currentState: GameState) => {
    timeoutRef.current = setTimeout(() => {
      setState(prev => {
        if (prev.phase !== 'war-pending') return prev;

        // Check if player has enough cards for war
        if (prev.playerDeck.length < 4) {
          return {
            ...prev,
            phase: 'game-over',
            winner: 'cpu',
            message: 'You ran out of cards during war! CPU wins!',
            isAutoPlay: false,
          };
        }
        if (prev.cpuDeck.length < 4) {
          return {
            ...prev,
            phase: 'game-over',
            winner: 'player',
            message: 'CPU ran out of cards during war! You win!',
            isAutoPlay: false,
          };
        }

        const playerDeck = [...prev.playerDeck];
        const cpuDeck = [...prev.cpuDeck];
        const burnCards: Card[] = [];

        // Burn 3 cards from each (face down)
        for (let i = 0; i < 3; i++) {
          burnCards.push({ ...playerDeck.shift()!, faceUp: false });
          burnCards.push({ ...cpuDeck.shift()!, faceUp: false });
        }

        return {
          ...prev,
          playerDeck,
          cpuDeck,
          warBurnCards: burnCards,
          warPile: [...prev.warPile, ...burnCards],
          phase: 'war-flipping',
          warStage: 'flipping',
          message: 'Burning 3 cards... Flip for war!',
        };
      });
    }, currentState.speed * 0.7);
  }, []);

  const doWarFlip = useCallback((currentState: GameState) => {
    timeoutRef.current = setTimeout(() => {
      setState(prev => {
        if (prev.phase !== 'war-flipping') return prev;
        if (prev.playerDeck.length === 0 || prev.cpuDeck.length === 0) {
          return {
            ...prev,
            phase: 'game-over',
            winner: prev.playerDeck.length === 0 ? 'cpu' : 'player',
            message: prev.playerDeck.length === 0 ? 'Out of cards! CPU wins!' : 'CPU out of cards! You win!',
            isAutoPlay: false,
          };
        }

        const playerDeck = [...prev.playerDeck];
        const cpuDeck = [...prev.cpuDeck];
        const playerCard = { ...playerDeck.shift()!, faceUp: true };
        const cpuCard = { ...cpuDeck.shift()!, faceUp: true };

        return {
          ...prev,
          playerDeck,
          cpuDeck,
          playerCard,
          cpuCard,
          warPile: [...prev.warPile, playerCard, cpuCard],
          phase: 'flipping',
          warStage: 'initial',
          message: `WAR: ${playerCard.rank}${playerCard.suit} vs ${cpuCard.rank}${cpuCard.suit}`,
        };
      });
    }, currentState.speed);
  }, []);

  // Game loop effect - handles state transitions
  useEffect(() => {
    if (state.phase === 'flipping') {
      compareCards(state.speed);
    } else if (state.phase === 'war-pending') {
      doWarBurn(state);
    } else if (state.phase === 'war-flipping') {
      doWarFlip(state);
    } else if (state.phase === 'resolving') {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'idle' }));
      }, state.speed * 0.3);
    } else if (state.phase === 'game-over') {
      autoPlayRef.current = false;
    }
  }, [state.phase, state.speed, compareCards, doWarBurn, doWarFlip]);

  // Auto-play effect
  useEffect(() => {
    if (state.isAutoPlay && state.phase === 'idle' && state.playerDeck.length > 0 && state.cpuDeck.length > 0) {
      timeoutRef.current = setTimeout(() => {
        doFlip();
      }, state.speed * 0.4);
    }
  }, [state.phase, state.isAutoPlay, state.playerDeck.length, state.cpuDeck.length, state.speed, doFlip]);

  const toggleAutoPlay = useCallback(() => {
    setState(prev => {
      const newAuto = !prev.isAutoPlay;
      autoPlayRef.current = newAuto;
      return {
        ...prev,
        isAutoPlay: newAuto,
        message: newAuto ? 'Auto-play enabled!' : 'Auto-play paused.',
      };
    });
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const manualFlip = useCallback(() => {
    if (state.phase === 'idle' && state.playerDeck.length > 0 && state.cpuDeck.length > 0) {
      doFlip();
    }
  }, [state.phase, state.playerDeck.length, state.cpuDeck.length, doFlip]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    state,
    deal,
    manualFlip,
    toggleAutoPlay,
    setSpeed,
  };
}
