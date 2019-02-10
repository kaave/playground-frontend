import * as React from 'react';

import { Article } from './Article';
import { Count } from './Count';
import { CounterContext, reducer, initialState } from '../contexts/counter';

const { Provider } = CounterContext;

interface Props {
  message: string;
}

export const App: React.FC<Props> = props => {
  const [{ count, clickCount }, dispatch] = React.useReducer(reducer, initialState);
  const effect = () => {
    const intervalID = setInterval(() => dispatch({ type: 'increment' }), 1000);
    return () => clearInterval(intervalID);
  };

  React.useEffect(effect, []);

  return (
    <main id="main" className="Main" role="main">
      <Provider value={dispatch}>
        <Article count={count} clickCount={clickCount} />
      </Provider>
      <p>message: {props.message}</p>
      <section>
        <Count count={count % 10} />
      </section>
    </main>
  );
};
