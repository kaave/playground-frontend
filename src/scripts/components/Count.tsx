import * as React from 'react';
import { range } from 'lodash-es';

interface Props {
  count: number;
}

export const Count: React.FC<Props> = ({ count }) => {
  const [stateCount, setStateCount] = React.useState(0);
  // この場合は、stateCountの値が変わっても呼び出し直されない
  const sum = React.useMemo(() => {
    console.log('call sum function', count);
    return range(1, count + 1).reduce((tmp, n) => tmp + n, 0);
  }, [count]);
  // この場合は、stateCountの値が変わると呼び出し直し
  // const sum = (() => {
  //   console.log('call sum function', count);
  //   return range(1, count + 1).reduce((tmp, n) => tmp + n, 0);
  // })();

  return (
    <div>
      propSum: {sum}, stateCount: {stateCount}
      <button onClick={() => setStateCount(n => n + 1)}>increment stateCount</button>
    </div>
  );
};
