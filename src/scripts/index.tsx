import './common/initializer';

import * as React from 'react';
import { render } from 'react-dom';
import format from 'date-fns/format';

import { App } from './components/App';

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

    const mountPoint = document.getElementById('mount-point');
    if (mountPoint) {
      render(<App message="Hello" />, mountPoint);
    }
  };
}

const main = new Main();
window.addEventListener('DOMContentLoaded', main.onDOMContentLoaded);
