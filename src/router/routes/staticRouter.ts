import type { AppRouteRecordRaw } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

export const AI_ROUTE: AppRouteRecordRaw = {
  path: '',
  name: 'ai-parent',
  component: LAYOUT,
  meta: {
    title: 'ai',
  },
  children: [
    {
      path: '/ai',
      name: 'ai',
      component: () => import('/@/views/dashboard/ai/index.vue'),
      meta: {
        title: 'AI助手',
      },
    },
  ],
};

/**
 * 账户设置由后端 MenuRouteBuilder 注入到 /system 下（hideMenu），
 * 避免与动态菜单的 /system 父路由冲突。
 */
export const staticRoutesList = [AI_ROUTE];
