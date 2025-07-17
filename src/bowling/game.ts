import { Frame } from './frame';

export class Game {
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
