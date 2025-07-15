import { expect } from '@jest/globals';

class Game {
  readonly player: string;
  score: number;
  readonly frames: number;
  currentFrame: number;
  playedFrames: Frame[] = [];
  strikeFrames: Frame[] = [];
  spareFrames: Frame[] = [];

  static initialize(player: string, frames: number): Game {
    return new Game(player, 0, frames);
  }

  constructor(player: string, score: number, frames: number) {
    this.player = player;
    this.score = score;
    this.frames = frames;
  }

  play(frame: number, frameAttempt: number, pins: number): void {
    this.currentFrame = frame;
    const currentFrame: Frame = this.getCurrentFrame(frame);
    currentFrame.play(frameAttempt, pins);
  }

  getScore() {
    let accumulator = 0;
    this.playedFrames.forEach((playedFrame) => {
      if (playedFrame.isStrike()) {
        const nextFrame = this.playedFrames.find((nextFrame) => playedFrame.number + 1 === nextFrame.number);
        if (nextFrame) {
          if (!nextFrame.isStrike()) {
            accumulator += nextFrame.calculateScore();
          }
        }
      }
      if (playedFrame.isSpare()) {
        const nextFrame = this.playedFrames.find((nextFrame) => playedFrame.number + 1 === nextFrame.number);
        if (nextFrame) {
          if (!nextFrame.isSpare()) {
            accumulator += nextFrame.getFirstAttemptScore();
          }
        }
      }
      accumulator += playedFrame.calculateScore();
    });
    return accumulator;
  }

  private getCurrentFrame(frame: number): Frame {
    if (this.playedFrames.filter((playedFrame) => playedFrame.number === frame).length === 0) {
      const newFrame: Frame = Frame.create(this.currentFrame);
      this.playedFrames.push(newFrame);
      return newFrame;
    }
    return this.playedFrames.find((playedFrame) => playedFrame.number === frame);
  }
}

class Frame {
  readonly number: number;
  readonly maxAttempts: number = 2;
  private leftOverPins: number = 10;
  private currentAttempt: number;
  private score: number = 0;
  private firstAttemptScore: number = 0;
  private secondAttemptScore: number = 0;
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
    if (this.currentAttempt === 1) {
      this.firstAttemptScore = this.firstAttemptScore + pins;
    }
    if (this.currentAttempt === 2) {
      this.secondAttemptScore = this.secondAttemptScore + pins;
    }
  }

  isSpare() {
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

  calculateScore(): number {
    return this.score + this.firstAttemptScore + this.secondAttemptScore;
  }

  getFirstAttemptScore(): number {
    return this.firstAttemptScore;
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
  });

  it('should play 1 frame when game plays', () => {
    const player = 'Ryu';
    const frames = 1;

    const game = Game.initialize(player, frames);

    const currentFrame = 1;
    const currentFrameAttempt = 1;
    const knockedDownPinsByPlayer = 5;

    game.play(currentFrame, currentFrameAttempt, knockedDownPinsByPlayer);

    expect(game.currentFrame).toBe(1);
  });

  it('should play 1 frame where player scores a strike', () => {
    const player = 'Ryu';
    const frames = 1;

    const game = Game.initialize(player, frames);

    const currentFrame = 1;
    const currentFrameAttempt = 1;
    const knockedDownPinsByPlayer = 10;

    game.play(currentFrame, currentFrameAttempt, knockedDownPinsByPlayer);

    expect(game.frames).toBe(1);
    expect(game.currentFrame).toBe(1);
    expect(game.getScore()).toBe(10);
  });

  it('should play 2 frames where player scores a strike on frame 1 and does an open frame on 2', () => {
    const player = 'Ryu';
    const frames = 2;

    const game = Game.initialize(player, frames);

    const firstFrame = 1;
    const firstFrameAttempt = 1;
    const firstFrameAttemptKnockedDownPinsByPlayer = 10;

    game.play(firstFrame, firstFrameAttempt, firstFrameAttemptKnockedDownPinsByPlayer);

    const secondFrame = 2;
    const secondFrameFirstAttempt = 1;
    const secondFrameFirstAttemptKnockedDownPinsByPlayer = 4;

    game.play(secondFrame, secondFrameFirstAttempt, secondFrameFirstAttemptKnockedDownPinsByPlayer);

    const secondFrameSecondAttempt = 1;
    const secondFrameSecondAttemptKnockedDownPinsByPlayer = 2;

    game.play(secondFrame, secondFrameSecondAttempt, secondFrameSecondAttemptKnockedDownPinsByPlayer);

    expect(game.frames).toBe(2);
    expect(game.currentFrame).toBe(2);
    expect(game.getScore()).toBe(22);
  });

  it('should play 1 frame where player scores a spare', () => {
    const player = 'Ryu';
    const frames = 1;

    const game = Game.initialize(player, frames);

    const firstFrame = 1;
    const firstFrameAttempt = 1;
    const firstFrameAttemptKnockedDownPinsByPlayer = 6;

    game.play(firstFrame, firstFrameAttempt, firstFrameAttemptKnockedDownPinsByPlayer);

    const firstFrameSecondAttempt = 2;
    const firstFrameSecondAttemptKnockedDownPinsByPlayer = 4;

    game.play(firstFrame, firstFrameSecondAttempt, firstFrameSecondAttemptKnockedDownPinsByPlayer);

    expect(game.frames).toBe(1);
    expect(game.currentFrame).toBe(1);
    expect(game.getScore()).toBe(10);
  });

  it('should play 2 frames where player scores a spare on frame 1 and does an open frame on 2', () => {
    const player = 'Ryu';
    const frames = 2;

    const game = Game.initialize(player, frames);

    const firstFrame = 1;
    const firstFrameAttempt = 1;
    const firstFrameAttemptKnockedDownPinsByPlayer = 6;

    game.play(firstFrame, firstFrameAttempt, firstFrameAttemptKnockedDownPinsByPlayer);

    const firstFrameSecondAttempt = 2;
    const firstFrameSecondAttemptKnockedDownPinsByPlayer = 4;

    game.play(firstFrame, firstFrameSecondAttempt, firstFrameSecondAttemptKnockedDownPinsByPlayer);

    const secondFrame = 2;
    const secondFrameFirstAttempt = 1;
    const secondFrameFirstAttemptKnockedDownPinsByPlayer = 3;

    game.play(secondFrame, secondFrameFirstAttempt, secondFrameFirstAttemptKnockedDownPinsByPlayer);

    const secondFrameSecondAttempt = 2;
    const secondFrameSecondAttemptKnockedDownPinsByPlayer = 1;

    game.play(secondFrame, secondFrameSecondAttempt, secondFrameSecondAttemptKnockedDownPinsByPlayer);

    expect(game.frames).toBe(2);
    expect(game.currentFrame).toBe(2);
    expect(game.getScore()).toBe(17);
  });

  it('should play a complete game where player scores all open frames', () => {
    const player = 'Ryu';
    const frames = 10;
    const maxAttemptsPerFrame = 2;
    const knockedDownPinsByPlayer = 4;

    const game = Game.initialize(player, frames);

    for (let frame = 1; frame <= game.frames; frame++) {
      for (let attempt = 1; attempt <= maxAttemptsPerFrame; attempt++) {
        game.play(frame, attempt, knockedDownPinsByPlayer);
      }
    }

    const gameScore = game.getScore();

    expect(game.frames).toBe(10);
    expect(gameScore).toBe(80);
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
    expect(frame.calculateScore()).toBe(firstAttemptKnockedOutPins);
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
    expect(frame.calculateScore()).toBe(firstAttemptKnockedOutPins + secondAttemptKnockedOutPins);
  });

  it('should determine strike when a player knocks down all 10 pins in 1st attempt of a frame', () => {
    const frame: Frame = Frame.create(7);
    const firstAttempt = 1;
    const firstAttemptKnockedOutPins = 10;
    frame.play(firstAttempt, firstAttemptKnockedOutPins);

    expect(frame.getAttempt()).toBe(firstAttempt);
    expect(frame.getLeftOverPins()).toBe(0);
    expect(frame.calculateScore()).toBe(firstAttemptKnockedOutPins);
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
    expect(frame.calculateScore()).toBe(firstAttemptKnockedOutPins + secondAttemptKnockedOutPins);
    expect(frame.getSpare()).toBe(true);
  });
});
