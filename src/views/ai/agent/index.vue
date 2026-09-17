<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="openModal(true, { isUpdate: false })">新增 Agent</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <AgentModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="ai-agent">
  import { BasicTable, TableAction, useTable, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaAiAgentPage, novaAiAgentDelete } from '/@/api/nova/ai';
  import AgentModal from './AgentModal.vue';

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload }] = useTable({
    title: 'Agent 管理',
    api: novaAiAgentPage,
    rowKey: 'id',
    columns: [
      { title: '编码', dataIndex: 'agentCode', width: 140 },
      { title: '名称', dataIndex: 'agentName', width: 160 },
      { title: '模型ID', dataIndex: 'modelId', width: 160 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        customRender: ({ text }) => (text === 1 ? '正常' : '停用'),
      },
      { title: '备注', dataIndex: 'remark' },
      { title: '创建时间', dataIndex: 'gmtCreate', width: 180 },
    ],
    formConfig: {
      schemas: [{ field: 'agentName', label: '名称', component: 'Input', colProps: { span: 6 } }],
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 140,
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      slots: { customRender: 'action' },
    },
    fetchSetting: {
      pageField: 'current',
      sizeField: 'size',
      listField: 'records',
      totalField: 'total',
    },
  });

  function getActions(record): ActionItem[] {
    return [
      { label: '编辑', onClick: () => openModal(true, { record, isUpdate: true }) },
      {
        label: '删除',
        color: 'error',
        popConfirm: { title: '确认删除？', confirm: () => handleDelete(record) },
      },
    ];
  }

  async function handleDelete(record) {
    await novaAiAgentDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }
</script>
