/**
 * 工作台演示数据（原 mianshi 接口已移除）
 * 后续对接 nova-monitor / nova-system 统计接口时在此替换为 defHttp 调用
 */

export interface CoOverview {
  totalUsers: number;
  todayNewUsers: number;
  todayActiveUsers: number;
  enabledQuestions: number;
  enabledCategories: number;
  todayQuestionCount: number;
  todayLearners: number;
  todayInterviews: number;
  todayAvgScore: number;
  resumeCount: number;
  todayCheckins: number;
  favoriteCount: number;
  aiSessionCount: number;
  emptyCategoryCount: number;
  disabledUserCount: number;
  interviewNoReportCount: number;
  skillQuestions: number;
  companyQuestions: number;
  specialQuestions: number;
}

export interface CoTrendPoint {
  date: string;
  count: number;
}

export interface CoRankItem {
  name: string;
  value: number;
}

export interface CoTodoItem {
  title: string;
  desc: string;
  count: number;
  route: string;
  icon: string;
  color: string;
}

export interface CoActivityItem {
  name: string;
  desc: string;
  date: string;
  time?: number;
  avatar: string;
}

export interface CoWorkbench {
  todoTotal: number;
  todayActive: number;
  totalUsers: number;
  todos: CoTodoItem[];
  activities: CoActivityItem[];
}

export interface CoAppFeature {
  memberEnabled: boolean;
  commentEnabled: boolean;
  questionAiEnabled: boolean;
  interviewAiEnabled: boolean;
  blogEnabled: boolean;
  forumEnabled: boolean;
}

const emptyOverview = (): CoOverview => ({
  totalUsers: 0,
  todayNewUsers: 0,
  todayActiveUsers: 0,
  enabledQuestions: 0,
  enabledCategories: 0,
  todayQuestionCount: 0,
  todayLearners: 0,
  todayInterviews: 0,
  todayAvgScore: 0,
  resumeCount: 0,
  todayCheckins: 0,
  favoriteCount: 0,
  aiSessionCount: 0,
  emptyCategoryCount: 0,
  disabledUserCount: 0,
  interviewNoReportCount: 0,
  skillQuestions: 0,
  companyQuestions: 0,
  specialQuestions: 0,
});

export const getCoOverview = async (): Promise<CoOverview> => emptyOverview();

export const getCoWorkbench = async (): Promise<CoWorkbench> => ({
  todoTotal: 0,
  todayActive: 0,
  totalUsers: 0,
  todos: [],
  activities: [],
});

export const getCoUserTrend = async (_days = 7): Promise<CoTrendPoint[]> => [];
export const getCoStudyTrend = async (_days = 7): Promise<CoTrendPoint[]> => [];
export const getCoInterviewTrend = async (_days = 7): Promise<CoTrendPoint[]> => [];
export const getCoHotCategories = async (_limit = 7): Promise<CoRankItem[]> => [];
export const getCoWeakTopics = async (_limit = 7): Promise<CoRankItem[]> => [];

export const getCoAppFeature = async (): Promise<CoAppFeature> => ({
  memberEnabled: false,
  commentEnabled: false,
  questionAiEnabled: false,
  interviewAiEnabled: false,
  blogEnabled: false,
  forumEnabled: false,
});

export const saveCoAppFeature = async (data: CoAppFeature): Promise<CoAppFeature> => data;
