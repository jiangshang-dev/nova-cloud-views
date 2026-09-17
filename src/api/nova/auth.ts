/**
 * Nova Auth API 封装
 */
import { defHttp } from '/@/utils/http/axios';
import { NovaApi, USE_NOVA_AUTH } from './paths';
import type { ErrorMessageMode } from '/#/axios';

export interface NovaLoginParams {
  username: string;
  password: string;
  captcha: string;
  checkKey: string;
}

export interface NovaLoginResult {
  token: string;
  access_token?: string;
  refreshToken?: string;
  expiresIn?: number;
  userInfo?: Recordable;
}

export function novaLoginApi(params: NovaLoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<NovaLoginResult>(
    {
      url: NovaApi.Login,
      params,
    },
    { errorMessageMode: mode },
  );
}

export function novaLogoutApi() {
  return defHttp.post({ url: NovaApi.Logout });
}

export function novaGetCaptcha(checkKey: string | number) {
  return defHttp.get<string>({ url: `${NovaApi.Captcha}/${checkKey}` });
}

export function novaGetUserInfoApi() {
  return defHttp.get({ url: NovaApi.GetUserInfo }, { errorMessageMode: 'none' });
}

export function novaGetPermCodeApi() {
  return defHttp.get({ url: NovaApi.GetPermCode });
}

export function novaRefreshTokenApi(refreshToken: string) {
  return defHttp.post(
    {
      url: NovaApi.RefreshToken,
      params: { refreshToken },
    },
    { withToken: false, errorMessageMode: 'none' },
  );
}

export { USE_NOVA_AUTH };
