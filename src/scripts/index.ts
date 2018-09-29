import './common/initializer';

import format from 'date-fns/format';

function wait(msec: number) {
  if (msec < 1) {
    throw new Error('msec must longer than 1msec.');
  }

  return new Promise(resolve => setTimeout(resolve, msec));
}

class Main {
  onDOMContentLoaded = async () => {
    await wait(1000);
    console.log(`DOMContentLoaded${format(new Date())}`);
  };
}

const main = new Main();
window.addEventListener('DOMContentLoaded', main.onDOMContentLoaded);
