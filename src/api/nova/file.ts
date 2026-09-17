/**
 * Nova 文件服务 API
 */
import { defHttp } from '/@/utils/http/axios';

enum Api {
  StorageList = '/file/storage/list',
  Storage = '/file/storage',
  UploadInit = '/file/upload/init',
  UploadChunk = '/file/upload/chunk',
  UploadMerge = '/file/upload/merge',
  UploadProgress = '/file/upload/progress',
  UploadSimple = '/file/upload',
  InfoPage = '/file/info/page',
  Info = '/file/info',
}

export type StorageType = 'local' | 'minio' | 'rustfs' | 'oss' | 's3';

export interface FileStorage {
  id?: string | number;
  storageCode: string;
  storageName: string;
  storageType: StorageType;
  endpoint?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  bucketName?: string;
  basePath?: string;
  domain?: string;
  extConfig?: string;
  isDefault?: number;
  status?: number;
  remark?: string;
}

export interface UploadInitResult {
  skipUpload: boolean;
  fileId?: string | number;
  accessUrl?: string;
  uploadId?: string;
  objectKey?: string;
  chunkSize: number;
  chunkTotal: number;
  uploadedChunks: number[];
}

export interface FileInfo {
  id: string | number;
  fileName: string;
  fileSuffix?: string;
  contentType?: string;
  fileSize: number;
  fileMd5?: string;
  accessUrl?: string;
  objectKey?: string;
  uploadStatus: number;
  gmtCreate?: string;
}

export const listStorage = () => defHttp.get<FileStorage[]>({ url: Api.StorageList });

export const createStorage = (data: FileStorage) =>
  defHttp.post<string | number>({ url: Api.Storage, data });

export const updateStorage = (id: string | number, data: FileStorage) =>
  defHttp.put({ url: `${Api.Storage}/${id}`, data });

export const deleteStorage = (id: string | number, storageCode?: string) =>
  defHttp.delete({ url: `${Api.Storage}/${id}`, params: { storageCode } });

export const enableStorage = (id: string | number, storageCode?: string) =>
  defHttp.post({ url: `${Api.Storage}/${id}/enable`, params: { storageCode } });

export const disableStorage = (id: string | number, storageCode?: string) =>
  defHttp.post({ url: `${Api.Storage}/${id}/disable`, params: { storageCode } });

export const testStorage = (id: string | number, storageCode?: string) =>
  defHttp.post({ url: `${Api.Storage}/${id}/test`, params: { storageCode } });

export const initUpload = (data: Recordable) =>
  defHttp.post<UploadInitResult>({ url: Api.UploadInit, data });

export const uploadChunk = (data: FormData, onUploadProgress?: (e: ProgressEvent) => void) => {
  // 仅走 multipart 表单字段，勿把 uploadId 放 query（S3 ID 含 +/ 易被错误解码）
  return defHttp.post(
    {
      url: Api.UploadChunk,
      data,
      onUploadProgress,
    },
    { isTransformResponse: true }
  );
};

export const mergeUpload = (uploadId: string) =>
  defHttp.post<FileInfo>({ url: Api.UploadMerge, data: { uploadId } });

export const getUploadProgress = (uploadId: string) =>
  defHttp.get<number[]>({ url: `${Api.UploadProgress}/${uploadId}` });

export const simpleUpload = (params: { file: File; bizType?: string; bizId?: string }) => {
  return defHttp.uploadFile<FileInfo>(
    { url: Api.UploadSimple },
    { file: params.file, data: { bizType: params.bizType, bizId: params.bizId } }
  );
};

export const pageFileInfo = (params: { pageNo?: number; pageSize?: number; fileName?: string }) =>
  defHttp.get({ url: Api.InfoPage, params });

export const deleteFileInfo = (id: string | number) => defHttp.delete({ url: `${Api.Info}/${id}` });
