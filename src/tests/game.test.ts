import { expect } from '@jest/globals';

class Game {
  readonly player: string;
  readonly score: number;
  readonly frames: number = 10;
  currentFrame: number = 1;

  static initialize(player: string): Game {
    return new Game(player, 0);
  }

  constructor(player: string, score: number) {
    this.player = player;
    this.score = score;
  }

  play(): void {
    let frame = this.currentFrame;
    for (frame; frame <= this.frames; frame++) {
      this.currentFrame = frame;
    }
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

  it('should play 10 frames when game plays', () => {
    const player = 'Ryu';

    const game = Game.initialize(player);

    game.play();

    expect(game.currentFrame).toBe(10);
  });
});
