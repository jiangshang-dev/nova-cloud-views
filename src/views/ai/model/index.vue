<template>
  <div class="p-4">
    <a-card title="模型提供商" size="small" class="mb-4">
      <BasicTable @register="registerProviderTable">
        <template #tableTitle>
          <a-button type="primary" @click="openProviderModal(true, { isUpdate: false })">新增提供商</a-button>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getProviderActions(record)" />
        </template>
      </BasicTable>
    </a-card>

    <a-card title="模型列表" size="small">
      <BasicTable @register="registerModelTable">
        <template #tableTitle>
          <a-button type="primary" @click="openModelModal(true, { isUpdate: false })">新增模型</a-button>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getModelActions(record)" />
        </template>
      </BasicTable>
    </a-card>

    <ProviderModal @register="registerProviderModal" @success="onProviderSuccess" />
    <ModelModal @register="registerModelModal" @success="reloadModels" />
  </div>
</template>

<script lang="ts" setup name="ai-model">
  import { BasicTable, TableAction, useTable, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    novaAiProviderList,
    novaAiProviderDelete,
    novaAiModelList,
    novaAiModelDelete,
  } from '/@/api/nova/ai';
  import ProviderModal from './ProviderModal.vue';
  import ModelModal from './ModelModal.vue';

  const { createMessage } = useMessage();
  const [registerProviderModal, { openModal: openProviderModal }] = useModal();
  const [registerModelModal, { openModal: openModelModal }] = useModal();

  const [registerProviderTable, { reload: reloadProviders }] = useTable({
    api: novaAiProviderList,
    rowKey: 'id',
    pagination: false,
    columns: [
      { title: '编码', dataIndex: 'providerCode', width: 140 },
      { title: '名称', dataIndex: 'providerName', width: 160 },
      { title: 'Base URL', dataIndex: 'baseUrl' },
      { title: 'API Key', dataIndex: 'apiKeyCipher', width: 140 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        customRender: ({ text }) => (text === 1 ? '正常' : '停用'),
      },
      { title: '备注', dataIndex: 'remark', width: 160 },
    ],
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 140,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  });

  const [registerModelTable, { reload: reloadModels }] = useTable({
    api: novaAiModelList,
    rowKey: 'id',
    pagination: false,
    columns: [
      { title: '模型编码', dataIndex: 'modelCode', width: 160 },
      { title: '模型名称', dataIndex: 'modelName', width: 160 },
      { title: '类型', dataIndex: 'modelType', width: 100 },
      { title: '提供商ID', dataIndex: 'providerId', width: 160 },
      { title: '上下文窗口', dataIndex: 'contextWindow', width: 110 },
      { title: 'Max Tokens', dataIndex: 'maxTokens', width: 110 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        customRender: ({ text }) => (text === 1 ? '正常' : '停用'),
      },
      { title: '备注', dataIndex: 'remark' },
    ],
    formConfig: {
      schemas: [
        { field: 'modelName', label: '模型名称', component: 'Input', colProps: { span: 6 } },
        { field: 'providerId', label: '提供商ID', component: 'Input', colProps: { span: 6 } },
      ],
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 140,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  });

  function getProviderActions(record): ActionItem[] {
    return [
      { label: '编辑', onClick: () => openProviderModal(true, { record, isUpdate: true }) },
      {
        label: '删除',
        color: 'error',
        popConfirm: { title: '确认删除该提供商？', confirm: () => handleDeleteProvider(record) },
      },
    ];
  }

  function getModelActions(record): ActionItem[] {
    return [
      { label: '编辑', onClick: () => openModelModal(true, { record, isUpdate: true }) },
      {
        label: '删除',
        color: 'error',
        popConfirm: { title: '确认删除该模型？', confirm: () => handleDeleteModel(record) },
      },
    ];
  }

  async function handleDeleteProvider(record) {
    await novaAiProviderDelete(record.id);
    createMessage.success('删除成功');
    reloadProviders();
  }

  async function handleDeleteModel(record) {
    await novaAiModelDelete(record.id);
    createMessage.success('删除成功');
    reloadModels();
  }

  function onProviderSuccess() {
    reloadProviders();
    reloadModels();
  }
</script>
