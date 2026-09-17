import { defHttp } from '/@/utils/http/axios';
import { getMenuListResultModel } from './model/menuModel';
import { useUserStoreWithOut } from '@/store/modules/user';
import { setAuthCache } from '@/utils/auth';
import { TOKEN_KEY } from '@/enums/cacheEnum';
import { router } from '@/router';
import { PageEnum } from '@/enums/pageEnum';
import { NovaApi, USE_NOVA_AUTH } from '/@/api/nova/paths';

enum Api {
  GetMenuList = '/sys/permission/getUserPermissionByToken',
}

/**
 * @description: Get user menu based on id
 */
export const getMenuList = () => {
  return new Promise((resolve) => {
    const url = USE_NOVA_AUTH ? NovaApi.GetMenu : Api.GetMenuList;
    defHttp.get<getMenuListResultModel>({ url }).then((res) => {
      if (Array.isArray(res)) {
        resolve(res);
      } else {
        resolve(res['menu']);
      }
    });
  });
};

/**
 * @description: 获取后台菜单权限和按钮权限
 */
export function getBackMenuAndPerms() {
  const url = USE_NOVA_AUTH ? NovaApi.GetMenu : Api.GetMenuList;
  return defHttp.get({ url }).catch((e) => {
    console.log('接口 getBackMenuAndPerms 异常错误信息：', e);
    if (e && (e.message.includes('timeout') || e.message.includes('401') || e.message.includes('500'))) {
      const userStore = useUserStoreWithOut();
      userStore.setToken('');
      setAuthCache(TOKEN_KEY, null);
      router.push({
        path: PageEnum.BASE_LOGIN,
        query: {
          redirect: router.currentRoute.value.fullPath,
        },
      });
    }
  });
}
