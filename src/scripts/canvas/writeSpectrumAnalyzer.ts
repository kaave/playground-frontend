/* eslint-disable no-param-reassign */

type Props = {
  analyzer: AnalyserNode;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  gradient: CanvasGradient;
};

export function writeSpectrumAnalyzer({ analyzer, canvas, context, gradient }: Props) {
  const frequencyData = new Uint8Array(analyzer.frequencyBinCount);
  analyzer.getByteFrequencyData(frequencyData);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = gradient;

  const barWidth = canvas.width / frequencyData.length;
  frequencyData.forEach((magnitude, i) => context.fillRect(barWidth * i, canvas.height, barWidth - 1, -magnitude - 1));
}
