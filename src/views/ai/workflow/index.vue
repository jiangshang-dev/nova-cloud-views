<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="openModal(true, { isUpdate: false })">新增工作流</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <WorkflowModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="ai-workflow">
  import { BasicTable, TableAction, useTable, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaAiWorkflowPage, novaAiWorkflowDelete } from '/@/api/nova/ai';
  import WorkflowModal from './WorkflowModal.vue';

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();

  const statusMap = { 0: '草稿', 1: '已发布', 2: '停用' };

  const [registerTable, { reload }] = useTable({
    title: '工作流管理',
    api: novaAiWorkflowPage,
    rowKey: 'id',
    canResize: true,
    showIndexColumn: true,
    columns: [
      { title: '编码', dataIndex: 'workflowCode', width: 140 },
      { title: '名称', dataIndex: 'workflowName', width: 160 },
      { title: '版本', dataIndex: 'version', width: 80 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        customRender: ({ text }) => statusMap[text] ?? text,
      },
      { title: '备注', dataIndex: 'remark' },
      { title: '创建时间', dataIndex: 'gmtCreate', width: 180 },
    ],
    formConfig: {
      schemas: [{ field: 'workflowName', label: '名称', component: 'Input', colProps: { span: 6 } }],
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
    await novaAiWorkflowDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }
</script>
