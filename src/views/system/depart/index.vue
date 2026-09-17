<template>
  <div class="p-4">
    <BasicTable @register="registerTable" :isTreeTable="true" :defaultExpandAllRows="true">
      <template #tableTitle>
        <a-button type="primary" @click="openModal(true, { isUpdate: false, parentId: 0 })">新增</a-button>
        <a-button class="ml-2" @click="reload">刷新</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DeptModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="system-depart">
  import { BasicTable, TableAction, useTable, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaDeptTree, novaDeptDelete } from '/@/api/nova/system';
  import DeptModal from './NovaDeptModal.vue';

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload }] = useTable({
    title: '部门管理',
    api: async (params) => (await novaDeptTree(params)) || [],
    rowKey: 'id',
    pagination: false,
    isTreeTable: true,
    defaultExpandAllRows: true,
    columns: [
      { title: '部门名称', dataIndex: 'deptName', width: 220, align: 'left' },
      { title: '部门编码', dataIndex: 'deptCode', width: 140 },
      { title: '排序', dataIndex: 'sort', width: 80 },
      { title: '电话', dataIndex: 'phone', width: 130 },
      { title: '邮箱', dataIndex: 'email', width: 180 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        customRender: ({ text }) => (text === 1 ? '正常' : '停用'),
      },
      { title: '备注', dataIndex: 'remark' },
    ],
    formConfig: {
      schemas: [{ field: 'deptName', label: '部门名称', component: 'Input', colProps: { span: 6 } }],
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 240,
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      slots: { customRender: 'action' },
    },
  });

  function getActions(record): ActionItem[] {
    return [
      { label: '新增下级', onClick: () => openModal(true, { isUpdate: false, parentId: record.id }) },
      { label: '编辑', onClick: () => openModal(true, { record, isUpdate: true }) },
      {
        label: '删除',
        color: 'error',
        popConfirm: { title: '确认删除？存在下级时无法删除', confirm: () => handleDelete(record) },
      },
    ];
  }

  async function handleDelete(record) {
    await novaDeptDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }
</script>
