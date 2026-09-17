<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="680px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaMenuSave, novaMenuTree } from '/@/api/nova/system';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();
  const menuTypeRef = ref('C');

  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'parentId',
        label: '上级菜单',
        component: 'TreeSelect',
        componentProps: {
          treeData: [],
          fieldNames: { label: 'menuName', value: 'id', children: 'children' },
          allowClear: true,
          treeDefaultExpandAll: true,
        },
      },
      {
        field: 'menuType',
        label: '菜单类型',
        component: 'RadioButtonGroup',
        defaultValue: 'C',
        componentProps: {
          options: [
            { label: '目录(一级)', value: 'M' },
            { label: '菜单', value: 'C' },
            { label: '按钮', value: 'F' },
          ],
          onChange: (val) => {
            menuTypeRef.value = val;
          },
        },
      },
      { field: 'menuName', label: '菜单名称', component: 'Input', required: true },
      {
        field: 'path',
        label: '路由地址',
        component: 'Input',
        helpMessage: '目录如 /system；子菜单如 user',
        ifShow: ({ values }) => values.menuType !== 'F',
      },
      {
        field: 'component',
        label: '组件路径',
        component: 'Input',
        helpMessage: '如 system/user/index；目录留空',
        ifShow: ({ values }) => values.menuType === 'C',
      },
      {
        field: 'permission',
        label: '权限标识',
        component: 'Input',
        helpMessage: '如 system:user:add，按钮必填',
        required: ({ values }) => values.menuType === 'F',
      },
      {
        field: 'icon',
        label: '菜单图标',
        component: 'IconPicker',
        ifShow: ({ values }) => values.menuType !== 'F',
        componentProps: {
          allowClear: true,
        },
      },
      { field: 'sort', label: '排序', component: 'InputNumber', defaultValue: 0 },
      {
        field: 'isVisible',
        label: '是否可见',
        component: 'RadioButtonGroup',
        defaultValue: 1,
        ifShow: ({ values }) => values.menuType !== 'F',
        componentProps: {
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
      },
      {
        field: 'status',
        label: '状态',
        component: 'RadioButtonGroup',
        defaultValue: 1,
        componentProps: {
          options: [
            { label: '正常', value: 1 },
            { label: '停用', value: 0 },
          ],
        },
      },
      { field: 'remark', label: '备注', component: 'InputTextArea' },
    ],
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    const tree = (await novaMenuTree()) || [];
    updateSchema({
      field: 'parentId',
      componentProps: {
        treeData: [{ id: 0, menuName: '根目录（一级菜单）', children: tree }],
        fieldNames: { label: 'menuName', value: 'id', children: 'children' },
        allowClear: true,
        treeDefaultExpandAll: true,
      },
    });

    if (unref(isUpdate) && data.record) {
      rowId.value = data.record.id != null ? String(data.record.id) : undefined;
      menuTypeRef.value = data.record.menuType || 'C';
      const { children: _children, ...rest } = data.record;
      await setFieldsValue({ ...rest, id: rowId.value, parentId: rest.parentId != null ? String(rest.parentId) : '0' });
    } else {
      rowId.value = undefined;
      const menuType = data?.menuType || 'C';
      menuTypeRef.value = menuType;
      await setFieldsValue({
        parentId: data?.parentId ?? 0,
        menuType,
        status: 1,
        isVisible: 1,
        sort: 0,
      });
    }
  });

  const getTitle = computed(() => {
    if (unref(isUpdate)) return '编辑菜单';
    const t = menuTypeRef.value;
    if (t === 'M') return '新增目录（一级菜单）';
    if (t === 'F') return '新增按钮权限';
    return '新增菜单';
  });

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (unref(isUpdate)) {
        if (rowId.value == null || rowId.value === '') {
          createMessage.error('菜单ID缺失，请关闭后重试');
          return;
        }
        // 保持字符串，避免大整数精度丢失
        values.id = String(rowId.value);
      }
      if (values.parentId == null || values.parentId === '') {
        values.parentId = 0;
      } else {
        values.parentId = String(values.parentId);
      }
      // 按钮不需要 path/component
      if (values.menuType === 'F') {
        values.path = values.path || '';
        values.component = '';
        values.isVisible = 0;
      }
      if (values.menuType === 'M') {
        values.component = '';
      }
      // 去掉树节点附属字段
      delete values.children;
      await novaMenuSave(values, unref(isUpdate));
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
