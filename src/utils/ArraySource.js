/**
 * A buffer full of slowed-down white noise.
 */
import { Operator } from '../core/Operator.js';

export class ArraySource extends Operator {
  constructor(ctx, array, options) {
    super(ctx, options);
    this.sampleRate = ctx.sampleRate;

    this._array = array;

    this._buffer = new AudioBuffer({
      numberOfChannels: 1,
      length: ctx.sampleRate,
      sampleRate: ctx.sampleRate
    });

    const samplesPerStep = Math.floor(this._buffer.length / this._array.length);

    for (let c = 0; c < this._buffer.numberOfChannels; c++) {
      const channelBuffer = this._buffer.getChannelData(c);
      for (let v = 0; v < thsi._array.length; v++) {
        let val = this._array[v];
        for (let i = 0; i < samplesPerStep; i++) {
          channelBuffer[v * samplesPerStep + i] = val;
        }
      }
    }

    /**
     * The audio buffer.
     */
    this._source = new AudioBufferSourceNode(ctx, {
      loop: true,
      buffer: this._buffer,
    });

    /** 
     * The gain.
     */
    this._gain = new GainNode(ctx);
    this._scaler = this._gain;

    // Connect and start.
    this._source.connect(this._gain);
    this._source.start(ctx.currentTime);
  }

  get outlet() { return this._gain; }

  clock(interval) {
    this.baseSpeed = this._buffer.length;
  }

  restart(time = 0) {
    this._source.stop();
    this._source.disconnect();
    this._source = new AudioBufferSourceNode(this.ctx, {
      loop: true,
      buffer: this._buffer,
    });
    this._source.start(time);
    this._source.connect(this._gain);
  }

  get gain() { return this._gain.gain; }
  get speed() { return this._source.playbackRate; }
}