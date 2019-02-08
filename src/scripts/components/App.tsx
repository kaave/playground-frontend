import * as React from 'react';

import { Article } from './Article';
import { CounterContext } from '../contexts/counter';
const { Provider } = CounterContext;

interface Props {
  message: string;
}

export const App: React.FC<Props> = props => {
  const [count, setCount] = React.useState(10);
  const effect = () => {
    const intervalID = setInterval(() => setCount(n => n + 1), 1000);
    return () => clearInterval(intervalID);
  };

  React.useEffect(effect, []);

  const onClick = ({ currentTarget: { value } }: React.MouseEvent<HTMLButtonElement>) => {
    const v = parseInt(value, 10);
    if (!Number.isNaN(v)) {
      setCount(n => n + v);
    }
  };

  return (
    <main id="main" className="Main" role="main">
      <Provider value={onClick}>
        <Article count={count} />
      </Provider>
      message: {props.message}
    </main>
  );
};
