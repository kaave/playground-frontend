import React, { Dispatch, FC, MouseEvent, useEffect } from 'react';

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

const ButtonCell: FC<{
  onClick: (e: MouseEvent<HTMLButtonElement>) => void | Promise<any>;
  typename: string;
}> = React.memo(({ onClick, typename }) => (
  <li>
    <button onClick={onClick} value={typename}>
      {typename}
    </button>
  </li>
));

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

  // createRefと同じ感じ class propertyっぽくも使えるので更新時にrender走らせたくないネタにも使える
  const rootRef = React.useRef<HTMLDivElement>(null);
  const nowRef = React.useRef<string>(new Date().toString());
  useEffect(() => {
    nowRef.current = new Date().toString();
    if (rootRef.current) {
      rootRef.current.setAttribute('data-date', nowRef.current);
    }
  });

  return (
    <div ref={rootRef}>
      count: {count}, clickCount: {clickCount}
      <ul>
        {buttonInfo.map(([typename, onClick]) => (
          <ButtonCell key={typename} {...{ onClick: React.useCallback(onClick, []), typename }} />
        ))}
      </ul>
    </div>
  );
};
