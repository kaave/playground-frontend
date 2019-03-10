import './common/initializer';

import * as React from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import format from 'date-fns/format';

import { App } from './components/App';

class Main {
  onDOMContentLoaded = () => {
    console.log(`DOMContentLoaded${format(new Date())}`);

    const mountPoint = document.getElementById('mount-point');
    if (mountPoint) {
      const Root = process.env.NODE_ENV === 'development' ? hot(App) : App;
      render(<Root message="Hello" />, mountPoint);
    }
  };
}

const main = new Main();
window.addEventListener('DOMContentLoaded', main.onDOMContentLoaded);
