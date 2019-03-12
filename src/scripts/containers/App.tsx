import * as React from 'react';
import { hot } from 'react-hot-loader/root';

import { Message } from '../components/Message';

const Root: React.FC<{}> = () => (
  <main id="main" className="Main" role="main">
    <Message message="Hello, React" />
  </main>
);

export const App = process.env.NODE_ENV === 'development' ? hot(Root) : Root;
