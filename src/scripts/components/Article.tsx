import * as React from 'react';

import { CounterContext } from '../contexts/counter';

interface Props {
  count: number;
}

export const Article: React.FC<Props> = ({ count }) => {
  // Context.Consumerがいらんくなった
  const handler = React.useContext(CounterContext);

  return (
    <div>
      count: {count}
      <button onClick={handler} value="1">
        increment
      </button>
      <button onClick={handler} value="-1">
        decrement
      </button>
    </div>
  );
};
