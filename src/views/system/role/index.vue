<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="handleCreate">新增</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <RoleModal @register="registerModal" @success="reload" />
    <RoleMenuModal @register="registerPerm" @success="reload" />
    <RoleUserModal @register="registerUser" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="system-role">
  import { BasicTable, TableAction, useTable, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaRolePage, novaRoleDelete } from '/@/api/nova/system';
  import RoleModal from './NovaRoleModal.vue';
  import RoleMenuModal from './NovaRoleMenuModal.vue';
  import RoleUserModal from './NovaRoleUserModal.vue';

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerPerm, { openModal: openPerm }] = useModal();
  const [registerUser, { openModal: openUser }] = useModal();

  const ACTION_COLUMN = {
    width: 280,
    title: '操作',
    dataIndex: 'action',
    fixed: 'right' as const,
    slots: { customRender: 'action' },
  };

  const [registerTable, { reload }] = useTable({
    title: '角色管理',
    api: novaRolePage,
    rowKey: 'id',
    canResize: true,
    showIndexColumn: true,
    columns: [
      { title: '角色名称', dataIndex: 'roleName', width: 140 },
      { title: '角色编码', dataIndex: 'roleCode', width: 140 },
      { title: '排序', dataIndex: 'sort', width: 80 },
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
      schemas: [{ field: 'roleName', label: '角色名称', component: 'Input', colProps: { span: 6 } }],
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    actionColumn: ACTION_COLUMN,
    fetchSetting: {
      pageField: 'current',
      sizeField: 'size',
      listField: 'records',
      totalField: 'total',
    },
  });

  function handleCreate() {
    openModal(true, { isUpdate: false });
  }

  function getActions(record): ActionItem[] {
    return [
      { label: '编辑', onClick: () => openModal(true, { record, isUpdate: true }) },
      { label: '角色授权', onClick: () => openPerm(true, { record }) },
      { label: '角色用户', onClick: () => openUser(true, { record }) },
      {
        label: '删除',
        color: 'error',
        popConfirm: { title: '确认删除该角色？', confirm: () => handleDelete(record) },
      },
    ];
  }

  async function handleDelete(record) {
    await novaRoleDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }
</script>
