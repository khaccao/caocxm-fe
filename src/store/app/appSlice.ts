import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

import { JwtDecoded } from '@/common/define';
import { permissionsByRole } from '@/common/permissions';
import { EmployeesByCompanyId } from '@/common/project';
import { DanhSachUserResponse } from '@/services/EmployeeService';
import { setToken } from '@/services/HttpClient';

interface AppState {
  language: string;
  auth?: any;
  captcha?: any;
  activeMenu?: any;
  selectedEmployeeDetails?: EmployeesByCompanyId;
  DanhSachUseriis?: DanhSachUserResponse[];
  grantedPolicies?: { [policyKey: string]: boolean };
  username: string;
  password: string;
}

const initialState: AppState = {
  username: '',
  password: '',
  language: 'vi',
  grantedPolicies: {},
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoginInput: (state, action: PayloadAction<{ usernameLogin: string; passwordLogin: string }>) => {
      state.username = action.payload.usernameLogin;
      state.password = action.payload.passwordLogin;
    },

    ping: state => {},
    // prettier-ignore
    loginRequest: (state, action: PayloadAction<{ input: any; callback?: VoidFunction }>) => {},
    loginSuccess: (state, action) => {
      const { loginResponse, loginData } = action.payload;
      const { access_token, refresh_token } = loginResponse;
      const decoded: JwtDecoded = jwtDecode(access_token);
      setToken(access_token);
      const auth = {
        user: JSON.parse(decoded.profile),
        token: access_token,
        refresh_token,
        remember: loginData.remember,
        roles: decoded.role,
        orgRoles: decoded.orgRoles,
        // [21/11/2024][dmp_thinh][update if not has companyId then set undefined rather than id "3"]
        company: {
          id: decoded.CompanyId ? decoded.CompanyId : undefined,
          orgId: decoded.OrgId,
        },
        Cxm_Permissions: decoded.Cxm_Permissions,
      };
      state.auth = auth;
      state.captcha = undefined;

      const permissions = decoded.Cxm_Permissions || [];
      let grantedPolicies = permissions.reduce((prev, cur) => ({ ...prev, [cur]: true }), {});
      // const userRoles = decoded.role;
      // let grantedPolicies = {};

      // if (userRoles) {
      //   if (Array.isArray(userRoles)) {
      //     userRoles.forEach(role => {
      //       const permissions = permissionsByRole[role];
      //       if (permissions?.length) {
      //         grantedPolicies = permissions.reduce((acc, permission) => ({ ...acc, [permission]: true }), {});
      //       }
      //     });
      //   }
      //   // if userRoles === string
      //   else {
      //     const permissions = permissionsByRole[userRoles];
      //     grantedPolicies = permissions.reduce((acc, permission) => ({ ...acc, [permission]: true }), {});
      //   }
      // } else {
      //   grantedPolicies = {};
      // }

      state.grantedPolicies = grantedPolicies;
    },
    updateToken: (state, action) => {
      console.log('action.payload: ', action.payload);
      state.auth = { ...state.auth, token: action.payload.token };
    },
    getCaptcha: (state, action) => {},
    setCaptcha: (state, action) => {
      state.captcha = action.payload;
    },
    logout: (state, action: PayloadAction<{ callback?: VoidFunction }>) => {
      const { callback } = action.payload;
      setToken(null);
      state.auth = undefined;
      state.grantedPolicies = {};
      state.selectedEmployeeDetails = undefined;
      state.DanhSachUseriis = undefined;
      state.username = '';
      state.password = '';
      if (callback) {
        callback();
      }
    },
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    getEmployeeByContactRequest: (state, action: PayloadAction<{ phone: string; email: string }>) => {},
    getUserIISRequest: (state, action: PayloadAction<{ userName: string }>) => {},
    setEmployeeDetails: (state, action) => {
      state.selectedEmployeeDetails = action.payload;
    },
    setDanhSachUser: (state, action) => {
      state.DanhSachUseriis = action.payload;
    },
  },
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
