<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="`字典配置 - ${dictType}`"
    width="720px"
    :showFooter="false"
    destroyOnClose
  >
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="openModal(true, { isUpdate: false, dictType })">新增</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            { label: '编辑', onClick: () => openModal(true, { record, isUpdate: true, dictType }) },
            {
              label: '删除',
              color: 'error',
              popConfirm: { title: '确认删除？', confirm: () => handleDelete(record) },
            },
          ]"
        />
      </template>
    </BasicTable>
    <DictDataModal @register="registerModal" @success="reload" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { novaDictDataPage, novaDictDataDelete } from '/@/api/nova/system';
  import DictDataModal from './NovaDictDataModal.vue';

  const { createMessage } = useMessage();
  const dictType = ref('');
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload, setProps }] = useTable({
    api: (params) => novaDictDataPage({ ...params, dictType: dictType.value }),
    rowKey: 'id',
    immediate: false,
    columns: [
      { title: '标签', dataIndex: 'dictLabel', width: 140 },
      { title: '键值', dataIndex: 'dictValue', width: 120 },
      { title: '排序', dataIndex: 'sort', width: 80 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        customRender: ({ text }) => (text === 1 ? '正常' : '停用'),
      },
      { title: '备注', dataIndex: 'remark' },
    ],
    useSearchForm: false,
    showTableSetting: false,
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

  const [registerDrawer] = useDrawerInner(async (data) => {
    dictType.value = data?.record?.dictType || '';
    setProps({
      api: (params) => novaDictDataPage({ ...params, dictType: dictType.value }),
    });
    reload();
  });

  async function handleDelete(record) {
    await novaDictDataDelete(record.id);
    createMessage.success('删除成功');
    reload();
  }
</script>
