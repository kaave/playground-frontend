import * as React from 'react';

export interface Props {
  message: string;
}

export const Message: React.FC<Props> = ({ message }) => <p className="Message">{message}</p>;
