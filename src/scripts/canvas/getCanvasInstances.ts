export type CanvasInstances = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  barGradient: CanvasGradient;
  waveGradient: CanvasGradient;
};

export function getCanvasInstances(selector: string): CanvasInstances {
  const canvas = document.querySelector<HTMLCanvasElement>(selector);
  if (!canvas) throw new Error(`Invalid DOM: not found ${selector}`);

  const context = canvas.getContext('2d');
  if (!context) throw new Error(`Invalid browser: can't get canvas context`);

  const barGradient = context.createLinearGradient(0, 0, 1, canvas.height - 1);
  barGradient.addColorStop(0, '#f00');
  barGradient.addColorStop(0.995, '#0f0');
  barGradient.addColorStop(1, '#00f');

  const waveGradient = context.createLinearGradient(canvas.width - 2, 0, canvas.width - 1, canvas.height - 1);
  waveGradient.addColorStop(0, '#FFFFFF');
  waveGradient.addColorStop(0.75, '#550000');
  waveGradient.addColorStop(0.75, '#555555');
  waveGradient.addColorStop(0.76, '#AA5555');
  waveGradient.addColorStop(1, '#FFFFFF');

  return { canvas, context, barGradient, waveGradient };
}
