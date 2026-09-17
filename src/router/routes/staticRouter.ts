import type { AppRouteRecordRaw } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

/**
 * AI 助手独立路径，避免与动态菜单「AI平台」父路由 /ai 冲突。
 */
export const AI_ROUTE: AppRouteRecordRaw = {
  path: '',
  name: 'ai-assistant-parent',
  component: LAYOUT,
  meta: {
    title: 'ai-assistant',
  },
  children: [
    {
      path: '/ai-assistant',
      name: 'ai-assistant',
      component: () => import('/@/views/dashboard/ai/index.vue'),
      meta: {
        title: 'AI助手',
        hideMenu: true,
      },
    },
  ],
};

/**
 * 账户设置由后端 MenuRouteBuilder 注入到 /system 下（hideMenu），
 * 避免与动态菜单的 /system 父路由冲突。
 */
export const staticRoutesList = [AI_ROUTE];
