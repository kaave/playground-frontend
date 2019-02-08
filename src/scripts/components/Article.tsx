import * as React from 'react';

import { CounterContext } from '../contexts/counter';

interface Props {
  count: number;
  clickCount: number;
}

const wait = (msec: number) => new Promise(res => setTimeout(res, msec));

const asyncDispatch = async (cb: () => void) => {
  await wait(1000);
  cb();
};

export const Article: React.FC<Props> = ({ count, clickCount }) => {
  const dispatch = React.useContext(CounterContext);

  return (
    <div>
      count: {count}, clickCount: {clickCount}
      <ul>
        <li>
          <button onClick={() => dispatch({ type: 'reset' })}>reset</button>
        </li>
        <li>
          <button onClick={() => dispatch({ type: 'clickincrement' })}>increment</button>
        </li>
        <li>
          <button onClick={() => dispatch({ type: 'clickdecrement' })}>decrement</button>
        </li>
        <li>
          <button onClick={() => asyncDispatch(() => dispatch({ type: 'clickincrement' }))}>async increment</button>
        </li>
        <li>
          <button onClick={() => asyncDispatch(() => dispatch({ type: 'clickincrement' }))}>async decrement</button>
        </li>
      </ul>
    </div>
  );
};
