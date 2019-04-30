/* eslint-disable no-return-assign */

import $ from 'jquery';

import BufferLoader from './BufferLoader';

// @ts-ignore
// window.jQuery = $; // for jquery-ui
// require('jquery-ui-dist/jquery-ui');

const linearInterpolation = (a: number, b: number, t: number) => a + (b - a) * t;
const hannWindow = (length: number) => {
  const window = new Float32Array(length);
  [...Array(length).keys()].forEach(i => (window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)))));
  return window;
};

const audioSourcesNames = ['MP3 file', 'Microphone'];
let audioSourceIndex = 0;
const audioVisualisationNames = ['Spectrum', 'Wave', 'Sonogram'];
let audioVisualisationIndex = 0;
const validGranSizes = [256, 512, 1024, 2048, 4096, 8192];
let grainSize = validGranSizes[1];
let pitchRatio = 1.0;
let overlapRatio = 0.5;
const spectrumFFTSize = 128;
const spectrumSmoothing = 0.8;
const sonogramFFTSize = 2048;
const sonogramSmoothing = 0;

class PitchShifter {
  audioContext: AudioContext;
  audioSources: (AudioBufferSourceNode | MediaStreamAudioSourceNode)[] = [];
  pitchShifterProcessor?: ScriptProcessorNode;
  spectrumAudioAnalyser: AnalyserNode;
  sonogramAudioAnalyser: AnalyserNode;
  canvas?: HTMLCanvasElement;
  canvasContext?: CanvasRenderingContext2D;
  barGradient?: CanvasGradient;
  waveGradient?: CanvasGradient;

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

    this.sonogramAudioAnalyser = this.audioContext.createAnalyser();
    this.sonogramAudioAnalyser.fftSize = sonogramFFTSize;
    this.sonogramAudioAnalyser.smoothingTimeConstant = sonogramSmoothing;

    const bufferLoader = new BufferLoader({
      context: this.audioContext,
      urls: ['audios/think.mp3'],
    });

    bufferLoader.getBuffers().then(buffers =>
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
    this.initCanvas();

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
    this.pitchShifterProcessor.connect(this.sonogramAudioAnalyser);
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

  initCanvas = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.canvas = canvas;
    this.canvasContext = context;

    this.barGradient = this.canvasContext.createLinearGradient(0, 0, 1, canvas.height - 1);
    this.barGradient.addColorStop(0, '#550000');
    this.barGradient.addColorStop(0.995, '#AA5555');
    this.barGradient.addColorStop(1, '#555555');

    this.waveGradient = this.canvasContext.createLinearGradient(
      canvas.width - 2,
      0,
      canvas.width - 1,
      canvas.height - 1,
    );
    this.waveGradient.addColorStop(0, '#FFFFFF');
    this.waveGradient.addColorStop(0.75, '#550000');
    this.waveGradient.addColorStop(0.75, '#555555');
    this.waveGradient.addColorStop(0.76, '#AA5555');
    this.waveGradient.addColorStop(1, '#FFFFFF');
  };

  renderCanvas = () => {
    // eslint-disable-next-line default-case
    switch (audioVisualisationIndex) {
      case 0: {
        const frequencyData = new Uint8Array(this.spectrumAudioAnalyser.frequencyBinCount);
        this.spectrumAudioAnalyser.getByteFrequencyData(frequencyData);

        const { canvas, canvasContext, barGradient } = this;
        if (!canvas || !canvasContext || !barGradient) return;
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = barGradient;

        const barWidth = canvas.width / frequencyData.length;
        for (let i = 0; i < frequencyData.length; i += 1) {
          const magnitude = frequencyData[i];
          canvasContext.fillRect(barWidth * i, canvas.height, barWidth - 1, -magnitude - 1);
        }

        break;
      }

      case 1: {
        const { spectrumAudioAnalyser, canvas, canvasContext, waveGradient } = this;
        if (!canvas || !canvasContext || !waveGradient) return;
        const timeData = new Uint8Array(spectrumAudioAnalyser.frequencyBinCount);
        spectrumAudioAnalyser.getByteTimeDomainData(timeData);
        let amplitude = 0.0;
        for (let i = 0; i < timeData.length; i += 1) {
          amplitude += timeData[i];
        }
        amplitude = Math.abs(amplitude / timeData.length - 128) * 5 + 1;

        const previousImage = canvasContext.getImageData(1, 0, canvas.width - 1, canvas.height);
        canvasContext.putImageData(previousImage, 0, 0);

        const axisY = (canvas.height * 3) / 4;
        canvasContext.fillStyle = '#FFFFFF';
        canvasContext.fillRect(canvas.width - 1, 0, 1, canvas.height);
        canvasContext.fillStyle = waveGradient;
        canvasContext.fillRect(canvas.width - 1, axisY, 1, -amplitude);
        canvasContext.fillRect(canvas.width - 1, axisY, 1, amplitude / 2);

        break;
      }

      case 2: {
        const { sonogramAudioAnalyser, canvas, canvasContext, waveGradient } = this;
        if (!canvas || !canvasContext || !waveGradient) return;
        const frequencyData = new Uint8Array(sonogramAudioAnalyser.frequencyBinCount);
        sonogramAudioAnalyser.getByteFrequencyData(frequencyData);

        const previousImage = canvasContext.getImageData(1, 0, canvas.width - 1, canvas.height);
        canvasContext.putImageData(previousImage, 0, 0);

        const bandHeight = canvas.height / frequencyData.length;
        for (let i = 0, y = canvas.height - 1; i < frequencyData.length; i += 1, y -= bandHeight) {
          const color = frequencyData[i] << 16; // eslint-disable-line no-bitwise
          canvasContext.fillStyle = `#${color.toString(16)}`;
          canvasContext.fillRect(canvas.width - 1, y, 1, -bandHeight);
        }

        break;
      }
    }

    requestAnimationFrame(this.renderCanvas);
  };
}

window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-new
  new PitchShifter();
});
