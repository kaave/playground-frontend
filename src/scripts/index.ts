import './common/initializer';

import format from 'date-fns/format';

import { renderer } from './modules/renderer';

function wait(msec: number) {
  if (msec < 1) {
    throw new Error('msec must longer than 1msec.');
  }

  return new Promise(resolve => setTimeout(resolve, msec));
}

window.addEventListener('DOMContentLoaded', async () => {
  await wait(1000);
  console.log(`DOMContentLoaded${format(new Date())}`);

  renderer();
});
