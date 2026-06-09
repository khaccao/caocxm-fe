import HttpClient from "./HttpClient";
import { RequestOptions } from "./types";
import { getEnvVars } from "@/environment";

const { identityUrl } = getEnvVars();

export interface UserPreferencesReponse {
  clientId: string;
  defaultOrganization: string;
  settings: string;
  userGuid: string;
}

export interface CreateUserPreferencesPayload {
  setting: string;
  defaultOrganization: string;
}

export interface UpdateUser {
  oldPassword: string;
  newPassword: string;
}

class UserController {
  public Get = {
    getUserByEmail: (email: string, options?: RequestOptions) => {
      return HttpClient.get(`${identityUrl}/license_manager/users/${email}`, options);
    },
    getUserPreferences: (options?: RequestOptions) => {
      return HttpClient.get(`${identityUrl}/license_manager/users/current/preferences/currentClient`, options);
    },
    getOrganizations: (options?: RequestOptions) => {
      return HttpClient.get(`${identityUrl}/license_manager/users/current/organizations`, options);
    },
    getCurrentConfig: (options?: RequestOptions) => {
      return HttpClient.get(`${identityUrl}/config/current`, options);
    },
  };
  public Post  = {
    createUserPreferences: (input: CreateUserPreferencesPayload, options?: RequestOptions) => {
      return HttpClient.post(`${identityUrl}/license_manager/users/current/preferences`, input, options);
    },
  }

  //[#20926][hoang_nm][26/11/2024] service cập nhật mật khẩu
  public Put = {
    updateUsers: (input: UpdateUser, options?: RequestOptions) => {
      return HttpClient.put(`${identityUrl}/license_manager/users/current/password`, input, options);
    },
  };
}

export const UserService = new UserController();