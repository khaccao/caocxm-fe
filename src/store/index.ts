import configureStore from './configureStore';

export const persistConfigStorage = {
  whitelist: ['app', 'user', 'project'],
};
export const initialStoreCongig = configureStore(persistConfigStorage);
export const store = initialStoreCongig.store;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
