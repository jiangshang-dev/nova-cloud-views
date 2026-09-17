<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="openModal(true, { isUpdate: false })">新增</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <UserModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="system-user">
  import { BasicTable, TableAction, useTable, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaUserPage, novaUserDelete, novaUserResetPassword } from '/@/api/nova/system';
  import UserModal from './NovaUserModal.vue';

  const { createMessage, createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload }] = useTable({
    title: '用户管理',
    api: novaUserPage,
    rowKey: 'id',
    canResize: true,
    showIndexColumn: true,
    columns: [
      { title: '账号', dataIndex: 'username', width: 120 },
      { title: '昵称', dataIndex: 'nickname', width: 120 },
      { title: '姓名', dataIndex: 'realName', width: 120 },
      { title: '手机', dataIndex: 'phone', width: 130 },
      { title: '邮箱', dataIndex: 'email', width: 180 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        customRender: ({ text }) => (text === 1 ? '正常' : '停用'),
      },
      { title: '创建时间', dataIndex: 'gmtCreate', width: 180 },
    ],
    formConfig: {
      schemas: [{ field: 'username', label: '账号', component: 'Input', colProps: { span: 6 } }],
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 220,
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
      { label: '重置密码', onClick: () => handleResetPwd(record) },
      {
        label: '删除',
        color: 'error',
        popConfirm: { title: '确认删除？', confirm: () => handleDelete(record) },
      },
    ];
  }

  async function handleDelete(record) {
    await novaUserDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }

  function handleResetPwd(record) {
    createConfirm({
      iconType: 'warning',
      title: '重置密码',
      content: `将用户 ${record.username} 密码重置为 admin123？`,
      onOk: async () => {
        await novaUserResetPassword(record.id, 'admin123');
        createMessage.success('已重置为 admin123');
      },
    });
  }
</script>
