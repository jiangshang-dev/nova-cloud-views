<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <NovaChunkUpload biz-type="file" @success="reload" />
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'accessUrl'">
          <a v-if="record.accessUrl" :href="record.accessUrl" target="_blank" rel="noreferrer">打开</a>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                label: '删除',
                color: 'error',
                popConfirm: { title: '确认删除该文件？', confirm: handleDelete.bind(null, record) },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" setup name="file-list">
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { NovaChunkUpload } from '/@/components/NovaUpload';
  import { pageFileInfo, deleteFileInfo, type FileInfo } from '/@/api/nova/file';
  import { columns, searchFormSchema } from './list.data';

  const { createMessage } = useMessage();

  const [registerTable, { reload }] = useTable({
    api: pageFileInfo,
    columns,
    formConfig: { labelWidth: 80, schemas: searchFormSchema },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    fetchSetting: {
      pageField: 'pageNo',
      sizeField: 'pageSize',
      listField: 'records',
      totalField: 'total',
    },
    actionColumn: { width: 100, title: '操作', dataIndex: 'action', key: 'action' },
  });

  async function handleDelete(record: FileInfo) {
    await deleteFileInfo(record.id);
    createMessage.success('已删除');
    reload();
  }
</script>
