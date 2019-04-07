import './common/initializer';

const getMouseWheelEvent = () => {
  if ('onwheel' in document) {
    return 'wheel';
  }

  if ('onmousewheel' in document) {
    return 'mousewheel';
  }

  return 'DOMMouseScroll';
};

window.addEventListener('DOMContentLoaded', () => {
  const returnMax = Math.max;
  const mousewheelevent = getMouseWheelEvent();
  const parentElement = document.querySelector<HTMLElement>('.inner');
  const cElement = document.querySelector<HTMLElement>('.color.-c');
  const mElement = document.querySelector<HTMLElement>('.color.-m');
  const yElement = document.querySelector<HTMLElement>('.color.-y');
  const kElement = document.querySelector<HTMLElement>('.source');
  if (!parentElement || !cElement || !mElement || !yElement || !kElement) return;

  let targetH = parentElement.getBoundingClientRect().height;
  let scrollAmount = 0;
  let lastScrollAmount = -1;

  parentElement.addEventListener(mousewheelevent, e => {
    if (!(e instanceof WheelEvent)) return;

    e.preventDefault();
    targetH = parentElement.getBoundingClientRect().height;
    scrollAmount += e.deltaY * -1;
    scrollAmount = Math.max(-1 * (targetH - window.innerHeight), scrollAmount);
    scrollAmount = Math.min(0, scrollAmount);
  });

  const ys = [0, 0, 0, 0];

  const scrollContent = () => {
    for (let i = 0, l = ys.length; i < l; i += 1) {
      const random = i === l ? 0 : Math.random() * 5;
      ys[i] += (scrollAmount - ys[i]) * 0.1 + random;
      if (ys[i] > -0.1) {
        ys[i] = 0;
      }
    }

    cElement.style.transform = `translate3d(0, ${ys[0]}px, 0)`;
    mElement.style.transform = `translate3d(0, ${ys[1]}px, 0)`;
    yElement.style.transform = `translate3d(0, ${ys[2]}px, 0)`;
    kElement.style.transform = `translate3d(0, ${ys[3]}px, 0)`;

    lastScrollAmount = scrollAmount;
    requestAnimationFrame(scrollContent);
  };
  scrollContent();
});
