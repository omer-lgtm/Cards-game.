export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
  faceUp: boolean;
}

export type GamePhase = 'idle' | 'flipping' | 'comparing' | 'war-pending' | 'war-flipping' | 'resolving' | 'game-over';

export type WarStage = 'initial' | 'burning' | 'flipping';

export interface GameState {
  playerDeck: Card[];
  cpuDeck: Card[];
  playerCard: Card | null;
  cpuCard: Card | null;
  warPile: Card[];
  warBurnCards: Card[];
  phase: GamePhase;
  warStage: WarStage;
  message: string;
  roundNumber: number;
  warsFought: number;
  winner: 'player' | 'cpu' | null;
  battleLog: string[];
  isAutoPlay: boolean;
  speed: number;
}
