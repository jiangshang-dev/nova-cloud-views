// 阿里云 VOD 上传工具类
class AliyunVodUpload {
  constructor(options = {}) {
    this.userId = options.userId || 'heima';
    this.region = options.region || 'cn-shanghai';
    this.partSize = options.partSize || 1048576;
    this.parallel = options.parallel || 5;
    this.retryCount = options.retryCount || 3;
    this.retryDuration = options.retryDuration || 2;
    this.uploader = null;
  }

  static getAliyunUpload() {
    if (typeof window !== 'undefined' && window.AliyunUpload) {
      return window.AliyunUpload;
    }
    return null;
  }

  initUploader(authInfo, file, callbacks = {}) {
    return new Promise((resolve, reject) => {
      try {
        const aliyunUpload = AliyunVodUpload.getAliyunUpload();
        if (!aliyunUpload || !aliyunUpload.Vod) {
          reject(new Error('阿里云上传SDK未正确加载'));
          return;
        }

        if (!authInfo?.uploadAuth || !authInfo?.uploadAddress) {
          reject(new Error('缺少必需的上传凭证参数'));
          return;
        }

        if (!file) {
          reject(new Error('缺少必需的文件参数'));
          return;
        }

        this.uploader = new aliyunUpload.Vod({
          userId: this.userId,
          region: this.region,
          partSize: this.partSize,
          parallel: this.parallel,
          retryCount: this.retryCount,
          retryDuration: this.retryDuration,
          onUploadstarted: (uploadInfo) => {
            callbacks.onUploadStarted?.(uploadInfo);
            this.uploader.setUploadAuthAndAddress(
              uploadInfo,
              authInfo.uploadAuth,
              authInfo.uploadAddress,
              authInfo.videoId,
            );
          },
          onUploadProgress: (uploadInfo, totalSize, loadedSize) => {
            callbacks.onUploadProgress?.(uploadInfo, totalSize, loadedSize);
          },
          onUploadSucceed: (uploadInfo) => {
            callbacks.onUploadSucceed?.(uploadInfo);
            resolve(uploadInfo);
          },
          onUploadFailed: (uploadInfo, code, message) => {
            callbacks.onUploadFailed?.(uploadInfo, code, message);
            reject(new Error(message));
          },
          onUploadEnd: (uploadInfo) => {
            callbacks.onUploadEnd?.(uploadInfo);
          },
          onUploadTokenExpired: (uploadInfo) => {
            callbacks.onUploadTokenExpired?.(uploadInfo);
          },
        });

        this.uploader.addFile(file);
        resolve(this.uploader);
      } catch (error) {
        reject(new Error('初始化上传实例失败: ' + error.message));
      }
    });
  }

  startUpload() {
    if (!this.uploader) {
      throw new Error('上传实例未初始化');
    }
    this.uploader.startUpload();
  }

  stopUpload() {
    this.uploader?.stopUpload();
  }

  resumeUploadWithAuth(uploadAuth) {
    this.uploader?.resumeUploadWithAuth(uploadAuth);
  }

  static isSdkAvailable() {
    const aliyunUpload = AliyunVodUpload.getAliyunUpload();
    return aliyunUpload !== null && typeof aliyunUpload.Vod !== 'undefined';
  }
}

export default AliyunVodUpload;
