import { expect } from '@jest/globals';

class Game {
  readonly player: string;
  readonly score: number;
  readonly frames: number = 10;
  currentFrame: number = 0;

  static initialize(player: string): Game {
    return new Game(player, 0);
  }

  constructor(player: string, score: number) {
    this.player = player;
    this.score = score;
  }

  playerThrowsBall(): void {
    this.currentFrame += 1;
  }
}

describe('game module', () => {
  it('should initialize a new game', () => {
    const player = 'Ryu';

    const game = Game.initialize(player);

    expect(game.player).toBe('Ryu');
    expect(game.score).toBe(0);
    expect(game.frames).toBe(10);
    expect(game.currentFrame).toBe(0);
  });

  it('should increment frame by 1 when player throw ball', () => {
    const player = 'Ryu';

    const game = Game.initialize(player);

    game.playerThrowsBall();

    expect(game.currentFrame).toBe(1);
  });
});
