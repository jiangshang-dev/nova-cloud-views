/**
 * Nova Cloud 微服务 API 路径约定
 *
 * 开发环境：Vite 代理 `/api` -> Gateway(`localhost:8080`)，并去掉 `/api` 前缀
 * 生产环境：同域或 CDN 反代 `/api` -> Gateway
 */

/** 切换为 true 后走 Nova Auth 路径 */
export const USE_NOVA_AUTH = true;

export const NovaApi = {
  // ---- 认证（nova-auth）----
  Login: USE_NOVA_AUTH ? '/auth/login/password' : '/sys/login',
  Logout: USE_NOVA_AUTH ? '/auth/logout' : '/sys/logout',
  Captcha: USE_NOVA_AUTH ? '/auth/captcha' : '/sys/randomImage',
  RefreshToken: '/auth/token/refresh',
  GetUserInfo: USE_NOVA_AUTH ? '/auth/user/info' : '/sys/user/getUserInfo',
  GetPermCode: USE_NOVA_AUTH ? '/auth/permission/codes' : '/sys/permission/getPermCode',
  GetMenu: USE_NOVA_AUTH ? '/system/menu/user' : '/sys/permission/getUserPermissionByToken',

  // ---- 系统（nova-system）----
  UserPage: '/system/user/page',
  RolePage: '/system/role/page',
  DeptTree: '/system/dept/tree',
  DictItems: '/system/dict/items',

  // ---- 文件（nova-file）----
  FileUpload: '/file/upload',
  FileUploadInit: '/file/upload/init',
  FileUploadChunk: '/file/upload/chunk',
  FileUploadMerge: '/file/upload/merge',
  FileDownload: '/file/download',
  FileStorageList: '/file/storage/list',
  FileInfoPage: '/file/info/page',
} as const;

/**
 * 统一响应约定（前后端对齐）：
 * {
 *   code: 0 | 200,
 *   data: T,
 *   message: string
 * }
 *
 * 请求头约定：
 *   Authorization: Bearer <access_token>
 *   X-Access-Token: <access_token>
 *   X-Tenant-Id: <tenantId>
 */
