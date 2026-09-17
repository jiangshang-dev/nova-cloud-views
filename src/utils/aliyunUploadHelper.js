// 阿里云上传SDK加载辅助工具
// 确保所有依赖正确加载后再使用SDK

import { ensurePromise } from './promisePolyfill.js';

// 全局变量来跟踪SDK加载状态
let sdkLoadingPromise = null;
let sdkLoaded = false;

/**
 * 确保阿里云上传SDK及其依赖已正确加载
 * @returns {Promise<boolean>} 是否加载成功
 */
export const ensureAliyunSDKLoaded = () => {
  // 如果已经加载完成，直接返回resolved promise
  if (sdkLoaded) {
    console.log('Aliyun SDK already loaded, returning immediately');
    return Promise.resolve(true);
  }

  // 如果正在加载中，返回正在加载的promise
  if (sdkLoadingPromise) {
    console.log('Aliyun SDK loading in progress, returning existing promise');
    return sdkLoadingPromise;
  }

  // 开始加载过程
  sdkLoadingPromise = new Promise((resolve, reject) => {
    try {
      console.log('Starting Aliyun SDK loading process...');

      // 确保Promise可用
      ensurePromise()
        .then(() => {
          console.log('Promise ensured, now loading SDK files...');

          // 按正确顺序加载SDK文件
          return loadSDKFilesInOrder();
        })
        .then(() => {
          console.log('All SDK files loaded, checking availability...');

          // 验证SDK是否正确加载
          if (isSDKAvailable()) {
            console.log('Aliyun SDK loaded and available');
            sdkLoaded = true;
            resolve(true);
          } else {
            // 如果SDK不可用，等待一段时间再检查一次
            console.log('Aliyun SDK not immediately available, waiting...');
            return new Promise(resolve => setTimeout(resolve, 500)); // 增加等待时间到500ms
          }
        })
        .then(() => {
          // 再次检查SDK是否可用
          if (isSDKAvailable()) {
            console.log('Aliyun SDK loaded and available after waiting');
            sdkLoaded = true;
            resolve(true);
          } else {
            console.error('Aliyun SDK not available after loading and waiting');
            sdkLoaded = true; // 标记为已加载，避免重复尝试
            // 不reject，而是resolve(false)表示加载失败但程序继续
            resolve(false);
          }
        })
        .catch(error => {
          console.error('Failed to load Aliyun SDK:', error);
          sdkLoaded = true; // 标记为已加载，避免重复尝试
          // 不reject，而是resolve(false)表示加载失败但程序继续
          resolve(false);
        });
    } catch (error) {
      console.error('Error in SDK loading process:', error);
      sdkLoaded = true; // 标记为已加载，避免重复尝试
      // 不reject，而是resolve(false)表示加载失败但程序继续
      resolve(false);
    }
  });

  return sdkLoadingPromise;
};

/**
 * 通过 script 标签加载 SDK（与 index.html / public/lib 路径一致，避免 Vite 打包解析本地相对路径）
 * @param {string} src
 * @returns {Promise<void>}
 */
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('document is not available'));
      return;
    }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

/**
 * 按正确顺序加载SDK文件
 * @returns {Promise<void>}
 */
const loadSDKFilesInOrder = () => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Loading SDK files in correct order...');

      // 1. 加载ES6 Promise polyfill（已经在ensurePromise中处理）
      // 直接等待确保Promise已设置
      setTimeout(() => {
        console.log('Promise should be ready, loading OSS SDK...');

        // 若 index.html 已注入 SDK，直接完成
        if (isSDKAvailable()) {
          ensureGlobalObjects();
          resolve();
          return;
        }

        // 2. 加载OSS SDK（public/lib，与 index.html 一致）
        loadScript('/lib/aliyun-upload-sdk/aliyun-oss-sdk-6.17.1.min.js')
          .then(() => {
            console.log('OSS SDK loaded, waiting for initialization...');

            // 等待OSS SDK初始化完成（增加等待时间）
            return new Promise(resolve => setTimeout(resolve, 400));
          })
          .then(() => {
            console.log('OSS SDK initialized, loading upload SDK...');

            // 3. 最后加载上传SDK
            return loadScript('/lib/aliyun-upload-sdk/aliyun-upload-sdk-1.5.7.min.js');
          })
          .then(() => {
            console.log('Upload SDK loaded, waiting for initialization...');

            // 等待上传SDK初始化完成（增加等待时间）
            return new Promise(resolve => setTimeout(resolve, 500));
          })
          .then(() => {
            console.log('All SDK files loaded successfully');

            // 确保全局对象正确设置
            ensureGlobalObjects();
            resolve();
          })
          .catch(error => {
            console.error('Error loading SDK files:', error);
            reject(error);
          });
      }, 100); // 短暂等待确保Promise设置完成
    } catch (error) {
      console.error('Error in loadSDKFilesInOrder:', error);
      reject(error);
    }
  });
};

/**
 * 检查SDK是否可用
 * @returns {boolean}
 */
const isSDKAvailable = () => {
  try {
    // 检查 AliyunUpload 是否可用
    if (typeof AliyunUpload !== 'undefined' && typeof AliyunUpload.Vod !== 'undefined') {
      return true;
    }

    // 尝试从window对象获取
    if (typeof window !== 'undefined' && typeof window.AliyunUpload !== 'undefined' &&
        typeof window.AliyunUpload.Vod !== 'undefined') {
      // 将window.AliyunUpload赋值给全局变量
      AliyunUpload = window.AliyunUpload;
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking SDK availability:', error);
    return false;
  }
};

/**
 * 确保全局对象正确设置
 */
const ensureGlobalObjects = () => {
  try {
    // 确保AliyunUpload可用
    if (typeof window !== 'undefined') {
      // 如果全局AliyunUpload未定义，但window.AliyunUpload存在，尝试赋值
      if (typeof AliyunUpload === 'undefined' && typeof window.AliyunUpload !== 'undefined') {
        try {
          AliyunUpload = window.AliyunUpload;
          console.log('AliyunUpload assigned from window object');
        } catch (e) {
          console.error('Error assigning AliyunUpload from window:', e);
        }
      }

      // 确保ES6Promise正确设置为全局Promise
      if (typeof Promise === 'undefined' && typeof window.ES6Promise !== 'undefined') {
        try {
          const es6Promise = window.ES6Promise;
          if (typeof es6Promise === 'function') {
            Promise = es6Promise;
          } else if (es6Promise.Promise) {
            Promise = es6Promise.Promise;
          } else {
            Promise = es6Promise;
          }
          console.log('Promise assigned from window.ES6Promise');
        } catch (e) {
          console.error('Error assigning Promise from window.ES6Promise:', e);
        }
      }

      // 如果window.ES6Promise不存在但window.Promise存在，确保全局Promise可用
      if (typeof Promise === 'undefined' && typeof window.Promise !== 'undefined') {
        try {
          Promise = window.Promise;
          console.log('Promise assigned from window.Promise');
        } catch (e) {
          console.error('Error assigning Promise from window.Promise:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring global objects:', error);
  }
};

/**
 * 上传视频到阿里云
 * @param {string} uploadAddress 上传地址
 * @param {string} uploadAuth 上传凭证
 * @param {File} file 视频文件
 * @param {Object} options 上传选项
 * @returns {Promise<Object>} 上传结果
 */
export const uploadVideoToAliyun = (uploadAddress, uploadAuth, file, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 确保SDK已加载
      const sdkLoadedResult = await ensureAliyunSDKLoaded();

      // 检查SDK是否成功加载
      if (!sdkLoadedResult) {
        console.warn('Aliyun SDK may not be loaded properly, continuing anyway...');
      }

      // 检查必要参数
      if (!uploadAddress || !uploadAuth || !file) {
        reject(new Error('缺少必要的上传参数'));
        return;
      }

      console.log('Initializing upload with:', {
        uploadAddress: typeof uploadAddress,
        uploadAuth: typeof uploadAuth,
        fileName: file.name,
        fileSize: file.size
      });

      // 检查AliyunUpload.Vod是否可用（再次检查）
      if (typeof AliyunUpload === 'undefined' || typeof AliyunUpload.Vod === 'undefined') {
        console.error('AliyunUpload.Vod is not available');
        // 尝试从window对象获取
        if (typeof window !== 'undefined' && typeof window.AliyunUpload !== 'undefined') {
          AliyunUpload = window.AliyunUpload;
          console.log('AliyunUpload reassigned from window object');
        } else {
          // 即使SDK不可用也尝试继续，因为可能在其他地方已经处理了
          console.warn('AliyunUpload.Vod not available, but continuing anyway...');
        }
      }

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
          console.log('onUploadStarted:', uploadInfo);
          // 上传开始时更新UI
          if (options.onUploadStarted) {
            options.onUploadStarted(uploadInfo);
          }
        },
        onUploadProgress: function (uploadInfo, totalSize, loadedSize) {
          console.log('onUploadProgress:', uploadInfo, totalSize, loadedSize);
          // 添加更详细的日志
          if (uploadInfo && uploadInfo.percent) {
            console.log('Upload percent from uploadInfo:', uploadInfo.percent);
          }
          // 确保传递正确的参数给回调函数
          if (options.onUploadProgress) {
            // 注意：阿里云SDK的参数顺序是(uploadInfo, totalSize, loadedSize)
            options.onUploadProgress(uploadInfo, totalSize, loadedSize);
          }
        },
        onUploadSucceed: function (uploadInfo) {
          console.log('onUploadSucceed:', uploadInfo);
          if (options.onUploadSucceed) {
            options.onUploadSucceed(uploadInfo);
          }
          // 确保resolve被调用
          resolve(uploadInfo);
        },
        onUploadFailed: function (uploadInfo, code, message) {
          console.error('onUploadFailed:', uploadInfo, code, message);
          if (options.onUploadFailed) {
            options.onUploadFailed(new Error(message), code, message);
          }
          // 确保reject被调用
          reject(new Error(message));
        },
        onUploadCanceled: function (uploadInfo) {
          console.log('onUploadCanceled:', uploadInfo);
          const error = new Error('上传已取消');
          if (options.onUploadCanceled) {
            options.onUploadCanceled(error);
          }
          // 确保reject被调用
          reject(error);
        },
        onUploadEnd: function (uploadInfo) {
          console.log('onUploadEnd:', uploadInfo);
          // 无论上传成功还是失败，都确保更新UI
          if (options.onUploadEnd) {
            options.onUploadEnd(uploadInfo);
          }
        }
      });

      // 开始上传
      console.log('Starting upload process...');
      uploader.startUpload();
      console.log('Upload process started');
    } catch (error) {
      console.error('上传视频时出错:', error);
      // 即使出错也尝试继续，而不是直接reject
      resolve({ error: error.message });
    }
  });
};
