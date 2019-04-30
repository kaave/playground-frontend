/* eslint-disable no-return-assign */

import { getBuffers } from './audio/getBuffer';
import { getCanvasInstances, writeSpectrumAnalyzer, writeWaveform, CanvasInstances } from './canvas';
import { initUI } from './ui';

const linearInterpolation = (a: number, b: number, t: number) => a + (b - a) * t;
const hannWindow = (length: number) => {
  const window = new Float32Array(length);
  [...Array(length).keys()].forEach(i => (window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)))));
  return window;
};

const samples = [
  'audios/think.mp3',
  'audios/amen.mp3',
  'audios/apache.mp3',
  'audios/soulpride.mp3',
  'audios/tizianocrudeli.mp3',
];
const audioSourcesNames = [...samples, 'Microphone'];
let audioSourceIndex = 0;
const audioVisualisationNames = ['Spectrum', 'Wave'];
let audioVisualisationIndex = 0;
const validGranSizes = [256, 512, 1024, 2048, 4096, 8192];
let grainSize = validGranSizes[1];
let pitchRatio = 1.0;
let overlapRatio = 0.5;

class PitchShifter {
  audioContext: AudioContext;
  audioSources: (AudioBufferSourceNode | MediaStreamAudioSourceNode)[] = [];
  processor?: ScriptProcessorNode;
  spectrumAnalyser: AnalyserNode;
  canvasInstances: CanvasInstances;

  constructor() {
    this.audioContext = new AudioContext();
    navigator.getUserMedia(
      { audio: true, video: false },
      stream => (this.audioSources[audioSourcesNames.length - 1] = this.audioContext.createMediaStreamSource(stream)),
      error => console.error(error),
    );

    this.spectrumAnalyser = this.audioContext.createAnalyser();
    this.spectrumAnalyser.fftSize = 128;
    this.spectrumAnalyser.smoothingTimeConstant = 0.8;

    const getBuffersPromise = getBuffers(this.audioContext, samples);
    Promise.all(getBuffersPromise).then(buffers =>
      buffers.forEach((buffer, i) => {
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = buffer;
        bufferSource.loop = true;
        if (this.processor) {
          bufferSource.connect(this.processor);
        }
        bufferSource.start(0);
        if (i !== 0) {
          bufferSource.disconnect();
          // } else {
          //   setInterval(() => {
          //     const rate = new Date().getSeconds() / 10;
          //     bufferSource.playbackRate.value = rate;
          //     console.log(
          //       bufferSource.playbackRate.value,
          //       bufferSource.playbackRate.minValue,
          //       bufferSource.playbackRate.maxValue,
          //     );
          //   }, 1000);
        }
        this.audioSources[i] = bufferSource;
      }),
    );

    this.initProcessor();
    initUI(
      { pitchRatio, overlapRatio, grainSize: 1, audioVisualisationIndex: 0, audioSourceIndex: 0 },
      {
        grainSize: validGranSizes,
        visualisation: audioVisualisationNames,
        source: audioSourcesNames,
      },
      {
        pitchRatio: value => (pitchRatio = value),
        overlapRatio: value => (overlapRatio = value),
        grainSize: value => {
          grainSize = validGranSizes[value];
          this.initProcessor();

          if (this.audioSources[audioSourceIndex] && this.processor) {
            this.audioSources[audioSourceIndex].connect(this.processor);
          }
        },
        audioVisualisationIndex: value => (audioVisualisationIndex = value),
        audioSourceIndex: value => {
          if (this.audioSources[audioSourceIndex]) {
            this.audioSources[audioSourceIndex].disconnect();
          }

          audioSourceIndex = value;

          if (this.audioSources[audioSourceIndex] && this.processor) {
            this.audioSources[audioSourceIndex].connect(this.processor);
          }
        },
      },
    );
    this.canvasInstances = getCanvasInstances('canvas');

    requestAnimationFrame(this.renderCanvas);
  }

  getOnAudioProcess = () => {
    const buffer = new Float32Array(grainSize * 2);
    const grainWindow = hannWindow(grainSize);

    return (event: AudioProcessingEvent) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const outputData = event.outputBuffer.getChannelData(0);

      for (let i = 0; i < inputData.length; i += 1) {
        // Apply the window to the input buffer
        inputData[i] *= grainWindow[i];

        // Shift half of the buffer
        buffer[i] = buffer[i + grainSize];

        // Empty the buffer tail
        buffer[i + grainSize] = 0.0;
      }

      // Calculate the pitch shifted grain re-sampling and looping the input
      const grainData = new Float32Array(grainSize * 2);
      for (let i = 0, j = 0.0; i < grainSize; i += 1, j += pitchRatio) {
        const index = Math.floor(j) % grainSize;
        const a = inputData[index];
        const b = inputData[(index + 1) % grainSize];
        grainData[i] += linearInterpolation(a, b, j % 1.0) * grainWindow[i];
      }

      // Copy the grain multiple times overlapping it
      for (let i = 0; i < grainSize; i += Math.round(grainSize * (1 - overlapRatio))) {
        for (let j = 0; j <= grainSize; j += 1) {
          buffer[i + j] += grainData[j];
        }
      }

      // Output the first half of the buffer
      for (let i = 0; i < grainSize; i += 1) {
        outputData[i] = buffer[i];
      }
    };
  };

  setOutput = (processor: ScriptProcessorNode) => {
    processor.connect(this.spectrumAnalyser);
    processor.connect(this.audioContext.destination);
  };

  initProcessor = () => {
    if (this.processor) {
      this.processor.disconnect();
    }

    this.processor = this.audioContext.createScriptProcessor(grainSize, 1, 1);
    this.processor.onaudioprocess = this.getOnAudioProcess();
    this.setOutput(this.processor);
  };

  renderCanvas = () => {
    const { spectrumAnalyser: analyzer } = this;
    const { canvas, context, barGradient, waveGradient } = this.canvasInstances;
    if (!canvas || !context || !barGradient || !waveGradient) return;

    if (audioVisualisationIndex === 0) {
      writeSpectrumAnalyzer({ analyzer, canvas, context, gradient: barGradient });
    } else {
      writeWaveform({ analyzer, canvas, context, gradient: waveGradient });
    }

    requestAnimationFrame(this.renderCanvas);
  };
}

window.addEventListener('DOMContentLoaded', () => {
  if (!('AudioContext' in window)) {
    alert('Your browser does not support the Web Audio API');
    return;
  }

  if (!navigator.getUserMedia) {
    alert('Your browser does not support the Media Stream API');
    return;
  }

  // eslint-disable-next-line no-new
  new PitchShifter();
});
