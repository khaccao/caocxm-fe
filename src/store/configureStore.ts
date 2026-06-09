import { AnyAction, configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootEpics from './epics';
import rootReducers from './reducers';
import { RootState } from './types';
import { persitConfigKey } from '@/common/define';

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
    devTools: process.env.NODE_ENV !== 'production',
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
