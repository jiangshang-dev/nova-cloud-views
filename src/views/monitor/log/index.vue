<template>
  <div class="p-4">
    <a-tabs v-model:activeKey="activeKey" @change="onTabChange">
      <a-tab-pane key="oper" tab="操作日志" />
      <a-tab-pane key="login" tab="登录日志" />
    </a-tabs>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button danger @click="handleClear">清空</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '删除',
              color: 'error',
              popConfirm: { title: '确认删除？', confirm: () => handleDelete(record) },
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" setup name="monitor-log">
  import { ref, onMounted, nextTick } from 'vue';
  import { useRoute } from 'vue-router';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    novaOperLogPage,
    novaOperLogDelete,
    novaOperLogClear,
    novaLoginLogPage,
    novaLoginLogDelete,
    novaLoginLogClear,
  } from '/@/api/nova/system';

  const { createMessage, createConfirm } = useMessage();
  const route = useRoute();
  const activeKey = ref<'oper' | 'login'>('oper');

  const operColumns = [
    { title: '模块', dataIndex: 'title', width: 140 },
    { title: '操作人', dataIndex: 'operName', width: 100 },
    { title: '请求方式', dataIndex: 'requestMethod', width: 90 },
    { title: '请求地址', dataIndex: 'operUrl', width: 200 },
    { title: 'IP', dataIndex: 'operIp', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      customRender: ({ text }) => (text === 1 || text === 0 ? (text === 1 ? '成功' : '失败') : text),
    },
    { title: '耗时(ms)', dataIndex: 'costTime', width: 90 },
    { title: '操作时间', dataIndex: 'operTime', width: 180 },
  ];

  const loginColumns = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: 'IP', dataIndex: 'ip', width: 130 },
    { title: '地点', dataIndex: 'location', width: 140 },
    { title: '浏览器', dataIndex: 'browser', width: 120 },
    { title: '系统', dataIndex: 'os', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      customRender: ({ text }) => (text === 1 ? '成功' : '失败'),
    },
    { title: '消息', dataIndex: 'msg', width: 160 },
    { title: '登录时间', dataIndex: 'loginTime', width: 180 },
  ];

  const [registerTable, { reload, setProps }] = useTable({
    title: '日志',
    api: (params) => (activeKey.value === 'oper' ? novaOperLogPage(params) : novaLoginLogPage(params)),
    rowKey: 'id',
    canResize: true,
    showIndexColumn: true,
    columns: operColumns,
    formConfig: {
      schemas: [
        { field: 'operName', label: '操作人', component: 'Input', colProps: { span: 6 }, ifShow: () => activeKey.value === 'oper' },
        { field: 'title', label: '模块', component: 'Input', colProps: { span: 6 }, ifShow: () => activeKey.value === 'oper' },
        { field: 'username', label: '用户名', component: 'Input', colProps: { span: 6 }, ifShow: () => activeKey.value === 'login' },
      ],
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    actionColumn: {
      width: 100,
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

  function resolveDefaultTab() {
    const path = route.path || '';
    const name = String(route.name || '');
    if (path.includes('loginlog') || name.includes('loginlog')) {
      return 'login';
    }
    return 'oper';
  }

  async function onTabChange(key: string) {
    activeKey.value = key as 'oper' | 'login';
    setProps({
      columns: key === 'oper' ? operColumns : loginColumns,
      api: (params) => (key === 'oper' ? novaOperLogPage(params) : novaLoginLogPage(params)),
    });
    await nextTick();
    reload();
  }

  async function handleDelete(record) {
    if (activeKey.value === 'oper') {
      await novaOperLogDelete(record.id);
    } else {
      await novaLoginLogDelete(record.id);
    }
    createMessage.success('删除成功');
    reload();
  }

  function handleClear() {
    createConfirm({
      iconType: 'warning',
      title: '清空日志',
      content: `确认清空全部${activeKey.value === 'oper' ? '操作' : '登录'}日志？`,
      onOk: async () => {
        if (activeKey.value === 'oper') {
          await novaOperLogClear();
        } else {
          await novaLoginLogClear();
        }
        createMessage.success('已清空');
        reload();
      },
    });
  }

  onMounted(async () => {
    const tab = resolveDefaultTab();
    if (tab !== activeKey.value) {
      await onTabChange(tab);
    }
  });
</script>
