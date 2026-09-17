import { defHttp } from '/@/utils/http/axios';

enum Api {
  overview = '/sys/fd/dashboard/overview',
  userTrend = '/sys/fd/dashboard/userTrend',
  memberOrderTrend = '/sys/fd/dashboard/memberOrderTrend',
  mallOrderTrend = '/sys/fd/dashboard/mallOrderTrend',
  topMallProducts = '/sys/fd/dashboard/topMallProducts',
  workbench = '/sys/fd/dashboard/workbench',
}

export interface FdOverview {
  totalUsers: number;
  todayNewUsers: number;
  activeMembers: number;
  totalMemberSales: number;
  todayMemberSales: number;
  totalPaidMemberOrders: number;
  todayPaidMemberOrders: number;
  totalMallOrders: number;
  pendingMallOrders: number;
  onlineRecipes: number;
  pendingComments: number;
  pendingFeedback: number;
  pendingCsSessions: number;
  totalPointsIssued: number;
}

export interface FdTrendPoint {
  date: string;
  count: number;
  amount?: number;
}

export interface FdRankItem {
  name: string;
  value: number;
}

export interface FdTodoItem {
  title: string;
  desc: string;
  count: number;
  route: string;
  icon: string;
  color: string;
}

export interface FdActivityItem {
  name: string;
  desc: string;
  date: string;
  time?: number;
  avatar: string;
}

export interface FdWorkbench {
  todoTotal: number;
  todoDone: number;
  moduleCount: number;
  totalUsers: number;
  todos: FdTodoItem[];
  activities: FdActivityItem[];
}

export const getFdOverview = () => defHttp.get<FdOverview>({ url: Api.overview });

export const getFdUserTrend = (days = 7) =>
  defHttp.get<FdTrendPoint[]>({ url: Api.userTrend, params: { days } });

export const getFdMemberOrderTrend = (days = 7) =>
  defHttp.get<FdTrendPoint[]>({ url: Api.memberOrderTrend, params: { days } });

export const getFdMallOrderTrend = (days = 7) =>
  defHttp.get<FdTrendPoint[]>({ url: Api.mallOrderTrend, params: { days } });

export const getFdTopMallProducts = (limit = 7) =>
  defHttp.get<FdRankItem[]>({ url: Api.topMallProducts, params: { limit } });

export const getFdWorkbench = () => defHttp.get<FdWorkbench>({ url: Api.workbench });
