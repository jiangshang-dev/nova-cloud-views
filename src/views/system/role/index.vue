<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="openModal(true, { isUpdate: false })">新增</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            { label: '编辑', onClick: () => openModal(true, { record, isUpdate: true }) },
            { label: '菜单权限', onClick: () => openPerm(true, { record }) },
            {
              label: '删除',
              color: 'error',
              popConfirm: { title: '确认删除？', confirm: () => handleDelete(record) },
            },
          ]"
        />
      </template>
    </BasicTable>
    <RoleModal @register="registerModal" @success="reload" />
    <RoleMenuModal @register="registerPerm" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="system-role">
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaRolePage, novaRoleDelete } from '/@/api/nova/system';
  import RoleModal from './NovaRoleModal.vue';
  import RoleMenuModal from './NovaRoleMenuModal.vue';

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerPerm, { openModal: openPerm }] = useModal();

  const [registerTable, { reload }] = useTable({
    title: '角色管理',
    api: novaRolePage,
    rowKey: 'id',
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
    actionColumn: { width: 240, title: '操作', dataIndex: 'action' },
    fetchSetting: {
      pageField: 'current',
      sizeField: 'size',
      listField: 'records',
      totalField: 'total',
    },
  });

  async function handleDelete(record) {
    await novaRoleDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }
</script>
