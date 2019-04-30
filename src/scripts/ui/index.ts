/* eslint-disable no-return-assign */

import $ from 'jquery';

type UIType = 'pitchRatio' | 'overlapRatio' | 'grainSize' | 'audioVisualisationIndex' | 'audioSourceIndex';

type InitialValues = { [key in UIType]: number };
type ValidValues = {
  grainSize: number[];
  visualisation: string[];
  source: string[];
};
type Callbacks = { [key in UIType]?: (value: number) => void };

export function initUI(initialValues: InitialValues, validValues: ValidValues, callbacks: Callbacks) {
  const $pitchRatioDisplay = $('#pitchRatioDisplay');
  const $overlapRatioDisplay = $('#overlapRatioDisplay');
  const $grainSizeDisplay = $('#grainSizeDisplay');
  const $audioVisualisationDisplay = $('#audioVisualisationDisplay');
  const $audioSourceDisplay = $('#audioSourceDisplay');

  const { pitchRatio, overlapRatio, grainSize, audioVisualisationIndex, audioSourceIndex } = initialValues;

  $('#pitchRatioSlider').slider({
    orientation: 'horizontal',
    min: 0.5,
    max: 2,
    step: 0.01,
    range: 'min',
    value: pitchRatio,
    slide(_, ui) {
      if (typeof ui.value !== 'number') return;
      $pitchRatioDisplay.text(ui.value);
      if (callbacks.pitchRatio) {
        callbacks.pitchRatio(ui.value);
      }
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
      $overlapRatioDisplay.text(ui.value);
      if (callbacks.overlapRatio) {
        callbacks.overlapRatio(ui.value);
      }
    },
  });

  $('#grainSizeSlider').slider({
    orientation: 'horizontal',
    min: 0,
    max: validValues.grainSize.length - 1,
    step: 1,
    range: 'min',
    value: grainSize,
    slide: (_, ui) => {
      if (typeof ui.value !== 'number') return;
      $grainSizeDisplay.text(validValues.grainSize[ui.value]);
      if (callbacks.grainSize) {
        callbacks.grainSize(ui.value);
      }
    },
  });

  $('#audioVisualisationSlider').slider({
    orientation: 'horizontal',
    min: 0,
    max: validValues.visualisation.length - 1,
    step: 1,
    value: audioVisualisationIndex,
    slide(_, ui) {
      if (typeof ui.value !== 'number') return;
      $audioVisualisationDisplay.text(validValues.visualisation[ui.value]);
      if (callbacks.audioVisualisationIndex) {
        callbacks.audioVisualisationIndex(ui.value);
      }
    },
  });

  $('#audioSourceSlider').slider({
    orientation: 'horizontal',
    min: 0,
    max: validValues.source.length - 1,
    step: 1,
    value: audioSourceIndex,
    slide: (_, ui) => {
      if (typeof ui.value !== 'number') return;
      $audioSourceDisplay.text(validValues.source[ui.value]);
      if (callbacks.audioSourceIndex) {
        callbacks.audioSourceIndex(ui.value);
      }
    },
  });

  $pitchRatioDisplay.text(pitchRatio);
  $overlapRatioDisplay.text(overlapRatio);
  $grainSizeDisplay.text(grainSize);
  $audioVisualisationDisplay.text(validValues.visualisation[audioVisualisationIndex]);
  $audioSourceDisplay.text(validValues.source[audioSourceIndex]);
}
