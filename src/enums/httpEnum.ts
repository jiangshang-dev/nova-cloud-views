/**
 * @description: Request result set
 * Nova 微服务约定：成功码优先 200；兼容 Jeecg 风格 0
 */
export enum ResultEnum {
  SUCCESS = 200,
  SUCCESS_COMPAT = 0,
  ERROR = 1,
  TIMEOUT = 401,
  TYPE = 'success',
}

/**
 * @description: request method
 */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * @description:  contentTyp
 */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
}

/**
 * 请求 header
 * 网关/认证对接约定：
 * - Authorization: Bearer <token>
 * - X-Access-Token: <token>（兼容旧接口）
 * - X-Tenant-Id: 租户 ID
 */
export enum ConfigEnum {
  // TOKEN
  TOKEN = 'X-Access-Token',
  // TIMESTAMP
  TIMESTAMP = 'X-TIMESTAMP',
  // Sign
  Sign = 'X-Sign',
  // 租户id
  TENANT_ID = 'X-Tenant-Id',
  // 版本
  VERSION = 'X-Version',
  // 低代码应用ID
  X_LOW_APP_ID = 'X-Low-App-ID',
}
