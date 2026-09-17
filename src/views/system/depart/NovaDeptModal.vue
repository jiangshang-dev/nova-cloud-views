<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="560px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaDeptSave, novaDeptTree } from '/@/api/nova/system';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();

  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    labelWidth: 90,
    schemas: [
      {
        field: 'parentId',
        label: '上级部门',
        component: 'TreeSelect',
        componentProps: {
          treeData: [],
          fieldNames: { label: 'deptName', value: 'id', children: 'children' },
          allowClear: true,
          treeDefaultExpandAll: true,
        },
      },
      { field: 'deptName', label: '部门名称', component: 'Input', required: true },
      { field: 'deptCode', label: '部门编码', component: 'Input' },
      { field: 'sort', label: '排序', component: 'InputNumber', defaultValue: 0 },
      { field: 'phone', label: '电话', component: 'Input' },
      { field: 'email', label: '邮箱', component: 'Input' },
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

    const tree = (await novaDeptTree()) || [];
    updateSchema({
      field: 'parentId',
      componentProps: {
        treeData: [{ id: 0, deptName: '根部门', children: tree }],
        fieldNames: { label: 'deptName', value: 'id', children: 'children' },
        allowClear: true,
        treeDefaultExpandAll: true,
      },
    });

    if (unref(isUpdate) && data.record) {
      rowId.value = String(data.record.id);
      const { children: _c, ...rest } = data.record;
      await setFieldsValue({
        ...rest,
        id: rowId.value,
        parentId: rest.parentId != null ? String(rest.parentId) : '0',
      });
    } else {
      rowId.value = undefined;
      await setFieldsValue({
        parentId: data?.parentId != null ? String(data.parentId) : '0',
        status: 1,
        sort: 0,
      });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑部门' : '新增部门'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (unref(isUpdate)) {
        values.id = String(rowId.value);
      }
      if (values.parentId == null || values.parentId === '') {
        values.parentId = 0;
      } else {
        values.parentId = String(values.parentId);
      }
      delete values.children;
      await novaDeptSave(values, unref(isUpdate));
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
