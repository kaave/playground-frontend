import { createContext } from 'react';

interface State {
  readonly count: number;
  readonly clickCount: number;
}

export interface Action {
  payload?: any;
  type: 'reset' | 'increment' | 'decrement' | 'clickincrement' | 'clickdecrement';
}
export type DispatchAction = React.Dispatch<Action>;
type Reducer = (state: State, action: Action) => State;

export const CounterContext = createContext((() => {
  throw new Error("set dispatch to Provider's value:props");
}) as DispatchAction);

export const initialState: State = { count: 0, clickCount: 0 };

export const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case 'reset':
      return { ...initialState };
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'clickincrement':
      return { ...state, count: state.count + 1, clickCount: state.clickCount + 1 };
    case 'clickdecrement':
      return { ...state, count: state.count - 1, clickCount: state.clickCount + 1 };
  }
};
