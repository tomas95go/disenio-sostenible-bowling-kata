export class Frame {
  readonly number: number;
  maxAttempts: number = 2;
  private leftOverPins: number = 10;
  private currentAttempt: number;
  private score: number = 0;
  private firstAttemptScore: number = 0;
  private secondAttemptScore: number = 0;

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
