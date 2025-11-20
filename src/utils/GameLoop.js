export class GameLoop {
  constructor(updateCallback, speed) {
    this.updateCallback = updateCallback;
    this.speed = speed;
    this.intervalId = null;
    this.isRunning = false;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => {
        this.updateCallback();
      }, this.speed);
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  isActive() {
    return this.isRunning;
  }
}