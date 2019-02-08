import * as React from 'react';

import { Button } from './Button';

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

  const onClick = () => setCount(n => n + 1);

  return (
    <main id="main" className="Main" role="main">
      count: {count}, message: {props.message}
      <Button onClick={onClick}>increment</Button>
    </main>
  );
};
