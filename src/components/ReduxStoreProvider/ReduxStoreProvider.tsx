import React, { useState } from 'react';

import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persitConfigKey } from '@/common/define';
import { StoreContext } from '@/context';
import { injectStore, setToken } from '@/services/HttpClient';
import { initialStoreCongig } from '@/store';
import configureStore from '@/store/configureStore';

interface ReduxStoreProviderProps {
  children: React.ReactNode;
}

injectStore(initialStoreCongig.store);

export const ReduxStoreProvider = ({ children }: ReduxStoreProviderProps) => {
  const [storeConfig, setStoreConfig] = useState(initialStoreCongig);

  const changeStoreConfig = React.useCallback((config: any) => {
    localStorage.setItem(persitConfigKey, JSON.stringify(config));
    const nextStoreConfig = configureStore(config);
    injectStore(nextStoreConfig.store);
    setStoreConfig(nextStoreConfig);
  }, []);

  const restoreHttpClientSession = React.useCallback(() => {
    injectStore(storeConfig.store);
    const token = storeConfig.store.getState().app.auth?.token;
    setToken(token ?? null);
  }, [storeConfig.store]);

  return (
    <StoreContext.Provider value={{ changeStoreConfig }}>
      <StoreProvider store={storeConfig.store}>
        <PersistGate
          loading={null}
          persistor={storeConfig.persistor}
          onBeforeLift={restoreHttpClientSession}
        >
          {children}
        </PersistGate>
      </StoreProvider>
    </StoreContext.Provider>
  );
};
