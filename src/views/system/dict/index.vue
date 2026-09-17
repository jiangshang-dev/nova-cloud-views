<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="openTypeModal(true, { isUpdate: false })">新增</a-button>
        <a-button class="ml-2" @click="handleRefreshCache">刷新缓存</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DictTypeModal @register="registerTypeModal" @success="reload" />
    <DictDataDrawer @register="registerDataDrawer" />
  </div>
</template>

<script lang="ts" setup name="system-dict">
  import { BasicTable, TableAction, useTable, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaDictTypePage, novaDictTypeDelete, novaDictAllItems } from '/@/api/nova/system';
  import { DB_DICT_DATA_KEY } from '/@/enums/cacheEnum';
  import { setAuthCache } from '/@/utils/auth';
  import { useUserStore } from '/@/store/modules/user';
  import DictTypeModal from './NovaDictTypeModal.vue';
  import DictDataDrawer from './NovaDictDataDrawer.vue';

  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const [registerTypeModal, { openModal: openTypeModal }] = useModal();
  const [registerDataDrawer, { openDrawer: openDataDrawer }] = useDrawer();

  const [registerTable, { reload }] = useTable({
    title: '字典管理',
    api: novaDictTypePage,
    rowKey: 'id',
    columns: [
      { title: '字典名称', dataIndex: 'dictName', width: 160 },
      { title: '字典编码', dataIndex: 'dictType', width: 180 },
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
      schemas: [
        { field: 'dictName', label: '字典名称', component: 'Input', colProps: { span: 6 } },
        { field: 'dictType', label: '字典编码', component: 'Input', colProps: { span: 6 } },
      ],
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
    fetchSetting: {
      pageField: 'current',
      sizeField: 'size',
      listField: 'records',
      totalField: 'total',
    },
  });

  function getActions(record): ActionItem[] {
    return [
      { label: '字典配置', onClick: () => openDataDrawer(true, { record }) },
      { label: '编辑', onClick: () => openTypeModal(true, { record, isUpdate: true }) },
      {
        label: '删除',
        color: 'error',
        popConfirm: { title: '确认删除该字典及全部字典项？', confirm: () => handleDelete(record) },
      },
    ];
  }

  async function handleDelete(record) {
    await novaDictTypeDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }

  async function handleRefreshCache() {
    const items = (await novaDictAllItems()) || {};
    setAuthCache(DB_DICT_DATA_KEY, items);
    userStore.setAllDictItems(items);
    createMessage.success('字典缓存已刷新');
  }
</script>
