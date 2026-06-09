import { createSlice } from "@reduxjs/toolkit";

import { UpdateUser, UserPreferencesReponse } from "@/services/UserService";

interface UserState {
  me?: any;
  preferences?: UserPreferencesReponse;
  organizations: any[];
  defaultOragization?: any;
  fetchingPreferences: boolean;
  currentConfig?: any;
  updateUser: UpdateUser;
  errorPassword?: any;


}

const initialState: UserState = {
  updateUser: {
    oldPassword: '',
    newPassword: '',
  },
  fetchingPreferences: true,
  organizations: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getUserPreferences: (state) => {
      state.fetchingPreferences = true;
    },
    updateUser: (state, action) => {
      state.updateUser = action.payload;
    },
    setUserPreferences: (state, action) => {
      state.preferences = action.payload;
      state.fetchingPreferences = false;
    },
    setFetchingPreferences: (state, action) => {
      state.fetchingPreferences = action.payload;
    },
    getCurrentUser: (state) => {},

     //[#20992][hoang_nm][28/11/2024] Lưu lỗi lại vào redux
     setErrorPassword: (state, action) => {
      state.errorPassword = action.payload;
    },
    setMe: (state, action) => {
      state.me = action.payload;
    },
    getOrganizations: (state) => {},
    setOrganizations: (state, action) => {
      state.organizations = action.payload;
    },
    setDefaultOrganization: (state, action) => {
      state.defaultOragization = action.payload;
    },
    getCurrentConfigRequest: (state) => {},
    setCurrentConfig: (state, action) => {
      state.currentConfig = action.payload;
    },
    createUserPreferencesRequest: (state, action) => {},
  }
});

export const userActions = userSlice.actions;
export const userReducer = userSlice.reducer;