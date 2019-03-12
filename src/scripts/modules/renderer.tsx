import * as React from 'react';
import { render } from 'react-dom';

import { App } from '../containers/App';

export function renderer() {
  render(<App />, document.getElementById('mount-point'));
}
