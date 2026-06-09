import React from 'react';

interface StoreContextType {
  changeStoreConfig: (persistConfig: any) => void;
}

export const StoreContext = React.createContext<StoreContextType>(null!);