import { expect } from '@jest/globals';

class Game {
  readonly player: string;
  readonly score: number;
  readonly frames: number;
  currentFrame: number = 1;

  static initialize(player: string, frames: number): Game {
    return new Game(player, 0, frames);
  }

  constructor(player: string, score: number, frames: number) {
    this.player = player;
    this.score = score;
    this.frames = frames;
  }

  play(): void {
    let frame = this.currentFrame;
    for (frame; frame <= this.frames; frame++) {
      this.currentFrame = frame;
    }
  }
}

class Frame {
  readonly number: number;
  readonly maxAttempts: number = 2;
  private leftOverPins: number = 10;
  private currentAttempt: number;
  private score: number = 0;
  private strike: boolean = false;
  private spare: boolean = false;

  static create(number: number): Frame {
    return new Frame(number);
  }

  constructor(number: number) {
    this.number = number;
  }

  knockDown(pins: number) {
    this.leftOverPins = this.leftOverPins - pins;
  }

  play(attempt: number, pins: number): void {
    this.currentAttempt = attempt;
    if (this.currentAttempt <= this.maxAttempts) {
      this.addScore(pins);
      this.knockDown(pins);
      if (this.isStrike()) {
        this.strike = true;
      }
      if (this.isSpare()) {
        this.spare = true;
      }
    }
  }

  private addScore(pins: number) {
    this.score = this.score + pins;
  }

  private isSpare() {
    const secondAttempt = 2;
    const noLeftOverPins = 0;
    return this.currentAttempt === secondAttempt && this.leftOverPins === noLeftOverPins;
  }

  isStrike(): boolean {
    const firstAttempt = 1;
    const noLeftOverPins = 0;
    return this.currentAttempt === firstAttempt && this.leftOverPins === noLeftOverPins;
  }

  getLeftOverPins(): number {
    return this.leftOverPins;
  }

  getAttempt(): number {
    return this.currentAttempt;
  }

  getScore(): number {
    return this.score;
  }

  getStrike(): boolean {
    return this.strike;
  }

  getSpare(): boolean {
    return this.spare;
  }
}

describe('game module', () => {
  it('should initialize a new game', () => {
    const player = 'Ryu';
    const frames = 1;

    const game = Game.initialize(player, frames);

    expect(game.player).toBe('Ryu');
    expect(game.score).toBe(0);
    expect(game.frames).toBe(frames);
    expect(game.currentFrame).toBe(1);
  });

  it('should play 1 frame when game plays', () => {
    const player = 'Ryu';
    const frames = 1;

    const game = Game.initialize(player, frames);

    game.play();

    expect(game.currentFrame).toBe(1);
  });
});

describe('frame module', () => {
  it('should initialize a frame when game plays', () => {
    const frame: Frame = Frame.create(1);

    expect(frame.number).toBe(1);
    expect(frame.maxAttempts).toBe(2);
    expect(frame.getLeftOverPins()).toBe(10);
  });

  it('should knock down given pins', () => {
    const frame: Frame = Frame.create(5);
    const pins = 4;
    frame.knockDown(pins);
    const leftOverPins = frame.getLeftOverPins();
    expect(leftOverPins).toBe(6);
  });

  it('should play 1st attempt of a frame', () => {
    const frame: Frame = Frame.create(2);
    const firstAttempt = 1;
    const knockedOutPins = 6;
    frame.play(firstAttempt, knockedOutPins);
    expect(frame.getAttempt()).toBe(firstAttempt);
    expect(frame.getLeftOverPins()).toBe(4);
  });

  it('should play 2nd attempt of a frame with leftover pins from 1st frame', () => {
    const frame: Frame = Frame.create(7);
    const firstAttempt = 1;
    const firstAttemptKnockedOutPins = 3;
    frame.play(firstAttempt, firstAttemptKnockedOutPins);

    const secondAttempt = 2;
    const secondAttemptKnockedOutPins = 1;
    frame.play(secondAttempt, secondAttemptKnockedOutPins);

    expect(frame.getAttempt()).toBe(secondAttempt);
    expect(frame.getLeftOverPins()).toBe(6);
  });

  it('should add 1st attempt score of a frame', () => {
    const frame: Frame = Frame.create(7);
    const firstAttempt = 1;
    const firstAttemptKnockedOutPins = 3;
    frame.play(firstAttempt, firstAttemptKnockedOutPins);

    expect(frame.getAttempt()).toBe(firstAttempt);
    expect(frame.getLeftOverPins()).toBe(7);
    expect(frame.getScore()).toBe(firstAttemptKnockedOutPins);
  });

  it('should add 2nd attempt score of a frame', () => {
    const frame: Frame = Frame.create(7);
    const firstAttempt = 1;
    const firstAttemptKnockedOutPins = 3;
    frame.play(firstAttempt, firstAttemptKnockedOutPins);

    const secondAttempt = 2;
    const secondAttemptKnockedOutPins = 1;
    frame.play(secondAttempt, secondAttemptKnockedOutPins);

    expect(frame.getAttempt()).toBe(secondAttempt);
    expect(frame.getLeftOverPins()).toBe(6);
    expect(frame.getScore()).toBe(firstAttemptKnockedOutPins + secondAttemptKnockedOutPins);
  });

  it('should determine strike when a player knocks down all 10 pins in 1st attempt of a frame', () => {
    const frame: Frame = Frame.create(7);
    const firstAttempt = 1;
    const firstAttemptKnockedOutPins = 10;
    frame.play(firstAttempt, firstAttemptKnockedOutPins);

    expect(frame.getAttempt()).toBe(firstAttempt);
    expect(frame.getLeftOverPins()).toBe(0);
    expect(frame.getScore()).toBe(firstAttemptKnockedOutPins);
    expect(frame.getStrike()).toBe(true);
  });

  it('should determine spare when a player ends up knocking down all 10 pins in 2st attempt of a frame', () => {
    const frame: Frame = Frame.create(7);
    const firstAttempt = 1;
    const firstAttemptKnockedOutPins = 4;
    frame.play(firstAttempt, firstAttemptKnockedOutPins);

    const secondAttempt = 2;
    const secondAttemptKnockedOutPins = 6;
    frame.play(secondAttempt, secondAttemptKnockedOutPins);

    expect(frame.getAttempt()).toBe(secondAttempt);
    expect(frame.getLeftOverPins()).toBe(0);
    expect(frame.getScore()).toBe(firstAttemptKnockedOutPins + secondAttemptKnockedOutPins);
    expect(frame.getSpare()).toBe(true);
  });
});
