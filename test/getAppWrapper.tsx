import React from 'react';
import { Router } from 'react-router-dom';
import { MemoryHistory } from 'history';

export function getAppWrapper(history: MemoryHistory): React.ComponentType {
  return function Wrapper({ children }) {
    return <Router history={history}>{children}</Router>;
  };
}
