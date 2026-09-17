/**
 * 确保全局 Promise 可用（现代浏览器已内置）
 * @returns {Promise<void>}
 */
export const ensurePromise = () => {
  if (typeof Promise !== 'undefined') {
    return Promise.resolve();
  }
  if (typeof window !== 'undefined' && typeof window.Promise !== 'undefined') {
    // eslint-disable-next-line no-global-assign
    Promise = window.Promise;
    return Promise.resolve();
  }
  return Promise.reject(new Error('Promise is not available'));
};

export default ensurePromise;
