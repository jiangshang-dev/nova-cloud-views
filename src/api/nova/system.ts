/**
 * Nova System API —— 对接 nova-system，兼容 Jeecg 页面调用习惯
 */
import { defHttp } from '/@/utils/http/axios';

function toPageParams(params: Recordable = {}) {
  const { pageNo, pageSize, current, size, ...rest } = params;
  return {
    ...rest,
    current: current ?? pageNo ?? 1,
    size: size ?? pageSize ?? 10,
  };
}

// ---------- 用户 ----------
export const novaUserPage = (params) =>
  defHttp.get({ url: '/system/user/page', params: toPageParams(params) });

export const novaUserGet = (id: string | number) => defHttp.get({ url: `/system/user/${id}` });

export const novaUserSave = (data, isUpdate: boolean) =>
  isUpdate ? defHttp.put({ url: '/system/user', data }) : defHttp.post({ url: '/system/user', data });

export const novaUserDelete = (id: string | number) => defHttp.delete({ url: `/system/user/${id}` });

export const novaUserRoleIds = (id: string | number) => defHttp.get({ url: `/system/user/${id}/roleIds` });

export const novaUserAssignRoles = (id: string | number, roleIds: Array<string | number>) =>
  defHttp.put({ url: `/system/user/${id}/roles`, data: roleIds });

export const novaUserResetPassword = (id: string | number, password: string) =>
  defHttp.put({ url: `/system/user/${id}/password`, data: { password } });

// ---------- 角色 ----------
export const novaRolePage = (params) =>
  defHttp.get({ url: '/system/role/page', params: toPageParams(params) });

export const novaRoleList = () => defHttp.get({ url: '/system/role/list' });

export const novaRoleGet = (id: string | number) => defHttp.get({ url: `/system/role/${id}` });

export const novaRoleSave = (data, isUpdate: boolean) =>
  isUpdate ? defHttp.put({ url: '/system/role', data }) : defHttp.post({ url: '/system/role', data });

export const novaRoleDelete = (id: string | number) => defHttp.delete({ url: `/system/role/${id}` });

export const novaRoleMenuIds = (id: string | number) => defHttp.get({ url: `/system/role/${id}/menuIds` });

export const novaRoleAssignMenus = (id: string | number, menuIds: Array<string | number>) =>
  defHttp.put({ url: `/system/role/${id}/menus`, data: menuIds });

// ---------- 菜单 ----------
export const novaMenuTree = () => defHttp.get({ url: '/system/menu/tree' });

export const novaMenuList = () => defHttp.get({ url: '/system/menu/list' });

export const novaMenuSave = (data, isUpdate: boolean) =>
  isUpdate ? defHttp.put({ url: '/system/menu', data }) : defHttp.post({ url: '/system/menu', data });

export const novaMenuDelete = (id: string | number) => defHttp.delete({ url: `/system/menu/${id}` });

// ---------- 日志 ----------
export const novaOperLogPage = (params) =>
  defHttp.get({ url: '/system/log/oper/page', params: toPageParams(params) });

export const novaOperLogDelete = (id: string | number) => defHttp.delete({ url: `/system/log/oper/${id}` });

export const novaOperLogClear = () => defHttp.delete({ url: '/system/log/oper/clear' });

export const novaLoginLogPage = (params) =>
  defHttp.get({ url: '/system/log/login/page', params: toPageParams(params) });

export const novaLoginLogDelete = (id: string | number) => defHttp.delete({ url: `/system/log/login/${id}` });

export const novaLoginLogClear = () => defHttp.delete({ url: '/system/log/login/clear' });
