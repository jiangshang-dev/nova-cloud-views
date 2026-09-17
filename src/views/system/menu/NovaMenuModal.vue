<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="640px">
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
      { field: 'menuName', label: '菜单名称', component: 'Input', required: true },
      {
        field: 'menuType',
        label: '菜单类型',
        component: 'RadioButtonGroup',
        defaultValue: 'C',
        componentProps: {
          options: [
            { label: '目录', value: 'M' },
            { label: '菜单', value: 'C' },
            { label: '按钮', value: 'F' },
          ],
        },
      },
      { field: 'path', label: '路由地址', component: 'Input' },
      { field: 'component', label: '组件路径', component: 'Input', helpMessage: '如 system/user/index' },
      { field: 'permission', label: '权限标识', component: 'Input' },
      { field: 'icon', label: '图标', component: 'Input', helpMessage: '如 ant-design:user-outlined' },
      { field: 'sort', label: '排序', component: 'InputNumber', defaultValue: 0 },
      {
        field: 'isVisible',
        label: '是否可见',
        component: 'RadioButtonGroup',
        defaultValue: 1,
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
        treeData: [{ id: 0, menuName: '根目录', children: tree }],
        fieldNames: { label: 'menuName', value: 'id', children: 'children' },
        allowClear: true,
        treeDefaultExpandAll: true,
      },
    });

    if (unref(isUpdate) && data.record) {
      rowId.value = data.record.id;
      await setFieldsValue({ ...data.record });
    } else {
      rowId.value = undefined;
      await setFieldsValue({
        parentId: data?.parentId ?? 0,
        menuType: 'C',
        status: 1,
        isVisible: 1,
        sort: 0,
      });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑菜单' : '新增菜单'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (unref(isUpdate)) {
        values.id = rowId.value;
      }
      if (values.parentId == null) {
        values.parentId = 0;
      }
      await novaMenuSave(values, unref(isUpdate));
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
