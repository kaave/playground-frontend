import * as React from 'react';

interface Props {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export const Button: React.FC<Props> = ({ onClick, children }) => <button onClick={onClick}>{children}</button>;
