/* eslint-disable no-return-assign */

import $ from 'jquery';

import { getBuffers } from './audio/getBuffer';
import { getCanvasInstances, writeSpectrumAnalyzer, writeWaveform, CanvasInstances } from './canvas';

const linearInterpolation = (a: number, b: number, t: number) => a + (b - a) * t;
const hannWindow = (length: number) => {
  const window = new Float32Array(length);
  [...Array(length).keys()].forEach(i => (window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)))));
  return window;
};

const audioSourcesNames = ['MP3 file', 'Microphone'];
let audioSourceIndex = 0;
const audioVisualisationNames = ['Spectrum', 'Wave'];
let audioVisualisationIndex = 0;
const validGranSizes = [256, 512, 1024, 2048, 4096, 8192];
let grainSize = validGranSizes[1];
let pitchRatio = 1.0;
let overlapRatio = 0.5;
const spectrumFFTSize = 128;
const spectrumSmoothing = 0.8;

class PitchShifter {
  audioContext: AudioContext;
  audioSources: (AudioBufferSourceNode | MediaStreamAudioSourceNode)[] = [];
  pitchShifterProcessor?: ScriptProcessorNode;
  spectrumAudioAnalyser: AnalyserNode;
  canvasInstances: CanvasInstances;

  constructor() {
    // if (!('AudioContext' in window)) {
    //   alert('Your browser does not support the Web Audio API');
    //   return;
    // }

    // if (!navigator.getUserMedia) {
    //   alert('Your browser does not support the Media Stream API');
    //   return;
    // }

    this.audioContext = new AudioContext();
    navigator.getUserMedia(
      { audio: true, video: false },
      stream => (this.audioSources[1] = this.audioContext.createMediaStreamSource(stream)),
      error => console.error(error),
    );

    this.spectrumAudioAnalyser = this.audioContext.createAnalyser();
    this.spectrumAudioAnalyser.fftSize = spectrumFFTSize;
    this.spectrumAudioAnalyser.smoothingTimeConstant = spectrumSmoothing;

    const getBuffersPromise = getBuffers(this.audioContext, ['audios/think.mp3']);
    Promise.all(getBuffersPromise).then(buffers =>
      buffers.forEach((buffer, i) => {
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = buffer;
        bufferSource.loop = true;
        if (this.pitchShifterProcessor) {
          bufferSource.connect(this.pitchShifterProcessor);
        }
        if (i === 0) {
          bufferSource.start(0);
        }
        this.audioSources[0] = bufferSource;
      }),
    );

    this.initProcessor();
    this.initSliders();
    this.canvasInstances = getCanvasInstances('canvas');

    requestAnimationFrame(this.renderCanvas);
  }

  initProcessor = () => {
    if (this.pitchShifterProcessor) {
      this.pitchShifterProcessor.disconnect();
    }

    this.pitchShifterProcessor = this.audioContext.createScriptProcessor(grainSize, 1, 1);
    const buffer = new Float32Array(grainSize * 2);
    const grainWindow = hannWindow(grainSize);

    this.pitchShifterProcessor.onaudioprocess = event => {
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

    this.pitchShifterProcessor.connect(this.spectrumAudioAnalyser);
    this.pitchShifterProcessor.connect(this.audioContext.destination);
  };

  initSliders = () => {
    $('#pitchRatioSlider').slider({
      orientation: 'horizontal',
      min: 0.5,
      max: 2,
      step: 0.01,
      range: 'min',
      value: pitchRatio,
      slide(_, ui) {
        if (typeof ui.value !== 'number') return;
        pitchRatio = ui.value;
        $('#pitchRatioDisplay').text(pitchRatio);
      },
    });

    $('#overlapRatioSlider').slider({
      orientation: 'horizontal',
      min: 0,
      max: 0.75,
      step: 0.01,
      range: 'min',
      value: overlapRatio,
      slide(_, ui) {
        if (typeof ui.value !== 'number') return;
        overlapRatio = ui.value;
        $('#overlapRatioDisplay').text(overlapRatio);
      },
    });

    $('#grainSizeSlider').slider({
      orientation: 'horizontal',
      min: 0,
      max: validGranSizes.length - 1,
      step: 1,
      range: 'min',
      value: validGranSizes.indexOf(grainSize),
      slide: (_, ui) => {
        if (typeof ui.value !== 'number') return;
        grainSize = validGranSizes[ui.value];
        $('#grainSizeDisplay').text(grainSize);

        this.initProcessor();

        if (this.audioSources[audioSourceIndex] && this.pitchShifterProcessor) {
          this.audioSources[audioSourceIndex].connect(this.pitchShifterProcessor);
        }
      },
    });

    $('#audioVisualisationSlider').slider({
      orientation: 'horizontal',
      min: 0,
      max: audioVisualisationNames.length - 1,
      step: 1,
      value: audioVisualisationIndex,
      slide(_, ui) {
        if (typeof ui.value !== 'number') return;
        audioVisualisationIndex = ui.value;
        $('#audioVisualisationDisplay').text(audioVisualisationNames[audioVisualisationIndex]);
      },
    });

    $('#audioSourceSlider').slider({
      orientation: 'horizontal',
      min: 0,
      max: audioSourcesNames.length - 1,
      step: 1,
      value: audioSourceIndex,
      slide: (_, ui) => {
        if (typeof ui.value !== 'number') return;
        if (this.audioSources[audioSourceIndex]) {
          this.audioSources[audioSourceIndex].disconnect();
        }

        audioSourceIndex = ui.value;
        $('#audioSourceDisplay').text(audioSourcesNames[audioSourceIndex]);

        if (this.audioSources[audioSourceIndex] && this.pitchShifterProcessor) {
          this.audioSources[audioSourceIndex].connect(this.pitchShifterProcessor);
        }
      },
    });

    $('#pitchRatioDisplay').text(pitchRatio);
    $('#overlapRatioDisplay').text(overlapRatio);
    $('#grainSizeDisplay').text(grainSize);
    $('#audioVisualisationDisplay').text(audioVisualisationNames[audioVisualisationIndex]);
    $('#audioSourceDisplay').text(audioSourcesNames[audioSourceIndex]);
  };

  renderCanvas = () => {
    const { spectrumAudioAnalyser: analyzer } = this;
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
  // eslint-disable-next-line no-new
  new PitchShifter();
});
