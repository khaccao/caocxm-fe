import { AnyAction, configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootEpics from './epics';
import rootReducers from './reducers';
import { RootState } from './types';
import { persitConfigKey } from '@/common/define';

const resetStaleLocalPersistedState = () => {
  if (!import.meta.env.DEV || import.meta.env.VITE_CLEAR_PERSIST_ON_START !== 'true') return;

  const migrationKey = 'cxmLocalStorageVersion';
  const migrationVersion = 'vite-1';
  if (localStorage.getItem(migrationKey) === migrationVersion) return;

  const savedConfigVal = localStorage.getItem(persitConfigKey);
  let persistKey = 'root';

  if (savedConfigVal) {
    try {
      persistKey = JSON.parse(savedConfigVal)?.key || persistKey;
    } catch {
      // Invalid legacy config should not prevent the local app from starting.
    }
  }

  localStorage.removeItem(`persist:${persistKey}`);
  localStorage.removeItem(persitConfigKey);
  localStorage.setItem(migrationKey, migrationVersion);
};

resetStaleLocalPersistedState();

const storeConfig = (config: any) => {
  const savedConfigVal = localStorage.getItem(persitConfigKey);
  const savedConfig = savedConfigVal ? JSON.parse(savedConfigVal) : {};
  const persistConfig = {
    key: 'root',
    storage,
    whitelist: [],
    ...savedConfig,
    ...config,
  };

  const persistedReducer = persistReducer(persistConfig, rootReducers);
  const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>();

  const store = configureStore({
    reducer: persistedReducer,
    devTools: import.meta.env.DEV,
    middleware: getDefaultMiddleware => {
      const middlewares = getDefaultMiddleware({
        serializableCheck: false,
      }).concat(epicMiddleware);

      return middlewares;
    },
  });

  epicMiddleware.run(rootEpics);

  const persistor = persistStore(store);

  return { store, persistor };
};

export default storeConfig;
