/* eslint-disable no-param-reassign */

type Props = {
  analyzer: AnalyserNode;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  gradient: CanvasGradient;
};

export function writeWaveform({ analyzer, canvas, context, gradient }: Props) {
  const timeData = new Uint8Array(analyzer.frequencyBinCount);
  analyzer.getByteTimeDomainData(timeData);
  const totalTimeData = timeData.reduce((total, n) => total + n, 0);
  const amplitude = Math.abs(totalTimeData / timeData.length - 128) * 5 + 1;

  const previousImage = context.getImageData(1, 0, canvas.width - 1, canvas.height);
  context.putImageData(previousImage, 0, 0);

  const axisY = (canvas.height * 3) / 4;
  context.fillStyle = '#fff';
  context.fillRect(canvas.width - 1, 0, 1, canvas.height);
  context.fillStyle = gradient;
  context.fillRect(canvas.width - 1, axisY, 1, -amplitude);
  context.fillRect(canvas.width - 1, axisY, 1, amplitude / 2);
}
