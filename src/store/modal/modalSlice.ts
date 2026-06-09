import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import Utils from '@/utils';

interface ModalState {
  modals: {
    [key: string]: {
      visible: boolean;
    };
  };
}

const initialState: ModalState = {
  modals: {},
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      state.modals[key] = { visible: true };
    },
    hideModal: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      const modals = Utils.deepClone(state.modals);
      delete modals[key];
      state.modals = modals;
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;
export const modalReducer = modalSlice.reducer;
