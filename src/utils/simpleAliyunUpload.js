// 简化版阿里云上传SDK工具
// 通过静态导入方式避免动态加载问题

// 注意：这些SDK文件需要在项目初始化时就加载
// 我们假设它们已经在index.html或其他地方通过script标签加载了

/**
 * 检查阿里云上传SDK是否可用
 * @returns {boolean}
 */
export const isAliyunUploadAvailable = () => {
  try {
    // 检查是否可以从window对象获取
    if (typeof window !== 'undefined' && typeof window.AliyunUpload !== 'undefined') {
      // 将window.AliyunUpload赋值给全局变量（如果还没有的话）
      if (typeof AliyunUpload === 'undefined') {
        AliyunUpload = window.AliyunUpload;
      }
      return typeof AliyunUpload !== 'undefined' && typeof AliyunUpload.Vod !== 'undefined';
    }

    // 直接检查全局变量
    return typeof AliyunUpload !== 'undefined' && typeof AliyunUpload.Vod !== 'undefined';
  } catch (error) {
    console.error('检查AliyunUpload可用性时出错:', error);
    return false;
  }
};

/**
 * 确保阿里云上传SDK可用
 * @returns {Promise<boolean>}
 */
export const ensureAliyunUploadSDK = () => {
  return new Promise((resolve) => {
    // 检查SDK是否已经可用
    if (isAliyunUploadAvailable()) {
      console.log('AliyunUpload SDK is already available');
      resolve(true);
      return;
    }

    // 如果不可用，尝试从window对象获取
    if (typeof window !== 'undefined' && typeof window.AliyunUpload !== 'undefined') {
      try {
        AliyunUpload = window.AliyunUpload;
        if (typeof AliyunUpload !== 'undefined' && typeof AliyunUpload.Vod !== 'undefined') {
          console.log('AliyunUpload SDK assigned from window object');
          resolve(true);
          return;
        }
      } catch (error) {
        console.error('从window对象赋值AliyunUpload时出错:', error);
      }
    }

    // 如果还是不可用，等待一段时间再检查（可能是异步加载的）
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;
      if (isAliyunUploadAvailable()) {
        console.log('AliyunUpload SDK became available after waiting');
        clearInterval(checkInterval);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        console.warn('AliyunUpload SDK is not available after maximum attempts');
        clearInterval(checkInterval);
        // 即使不可用也resolve(true)，让调用方决定如何处理
        resolve(true);
      }
    }, 200);
  });
};

/**
 * 上传视频到阿里云（简化版）
 * @param {string} uploadAddress 上传地址
 * @param {string} uploadAuth 上传凭证
 * @param {File} file 视频文件
 * @param {Object} options 上传选项
 * @returns {Promise<Object>} 上传结果
 */
export const uploadVideoToAliyun = async (uploadAddress, uploadAuth, file, options = {}) => {
  try {
    // 确保SDK可用
    const sdkAvailable = await ensureAliyunUploadSDK();

    // 检查必要参数
    if (!uploadAddress || !uploadAuth || !file) {
      throw new Error('缺少必要的上传参数');
    }

    // 再次检查SDK是否可用
    if (!isAliyunUploadAvailable()) {
      throw new Error('阿里云上传SDK未正确加载');
    }

    // 返回Promise包装的上传过程
    return new Promise((resolve, reject) => {
      try {
        console.log('初始化阿里云上传实例...');

        // 保存回调函数引用，确保它们能被正确调用
        const callbacks = {
          onUploadStarted: options.onUploadStarted,
          onUploadProgress: options.onUploadProgress,
          onUploadSucceed: options.onUploadSucceed,
          onUploadFailed: options.onUploadFailed,
          onUploadCanceled: options.onUploadCanceled,
          onUploadEnd: options.onUploadEnd
        };

        // 初始化上传实例
        const uploader = new AliyunUpload.Vod({
          userId: options.userId || 'heima',
          region: options.region || '',
          uploadAddress: uploadAddress,
          uploadAuth: uploadAuth,
          fileName: file.name,
          fileSize: file.size,
          endpoint: options.endpoint || '',
          timeout: options.timeout || 60000,
          onUploadstarted: function (uploadInfo) {
            console.log('上传开始回调触发:', uploadInfo);
            if (callbacks.onUploadStarted) {
              try {
                callbacks.onUploadStarted(uploadInfo);
              } catch (error) {
                console.error('调用onUploadStarted回调时出错:', error);
              }
            }
          },
          onUploadProgress: function (uploadInfo, totalSize, loadedSize) {
            console.log('上传进度回调触发:', { uploadInfo, totalSize, loadedSize });
            if (callbacks.onUploadProgress) {
              try {
                callbacks.onUploadProgress(uploadInfo, totalSize, loadedSize);
              } catch (error) {
                console.error('调用onUploadProgress回调时出错:', error);
              }
            }
          },
          onUploadSucceed: function (uploadInfo) {
            console.log('上传成功回调触发:', uploadInfo);
            if (callbacks.onUploadSucceed) {
              try {
                callbacks.onUploadSucceed(uploadInfo);
              } catch (error) {
                console.error('调用onUploadSucceed回调时出错:', error);
              }
            }
            resolve(uploadInfo);
          },
          onUploadFailed: function (uploadInfo, code, message) {
            console.error('上传失败回调触发:', uploadInfo, code, message);
            if (callbacks.onUploadFailed) {
              try {
                const error = new Error(message);
                callbacks.onUploadFailed(error, code, message);
              } catch (error) {
                console.error('调用onUploadFailed回调时出错:', error);
              }
            }
            reject(new Error(message || '上传失败'));
          },
          onUploadCanceled: function (uploadInfo) {
            console.log('上传取消回调触发:', uploadInfo);
            if (callbacks.onUploadCanceled) {
              try {
                const error = new Error('上传已取消');
                callbacks.onUploadCanceled(error);
              } catch (error) {
                console.error('调用onUploadCanceled回调时出错:', error);
              }
            }
            reject(new Error('上传已取消'));
          },
          onUploadEnd: function (uploadInfo) {
            console.log('上传结束回调触发:', uploadInfo);
            if (callbacks.onUploadEnd) {
              try {
                callbacks.onUploadEnd(uploadInfo);
              } catch (error) {
                console.error('调用onUploadEnd回调时出错:', error);
              }
            }
          }
        });

        // 开始上传
        console.log('开始上传过程...');
        uploader.startUpload();
        console.log('上传过程已启动');
      } catch (error) {
        console.error('初始化上传实例时出错:', error);
        reject(new Error(`初始化上传实例时出错: ${error.message}`));
      }
    });
  } catch (error) {
    console.error('上传视频时出错:', error);
    throw new Error(`上传视频时出错: ${error.message}`);
  }
};
