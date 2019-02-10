import React, { Dispatch, FC, MouseEvent } from 'react';

import { CounterContext, Action } from '../contexts/counter';

interface Props {
  count: number;
  clickCount: number;
}

const wait = (msec: number) => new Promise(res => setTimeout(res, msec));

const getAsyncDispatch: (
  dispatch: Dispatch<Action>,
) => (action: Action) => Promise<void> = dispatch => async action => {
  await wait(1000);
  dispatch(action);
};

export const Article: FC<Props> = ({ count, clickCount }) => {
  const dispatch = React.useContext(CounterContext);
  const asyncDispatch = getAsyncDispatch(dispatch);
  const buttonInfo: Array<[string, (e: MouseEvent<HTMLButtonElement>) => void | Promise<any>]> = [
    ['reset', () => dispatch({ type: 'reset' })],
    ['clickincrement', () => dispatch({ type: 'clickincrement' })],
    ['clickdecrement', () => dispatch({ type: 'clickdecrement' })],
    ['asyncclickincrement', async () => await asyncDispatch({ type: 'clickincrement' })],
    ['asyncclickdecrement', async () => await asyncDispatch({ type: 'clickdecrement' })],
  ];

  return (
    <div>
      count: {count}, clickCount: {clickCount}
      <ul>
        {buttonInfo.map(([typename, onClick]) => (
          <li key={typename}>
            <button onClick={onClick} value={typename}>
              {typename}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
