import { expect } from '@jest/globals';

class Game {
  readonly frames: number = 10;
  playedFrames: Frame[] = [];

  static start(): Game {
    return new Game();
  }

  constructor() {}

  play(frame: number, frameAttempt: number, pins: number): void {
    const currentFrame: Frame = this.getCurrentFrame(frame);
    currentFrame.play(frameAttempt, pins);
  }

  score(): number {
    let score = 0;
    this.playedFrames.forEach((playedFrame) => {
      if (playedFrame.isStrike()) {
        score = this.calculateStrikeFrameScore(playedFrame, score);
      }
      if (playedFrame.isSpare()) {
        score = this.calculateSpareFrameScore(playedFrame, score);
      }
      score += playedFrame.calculateScore();
    });
    return score;
  }

  private calculateSpareFrameScore(playedFrame: Frame, score: number) {
    const nextFrame: Frame = this.fetchNextFrame(playedFrame);
    if (nextFrame) {
      score += nextFrame.getFirstAttemptScore();
    }
    return score;
  }

  private calculateStrikeFrameScore(playedFrame: Frame, score: number) {
    const nextFrame: Frame = this.fetchNextFrame(playedFrame);
    if (nextFrame) {
      if (!nextFrame.isStrike()) {
        score += nextFrame.calculateScore();
      }
      if (nextFrame.isStrike()) {
        const frameAfterNextFrame: Frame = this.fetchFrameAfterNextFrame(playedFrame);
        score += nextFrame.calculateScore();
        score += frameAfterNextFrame.calculateScore();
      }
    }
    return score;
  }

  private fetchFrameAfterNextFrame(playedFrame: Frame): Frame {
    const NEXT_FRAME_NUMBER = 2;
    return this.playedFrames.find((nextFrame: Frame) => playedFrame.number + NEXT_FRAME_NUMBER === nextFrame.number);
  }

  private fetchNextFrame(playedFrame: Frame): Frame {
    const NEXT_FRAME_NUMBER = 1;
    const nextFrame: Frame = this.playedFrames.find(
      (nextFrame: Frame) => playedFrame.number + NEXT_FRAME_NUMBER === nextFrame.number
    );
    return nextFrame;
  }

  private getCurrentFrame(frame: number): Frame {
    const currentFrame: Frame = this.playedFrames.find((playedFrame: Frame) => playedFrame.number === frame);

    if (!currentFrame) {
      const newFrame: Frame = Frame.create(frame);
      this.playedFrames.push(newFrame);
      return newFrame;
    }
    return currentFrame;
  }
}

class Frame {
  readonly number: number;
  maxAttempts: number = 2;
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
      if (this.isSpare() && this.isLastFrame() && this.isSecondAttempt()) {
        const extraAttemptOnLastFrame = 1;
        this.maxAttempts += extraAttemptOnLastFrame;
      }
    }
  }

  private addScore(pins: number) {
    const firstAttempt = 1;
    const secondAttempt = 2;
    const thirdAttempt = 3;
    if (this.currentAttempt === firstAttempt) {
      this.firstAttemptScore = this.firstAttemptScore + pins;
    }
    if (this.currentAttempt === secondAttempt) {
      this.secondAttemptScore = this.secondAttemptScore + pins;
    }
    if (this.currentAttempt === thirdAttempt) {
      this.score = this.score + pins;
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

  isLastFrame(): boolean {
    const lastFrame = 10;
    return this.number === lastFrame;
  }

  isSecondAttempt(): boolean {
    const secondAttempt = 2;
    return this.currentAttempt === secondAttempt;
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
}

describe('game module', () => {
  it('should initialize a new game', () => {
    const game = Game.start();

    expect(game.score()).toBe(0);
    expect(game.frames).toBe(10);
  });

  it('should play 1 frame when game plays', () => {
    const game = Game.start();

    const currentFrame = 1;
    const currentFrameAttempt = 1;
    const knockedDownPinsByPlayer = 5;

    game.play(currentFrame, currentFrameAttempt, knockedDownPinsByPlayer);

    const aSingleFramePlayed = 1;
    const gamePlayedFrames = game.playedFrames.length;

    expect(gamePlayedFrames).toBe(aSingleFramePlayed);
  });

  it('should play 1 frame where player scores a strike', () => {
    const game = Game.start();

    const currentFrame = 1;
    const currentFrameAttempt = 1;
    const knockedDownPinsByPlayer = 10;

    game.play(currentFrame, currentFrameAttempt, knockedDownPinsByPlayer);

    const aSingleFramePlayed = 1;
    const gamePlayedFrames = game.playedFrames.length;

    expect(gamePlayedFrames).toBe(aSingleFramePlayed);
    expect(game.score()).toBe(10);
  });

  it('should play 2 frames where player scores a strike on frame 1 and does an open frame on 2', () => {
    const game = Game.start();

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

    const aCoupleFramesPlayed = 2;
    const gamePlayedFrames = game.playedFrames.length;

    expect(gamePlayedFrames).toBe(aCoupleFramesPlayed);
    expect(game.score()).toBe(22);
  });

  it('should play 1 frame where player scores a spare', () => {
    const game = Game.start();

    const firstFrame = 1;
    const firstFrameAttempt = 1;
    const firstFrameAttemptKnockedDownPinsByPlayer = 6;

    game.play(firstFrame, firstFrameAttempt, firstFrameAttemptKnockedDownPinsByPlayer);

    const firstFrameSecondAttempt = 2;
    const firstFrameSecondAttemptKnockedDownPinsByPlayer = 4;

    game.play(firstFrame, firstFrameSecondAttempt, firstFrameSecondAttemptKnockedDownPinsByPlayer);

    const aSingleFramePlayed = 1;
    const gamePlayedFrames = game.playedFrames.length;

    expect(gamePlayedFrames).toBe(aSingleFramePlayed);
    expect(game.score()).toBe(10);
  });

  it('should play 2 frames where player scores a spare on frame 1 and does an open frame on 2', () => {
    const game = Game.start();

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

    const aCoupleFramesPlayed = 2;
    const gamePlayedFrames = game.playedFrames.length;

    expect(gamePlayedFrames).toBe(aCoupleFramesPlayed);
    expect(game.score()).toBe(17);
  });

  it('should play a complete game where player scores all open frames', () => {
    const maxAttemptsPerFrame = 2;
    const knockedDownPinsByPlayer = 4;

    const game = Game.start();

    for (let frame = 1; frame <= game.frames; frame++) {
      for (let attempt = 1; attempt <= maxAttemptsPerFrame; attempt++) {
        game.play(frame, attempt, knockedDownPinsByPlayer);
      }
    }

    const gameScore = game.score();

    expect(game.frames).toBe(10);
    expect(gameScore).toBe(80);
  });

  it('should play a complete game where player scores all spares', () => {
    const maxAttemptsPerFrame = 2;
    const firstAttempt = 1;
    const secondAttempt = 2;
    const thirdAttempt = 3;

    const firstFrameFirstAttemptKnockedDownPinsByPlayer = 4;
    const secondFrameSecondAttemptKnockedDownPinsByPlayer = 6;

    const lastFrame = 10;

    const game = Game.start();

    for (let frame = 1; frame < game.frames; frame++) {
      for (let attempt = 1; attempt <= maxAttemptsPerFrame; attempt++) {
        if (attempt === firstAttempt) {
          game.play(frame, attempt, firstFrameFirstAttemptKnockedDownPinsByPlayer);
        }
        if (attempt === secondAttempt) {
          game.play(frame, attempt, secondFrameSecondAttemptKnockedDownPinsByPlayer);
        }
      }
    }

    game.play(lastFrame, firstAttempt, firstFrameFirstAttemptKnockedDownPinsByPlayer);
    game.play(lastFrame, secondAttempt, secondFrameSecondAttemptKnockedDownPinsByPlayer);
    game.play(lastFrame, thirdAttempt, firstFrameFirstAttemptKnockedDownPinsByPlayer);

    expect(game.frames).toBe(10);
    expect(game.score()).toBe(140);
  });

  it('should play a complete game where player scores all strikes', () => {
    const maxAttemptsPerFrame = 1;
    const firstAttempt = 1;
    const secondAttempt = 2;
    const thirdAttempt = 3;

    const firstFrameFirstAttemptKnockedDownPinsByPlayer = 10;
    const secondFrameFirstAttemptKnockedDownPinsByPlayer = 10;
    const thirdFrameFirstAttemptKnockedDownPinsByPlayer = 10;

    const lastFrame = 10;

    const game = Game.start();

    for (let frame = 1; frame < game.frames; frame++) {
      for (let attempt = 1; attempt <= maxAttemptsPerFrame; attempt++) {
        game.play(frame, attempt, firstFrameFirstAttemptKnockedDownPinsByPlayer);
      }
    }

    game.play(lastFrame, firstAttempt, firstFrameFirstAttemptKnockedDownPinsByPlayer);
    game.play(lastFrame, secondAttempt, secondFrameFirstAttemptKnockedDownPinsByPlayer);
    game.play(lastFrame, thirdAttempt, thirdFrameFirstAttemptKnockedDownPinsByPlayer);

    expect(game.frames).toBe(10);
    expect(game.score()).toBe(300);
  });

  it('should play a complete game where player scores 1 strike on frame 6 and the rest are open frame', () => {
    const maxAttemptsPerFrame = 2;

    const firstFrameFirstAttemptKnockedDownPinsByPlayer = 2;

    const sixthFrame = 6;
    const sixthFrameFirstAttemptKnockedDownPinsByPlayer = 10;

    const game = Game.start();

    for (let frame = 1; frame <= game.frames; frame++) {
      for (let attempt = 1; attempt <= maxAttemptsPerFrame; attempt++) {
        if (frame === sixthFrame && attempt === 1) {
          game.play(frame, attempt, sixthFrameFirstAttemptKnockedDownPinsByPlayer);
          continue;
        }
        if (frame !== sixthFrame) {
          game.play(frame, attempt, firstFrameFirstAttemptKnockedDownPinsByPlayer);
        }
      }
    }

    expect(game.frames).toBe(10);
    expect(game.score()).toBe(50);
  });

  it('should play a complete game where player misses on ALL frames, scoring 0', () => {
    const maxAttemptsPerFrame = 2;
    const knockedDownPinsByPlayer = 0;

    const game = Game.start();

    for (let frame = 1; frame <= game.frames; frame++) {
      for (let attempt = 1; attempt <= maxAttemptsPerFrame; attempt++) {
        game.play(frame, attempt, knockedDownPinsByPlayer);
      }
    }

    const gameScore = game.score();

    expect(game.frames).toBe(10);
    expect(gameScore).toBe(0);
  });

  it('should play a complete game where player score 1 on all frame attempts', () => {
    const maxAttemptsPerFrame = 2;

    const firstAttempt = 1;
    const firstAttemptknockedDownPinsByPlayer = 1;

    const secondAttempt = 2;
    const secondAttemptknockedDownPinsByPlayer = 1;

    const game = Game.start();

    for (let frame = 1; frame <= game.frames; frame++) {
      for (let attempt = 1; attempt <= maxAttemptsPerFrame; attempt++) {
        if (attempt === firstAttempt) {
          game.play(frame, attempt, firstAttemptknockedDownPinsByPlayer);
        }

        if (attempt === secondAttempt) {
          game.play(frame, attempt, secondAttemptknockedDownPinsByPlayer);
        }
      }
    }

    const gameScore = game.score();

    expect(game.frames).toBe(10);
    expect(gameScore).toBe(20);
  });

  it('should play a complete game where player does 1 spare, 1 open frame (50) and misses 17 attempts', () => {
    const maxAttemptsPerFrame = 2;

    const spareFrame = 4;
    const firstSpareFrameAttempt = 1;
    const firstSpareFrameSecondAttemptKnockedDownPinsByPlayer = 5;
    const secondSpareFrameAttempt = 2;
    const secondSpareFrameAttemptKnockedDownPinsByPlayer = 5;

    const frameAfterSpare = 5;
    const firstFrameAfterSpareAttempt = 1;
    const firstFrameAfterSpareAttemptKnockedDownPinsByPlayer = 5;
    const secondFrameAfterSpareAttempt = 2;
    const secondFrameAfterSpareAttemptKnockedDownPinsByPlayer = 0;

    const knockedDownPinsByPlayerOnMissedAttempt = 0;

    const game = Game.start();

    for (let frame = 1; frame <= game.frames; frame++) {
      for (let attempt = 1; attempt <= maxAttemptsPerFrame; attempt++) {
        if (frame === spareFrame && attempt === firstSpareFrameAttempt) {
          game.play(frame, attempt, firstSpareFrameSecondAttemptKnockedDownPinsByPlayer);
          continue;
        }

        if (frame === spareFrame && attempt === secondSpareFrameAttempt) {
          game.play(frame, attempt, secondSpareFrameAttemptKnockedDownPinsByPlayer);
          continue;
        }

        if (frame === frameAfterSpare && attempt === firstFrameAfterSpareAttempt) {
          game.play(frame, attempt, firstFrameAfterSpareAttemptKnockedDownPinsByPlayer);
          continue;
        }

        if (frame === frameAfterSpare && attempt === secondFrameAfterSpareAttempt) {
          game.play(frame, attempt, secondFrameAfterSpareAttemptKnockedDownPinsByPlayer);
          continue;
        }

        game.play(frame, attempt, knockedDownPinsByPlayerOnMissedAttempt);
      }
    }

    const gameScore = game.score();

    expect(game.frames).toBe(10);
    expect(gameScore).toBe(20);
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
    expect(frame.isStrike()).toBe(true);
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
    expect(frame.isSpare()).toBe(true);
  });
});
