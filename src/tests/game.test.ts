import { expect } from '@jest/globals';

class Game {
  readonly player: string;
  readonly score: number;
  readonly frames: number = 1;
  readonly pins: number = 10;
  readonly attemptPerFrame = 2;
  currentFrame: number = 1;
  currentAttemptKnockedDownPins: number = 0;

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
      this.playerThrowsBall();
    }
  }

  playerThrowsBall(): void {
    let currenAttempt = 1;
    for (currenAttempt; currenAttempt <= this.attemptPerFrame; currenAttempt++) {
      this.knocksDownPins();
    }
  }

  knocksDownPins(): void {
    this.currentAttemptKnockedDownPins = Math.floor(Math.random() * this.pins);
  }
}

class Frame {
  readonly number: number;
  readonly maxAttempts: number = 2;
  private leftOverPins: number = 10;

  static create(number: number): Frame {
    return new Frame(number);
  }

  constructor(number: number) {
    this.number = number;
  }

  knockDown(pins: number) {
    this.leftOverPins = this.leftOverPins - pins;
  }

  getLeftOverPins(): number {
    return this.leftOverPins;
  }
}

describe('game module', () => {
  it('should initialize a new game', () => {
    const player = 'Ryu';

    const game = Game.initialize(player);

    expect(game.player).toBe('Ryu');
    expect(game.score).toBe(0);
    expect(game.frames).toBe(1);
    expect(game.currentFrame).toBe(1);
  });

  it('should play 1 frame when game plays', () => {
    const player = 'Ryu';

    const game = Game.initialize(player);

    game.play();

    expect(game.currentFrame).toBe(1);
  });

  it('should knock down pins', () => {
    const player = 'Ryu';

    const game = Game.initialize(player);

    game.knocksDownPins();

    expect(game.currentAttemptKnockedDownPins).toBeGreaterThanOrEqual(0);
  });

  it('should add amount of pins when player attempted to knock down pins', () => {
    const player = 'Ryu';

    const game = Game.initialize(player);

    game.play();

    expect(game.currentAttemptKnockedDownPins).toBeGreaterThan(0);
  });
});

describe('frame module', () => {
  it('should initialize a frame when game plays', () => {
    const frame: Frame = Frame.create(1);

    expect(frame.number).toBe(1);
    expect(frame.maxAttempts).toBe(2);
    expect(frame.getLeftOverPins).toBe(10);
  });

  it('should knock down given pins', () => {
    const frame: Frame = Frame.create(5);
    const pins = 4;
    frame.knockDown(pins);
    const leftOverPins = frame.getLeftOverPins();
    expect(leftOverPins).toBe(6);
  });
});
