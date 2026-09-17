<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增存储</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'default'">
            {{ record.status === 1 ? '已启用' : '已关闭' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <TableAction
            :actions="[
              { label: '编辑', onClick: handleEdit.bind(null, record) },
              { label: '测试', onClick: handleTest.bind(null, record) },
              {
                label: record.status === 1 ? '关闭' : '启用',
                color: record.status === 1 ? 'error' : 'success',
                popConfirm: {
                  title: record.status === 1 ? '确认关闭该存储？' : '启用后将自动关闭其它存储，确认？',
                  confirm: handleToggle.bind(null, record),
                },
              },
              {
                label: '删除',
                color: 'error',
                ifShow: record.status !== 1,
                popConfirm: { title: '确认删除？', confirm: handleDelete.bind(null, record) },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>

    <BasicModal
      v-bind="$attrs"
      @register="registerModal"
      :title="isUpdate ? '编辑存储' : '新增存储'"
      @ok="handleSubmit"
      width="720px"
    >
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup name="file-storage">
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    listStorage,
    createStorage,
    updateStorage,
    deleteStorage,
    enableStorage,
    disableStorage,
    testStorage,
    type FileStorage,
  } from '/@/api/nova/file';
  import { columns, formSchemas } from './storage.data';

  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const currentId = ref<number>();

  const [registerTable, { reload }] = useTable({
    api: listStorage,
    columns,
    rowKey: 'id',
    pagination: false,
    useSearchForm: false,
    showTableSetting: true,
    bordered: true,
    actionColumn: { width: 220, title: '操作', dataIndex: 'action', key: 'action' },
  });

  const [registerModal, { openModal, closeModal }] = useModal();
  const [registerForm, { validate, resetFields, setFieldsValue }] = useForm({
    labelWidth: 110,
    schemas: formSchemas,
    showActionButtonGroup: false,
  });

  function handleCreate() {
    isUpdate.value = false;
    currentId.value = undefined;
    openModal(true, {});
    setTimeout(() => {
      resetFields();
      setFieldsValue({ storageType: 'local', status: 0 });
    }, 0);
  }

  function handleEdit(record: FileStorage) {
    isUpdate.value = true;
    currentId.value = record.id;
    openModal(true, {});
    setTimeout(() => {
      resetFields();
      setFieldsValue({ ...record, secretKey: '******' });
    }, 0);
  }

  async function handleSubmit() {
    const values = await validate();
    if (isUpdate.value && currentId.value) {
      await updateStorage(currentId.value, values);
      createMessage.success('更新成功');
    } else {
      await createStorage(values);
      createMessage.success('创建成功');
    }
    closeModal();
    reload();
  }

  async function handleToggle(record: FileStorage) {
    if (record.status === 1) {
      await disableStorage(record.id!);
      createMessage.success('已关闭');
    } else {
      await enableStorage(record.id!);
      createMessage.success('已启用（其它存储已关闭）');
    }
    reload();
  }

  async function handleTest(record: FileStorage) {
    await testStorage(record.id!);
    createMessage.success('连通性正常');
  }

  async function handleDelete(record: FileStorage) {
    await deleteStorage(record.id!);
    createMessage.success('已删除');
    reload();
  }
</script>
