/**
 * Nova AI API —— 对接 nova-ai-server
 */
import { defHttp } from '/@/utils/http/axios';

function toPageParams(params: Recordable = {}) {
  const { pageNo, pageSize, current, size, ...rest } = params;
  return {
    ...rest,
    current: current ?? pageNo ?? 1,
    size: size ?? pageSize ?? 10,
  };
}

// ---------- 模型提供商 ----------
export const novaAiProviderList = () => defHttp.get({ url: '/ai/model/provider/list' });

export const novaAiProviderSave = (data) => defHttp.post({ url: '/ai/model/provider', data });

export const novaAiProviderDelete = (id: string | number) =>
  defHttp.delete({ url: `/ai/model/provider/${id}` });

// ---------- 模型 ----------
export const novaAiModelList = (params?: { providerId?: string | number; modelName?: string }) =>
  defHttp.get({ url: '/ai/model/admin/list', params });

export const novaAiModelEnabledList = (providerId?: string | number) =>
  defHttp.get({ url: '/ai/model/list', params: { providerId } });

export const novaAiModelSave = (data) => defHttp.post({ url: '/ai/model', data });

export const novaAiModelDelete = (id: string | number) => defHttp.delete({ url: `/ai/model/${id}` });

// ---------- Agent ----------
export const novaAiAgentPage = (params) =>
  defHttp.get({ url: '/ai/agent/page', params: toPageParams(params) });

export const novaAiAgentGet = (id: string | number) => defHttp.get({ url: `/ai/agent/${id}` });

export const novaAiAgentSave = (data) => defHttp.post({ url: '/ai/agent', data });

export const novaAiAgentDelete = (id: string | number) => defHttp.delete({ url: `/ai/agent/${id}` });

// ---------- 知识库 ----------
export const novaAiKnowledgePage = (params) =>
  defHttp.get({ url: '/ai/knowledge/page', params: toPageParams(params) });

export const novaAiKnowledgeGet = (id: string | number) => defHttp.get({ url: `/ai/knowledge/${id}` });

export const novaAiKnowledgeSave = (data) => defHttp.post({ url: '/ai/knowledge', data });

export const novaAiKnowledgeDelete = (id: string | number) =>
  defHttp.delete({ url: `/ai/knowledge/${id}` });

// ---------- 工作流 ----------
export const novaAiWorkflowPage = (params) =>
  defHttp.get({ url: '/ai/workflow/page', params: toPageParams(params) });

export const novaAiWorkflowGet = (id: string | number) => defHttp.get({ url: `/ai/workflow/${id}` });

export const novaAiWorkflowSave = (data) => defHttp.post({ url: '/ai/workflow', data });

export const novaAiWorkflowDelete = (id: string | number) =>
  defHttp.delete({ url: `/ai/workflow/${id}` });
