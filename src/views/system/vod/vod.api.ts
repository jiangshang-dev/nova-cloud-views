import { defHttp } from '/@/utils/http/axios';

enum Api {
  getAliyunConfig = '/sys/vod/config/aliyun',
  saveAliyunConfig = '/sys/vod/config/aliyun',
  getVideoConfig = '/sys/vod/config/video',
  saveVideoConfig = '/sys/vod/config/video',
  getVideoList = '/sys/vod/video/list',
  deleteVideo = '/sys/vod/auth/video',
  getPlayInfo = '/sys/vod/auth/play/info',
  getUploadAuth = '/sys/vod/auth/upload/auth/json',
  refreshUploadAuth = '/sys/vod/auth/upload/refresh',
}

/**
 * 获取阿里云VOD配置
 */
export const getAliyunConfig = () => defHttp.get({ url: Api.getAliyunConfig });

/**
 * 保存阿里云VOD配置
 */
export const saveAliyunConfig = (params) => defHttp.post({ url: Api.saveAliyunConfig, params });

/**
 * 获取视频业务配置
 */
export const getVideoConfig = () => defHttp.get({ url: Api.getVideoConfig });

/**
 * 保存视频业务配置
 */
export const saveVideoConfig = (params) => defHttp.post({ url: Api.saveVideoConfig, params });

/**
 * 获取视频列表
 */
export const getVideoList = (params) => defHttp.get({ url: Api.getVideoList, params });

/**
 * 删除视频
 */
export const deleteVideo = (id, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteVideo, params: { videoId: id } }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 获取播放信息
 */
export const getPlayInfo = (videoId) => defHttp.get({ url: Api.getPlayInfo, params: { videoId } }, { isTransformResponse: false });

/**
 * 获取上传凭证
 */
export const getUploadAuth = (params) => defHttp.post({ url: Api.getUploadAuth, params }, { isTransformResponse: false });

/**
 * 刷新上传凭证（大文件上传凭证过期时使用）
 */
export const refreshUploadAuth = (videoId: string) =>
  defHttp.post({ url: Api.refreshUploadAuth, params: { videoId } }, { joinParamsToUrl: true, isTransformResponse: false });
