// 更可靠的阿里云上传SDK加载辅助工具
// 通过更严格的时序控制和错误处理确保SDK正确加载

/**
 * 等待指定时间
 * @param {number} ms 毫秒数
 * @returns {Promise<void>}
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 检查对象是否存在且为函数
 * @param {any} obj 要检查的对象
 * @returns {boolean}
 */
const isFunction = (obj) => typeof obj === 'function';

/**
 * 安全地从window对象获取属性
 * @param {string} path 属性路径，如 'window.ES6Promise'
 * @returns {any} 属性值或undefined
 */
const getGlobalProperty = (path) => {
  try {
    return path.split('.').reduce((obj, prop) => obj && obj[prop], window);
  } catch (e) {
    console.warn(`获取全局属性失败: ${path}`, e);
    return undefined;
  }
};

/**
 * 安全地设置全局属性
 * @param {string} path 属性路径，如 'window.Promise'
 * @param {any} value 要设置的值
 * @returns {boolean} 是否设置成功
 */
const setGlobalProperty = (path, value) => {
  try {
    const parts = path.split('.');
    const prop = parts.pop();
    const obj = parts.reduce((obj, prop) => obj[prop], window);
    if (obj && prop) {
      obj[prop] = value;
      return true;
    }
    return false;
  } catch (e) {
    console.warn(`设置全局属性失败: ${path}`, e);
    return false;
  }
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
 * 加载单个SDK文件并等待其初始化
 * @param {string} filePath 文件路径（建议使用 /lib/... 公共路径）
 * @param {number} waitTime 等待时间（毫秒）
 * @returns {Promise<void>}
 */
const loadSdkFile = async (filePath, waitTime = 300) => {
  try {
    console.log(`开始加载SDK文件: ${filePath}`);

    await loadScript(filePath);
    console.log(`SDK文件导入成功: ${filePath}`);

    // 等待初始化
    await wait(waitTime);
    console.log(`SDK文件初始化完成: ${filePath}`);
  } catch (error) {
    console.error(`加载SDK文件失败: ${filePath}`, error);
    throw new Error(`加载SDK文件失败 ${filePath}: ${error.message}`);
  }
};

/**
 * 确保Promise可用
 * @returns {Promise<void>}
 */
export const ensurePromise = async () => {
  console.log('开始确保Promise可用...');

  // 如果Promise已经可用，直接返回
  if (typeof Promise !== 'undefined') {
    console.log('Promise已经可用');
    return;
  }

  try {
    // 检查是否已经存在ES6Promise
    const es6Promise = getGlobalProperty('ES6Promise');
    if (es6Promise) {
      console.log('发现已存在的ES6Promise，尝试赋值给Promise');
      if (setGlobalProperty('Promise', es6Promise)) {
        console.log('成功将ES6Promise赋值给Promise');
        return;
      }
    }

    // 现代浏览器已内置 Promise；无 polyfill 文件时跳过，避免打包/运行时报错
    console.log('未找到 ES6 Promise polyfill，跳过加载');

    // 再次检查并设置Promise
    await wait(100); // 额外等待确保脚本执行

    const newEs6Promise = getGlobalProperty('ES6Promise');
    if (newEs6Promise) {
      console.log('ES6 Promise polyfill加载完成，尝试赋值给Promise');
      if (setGlobalProperty('Promise', newEs6Promise)) {
        console.log('成功将新加载的ES6Promise赋值给Promise');
        return;
      }
    }

    // 如果还是没有Promise，抛出错误
    if (typeof Promise === 'undefined') {
      throw new Error('无法设置Promise对象');
    }
  } catch (error) {
    console.error('确保Promise可用时出错:', error);
    // 即使出错也继续，因为可能在其他地方已经处理了
  }
};

/**
 * 按顺序加载所有SDK文件
 * @returns {Promise<void>}
 */
const loadAllSdkFilesInOrder = async () => {
  try {
    console.log('开始按顺序加载所有SDK文件...');

    // 1. 确保Promise可用
    await ensurePromise();

    // 2. 加载OSS SDK（public/lib，与 index.html 一致）
    await loadSdkFile('/lib/aliyun-upload-sdk/aliyun-oss-sdk-6.17.1.min.js', 300);

    // 3. 加载上传SDK
    await loadSdkFile('/lib/aliyun-upload-sdk/aliyun-upload-sdk-1.5.7.min.js', 400);

    console.log('所有SDK文件加载完成');
  } catch (error) {
    console.error('按顺序加载SDK文件时出错:', error);
    throw error;
  }
};

/**
 * 检查并确保所有必要的全局对象都已正确设置
 * @returns {boolean} 是否所有对象都可用
 */
const ensureAllGlobalObjects = () => {
  try {
    console.log('开始检查全局对象...');

    // 检查Promise
    if (typeof Promise === 'undefined') {
      console.warn('Promise仍然不可用');
      return false;
    }
    console.log('Promise可用');

    // 检查AliyunUpload
    let aliyunUpload = getGlobalProperty('AliyunUpload');
    if (!aliyunUpload) {
      // 尝试从window对象获取
      aliyunUpload = getGlobalProperty('window.AliyunUpload');
      if (aliyunUpload) {
        // 尝试设置到全局
        if (setGlobalProperty('AliyunUpload', aliyunUpload)) {
          console.log('成功将window.AliyunUpload赋值给全局AliyunUpload');
        }
      }
    }

    if (!aliyunUpload) {
      console.warn('AliyunUpload不可用');
      return false;
    }
    console.log('AliyunUpload可用');

    // 检查AliyunUpload.Vod
    if (!aliyunUpload.Vod) {
      console.warn('AliyunUpload.Vod不可用');
      return false;
    }
    console.log('AliyunUpload.Vod可用');

    return true;
  } catch (error) {
    console.error('检查全局对象时出错:', error);
    return false;
  }
};

// 全局状态跟踪
let sdkLoadingState = {
  loading: false,
  loaded: false,
  error: null
};

/**
 * 确保阿里云上传SDK及其依赖已正确加载
 * @returns {Promise<boolean>} 是否加载成功
 */
export const ensureAliyunSDKLoaded = async () => {
  // 如果已经加载完成，直接返回
  if (sdkLoadingState.loaded) {
    console.log('Aliyun SDK已经加载完成，直接返回');
    return true;
  }

  // 如果正在加载中，等待加载完成
  if (sdkLoadingState.loading) {
    console.log('Aliyun SDK正在加载中，等待完成...');
    // 等待一段时间或直到加载完成
    let attempts = 0;
    while (sdkLoadingState.loading && attempts < 50) { // 最多等待5秒
      await wait(100);
      attempts++;
    }

    return sdkLoadingState.loaded;
  }

  // 开始加载过程
  sdkLoadingState.loading = true;
  sdkLoadingState.error = null;

  try {
    console.log('开始加载Aliyun SDK...');

    // 按顺序加载所有SDK文件
    await loadAllSdkFilesInOrder();

    // 等待一段时间确保初始化完成
    await wait(200);

    // 检查并确保全局对象正确设置
    const allObjectsAvailable = ensureAllGlobalObjects();

    if (allObjectsAvailable) {
      console.log('Aliyun SDK加载成功');
      sdkLoadingState.loaded = true;
      sdkLoadingState.loading = false;
      return true;
    } else {
      console.error('Aliyun SDK加载完成但全局对象不可用');
      sdkLoadingState.loaded = true; // 即使失败也标记为已完成，避免重复尝试
      sdkLoadingState.loading = false;
      sdkLoadingState.error = '全局对象不可用';
      return false;
    }
  } catch (error) {
    console.error('加载Aliyun SDK时出错:', error);
    sdkLoadingState.loading = false;
    sdkLoadingState.error = error.message;
    sdkLoadingState.loaded = true; // 即使失败也标记为已完成，避免重复尝试
    return false;
  }
};

/**
 * 获取SDK加载状态
 * @returns {Object} 加载状态信息
 */
export const getSdkLoadingStatus = () => {
  return { ...sdkLoadingState };
};

/**
 * 重置SDK加载状态（仅用于测试）
 */
export const resetSdkLoadingStatus = () => {
  sdkLoadingState = {
    loading: false,
    loaded: false,
    error: null
  };
};

/**
 * 上传视频到阿里云
 * @param {string} uploadAddress 上传地址
 * @param {string} uploadAuth 上传凭证
 * @param {File} file 视频文件
 * @param {Object} options 上传选项
 * @returns {Promise<Object>} 上传结果
 */
export const uploadVideoToAliyun = async (uploadAddress, uploadAuth, file, options = {}) => {
  try {
    // 确保SDK已加载
    const sdkLoaded = await ensureAliyunSDKLoaded();
    if (!sdkLoaded) {
      throw new Error('阿里云上传SDK未正确加载');
    }

    // 检查必要参数
    if (!uploadAddress || !uploadAuth || !file) {
      throw new Error('缺少必要的上传参数');
    }

    // 再次检查AliyunUpload.Vod是否可用
    if (typeof AliyunUpload === 'undefined' || typeof AliyunUpload.Vod === 'undefined') {
      // 尝试从window对象获取
      if (typeof window !== 'undefined' && typeof window.AliyunUpload !== 'undefined') {
        AliyunUpload = window.AliyunUpload;
        console.log('AliyunUpload从window对象重新赋值');
      } else {
        throw new Error('阿里云上传SDK未正确加载: AliyunUpload.Vod不可用');
      }
    }

    // 返回Promise包装的上传过程
    return new Promise((resolve, reject) => {
      try {
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
            console.log('上传开始:', uploadInfo);
            if (options.onUploadStarted) {
              options.onUploadStarted(uploadInfo);
            }
          },
          onUploadProgress: function (uploadInfo, totalSize, loadedSize) {
            console.log('上传进度:', uploadInfo, totalSize, loadedSize);
            if (options.onUploadProgress) {
              options.onUploadProgress(uploadInfo, totalSize, loadedSize);
            }
          },
          onUploadSucceed: function (uploadInfo) {
            console.log('上传成功:', uploadInfo);
            if (options.onUploadSucceed) {
              options.onUploadSucceed(uploadInfo);
            }
            resolve(uploadInfo);
          },
          onUploadFailed: function (uploadInfo, code, message) {
            console.error('上传失败:', uploadInfo, code, message);
            if (options.onUploadFailed) {
              options.onUploadFailed(new Error(message), code, message);
            }
            reject(new Error(message));
          },
          onUploadCanceled: function (uploadInfo) {
            console.log('上传取消:', uploadInfo);
            const error = new Error('上传已取消');
            if (options.onUploadCanceled) {
              options.onUploadCanceled(error);
            }
            reject(error);
          },
          onUploadEnd: function (uploadInfo) {
            console.log('上传结束:', uploadInfo);
            if (options.onUploadEnd) {
              options.onUploadEnd(uploadInfo);
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
