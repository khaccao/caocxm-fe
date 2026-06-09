import { createSlice } from '@reduxjs/toolkit';

interface OrganizationState {
  selectedOrg: any | null;
}

const initialState: OrganizationState = {
  selectedOrg: null,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setSelectedOrg: (state, action) => {
      state.selectedOrg = action.payload;
    },
  },
});

export const organizationActions = organizationSlice.actions;
export const organizationReducer = organizationSlice.reducer;
