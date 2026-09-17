<template>
  <div class="p-4">
    <BasicTable @register="registerTable" :isTreeTable="true" :defaultExpandAllRows="true">
      <template #tableTitle>
        <a-button type="primary" @click="openModal(true, { isUpdate: false, parentId: 0, menuType: 'M' })">
          新增一级菜单
        </a-button>
        <a-button class="ml-2" @click="reload">刷新</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <MenuModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="system-menu">
  import { BasicTable, TableAction, useTable, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaMenuTree, novaMenuDelete } from '/@/api/nova/system';
  import MenuModal from './NovaMenuModal.vue';

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload }] = useTable({
    title: '菜单管理',
    api: async () => (await novaMenuTree()) || [],
    rowKey: 'id',
    pagination: false,
    isTreeTable: true,
    defaultExpandAllRows: true,
    columns: [
      { title: '菜单名称', dataIndex: 'menuName', width: 220, align: 'left' },
      {
        title: '类型',
        dataIndex: 'menuType',
        width: 90,
        customRender: ({ text }) => ({ M: '目录', C: '菜单', F: '按钮' }[text] || text),
      },
      { title: '路由', dataIndex: 'path', width: 140 },
      { title: '组件', dataIndex: 'component', width: 200 },
      { title: '权限标识', dataIndex: 'permission', width: 180 },
      { title: '图标', dataIndex: 'icon', width: 160 },
      { title: '排序', dataIndex: 'sort', width: 70 },
      {
        title: '可见',
        dataIndex: 'isVisible',
        width: 70,
        customRender: ({ text }) => (text === 1 ? '是' : '否'),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 70,
        customRender: ({ text }) => (text === 1 ? '正常' : '停用'),
      },
    ],
    useSearchForm: false,
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 260,
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      slots: { customRender: 'action' },
    },
  });

  function getActions(record): ActionItem[] {
    const actions: ActionItem[] = [];
    // 目录/菜单可新增下级；按钮不再新增下级
    if (record.menuType !== 'F') {
      actions.push({
        label: '新增下级',
        onClick: () =>
          openModal(true, {
            isUpdate: false,
            parentId: record.id,
            menuType: record.menuType === 'M' ? 'C' : 'F',
          }),
      });
    }
    actions.push(
      { label: '编辑', onClick: () => openModal(true, { record, isUpdate: true }) },
      {
        label: '删除',
        color: 'error',
        popConfirm: { title: '确认删除？存在子节点时无法删除', confirm: () => handleDelete(record) },
      }
    );
    return actions;
  }

  async function handleDelete(record) {
    await novaMenuDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }
</script>
