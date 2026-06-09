import * as React from 'react';

import { StoreContext } from '@/context';

export const useReduxStore = () => {
  return React.useContext(StoreContext);
};