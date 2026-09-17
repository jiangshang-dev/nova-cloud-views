<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="720px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaAiWorkflowSave } from '/@/api/nova/ai';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();

  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'workflowCode',
        label: '工作流编码',
        component: 'Input',
        required: true,
        dynamicDisabled: ({ values }) => !!values.id,
      },
      { field: 'workflowName', label: '工作流名称', component: 'Input', required: true },
      {
        field: 'version',
        label: '版本号',
        component: 'InputNumber',
        defaultValue: 1,
        componentProps: { min: 1 },
      },
      {
        field: 'status',
        label: '状态',
        component: 'RadioButtonGroup',
        defaultValue: 0,
        componentProps: {
          options: [
            { label: '草稿', value: 0 },
            { label: '已发布', value: 1 },
            { label: '停用', value: 2 },
          ],
        },
      },
      {
        field: 'graphJson',
        label: '画布 JSON',
        component: 'InputTextArea',
        componentProps: { rows: 8, placeholder: '可选，工作流画布定义 JSON' },
      },
      { field: 'remark', label: '备注', component: 'InputTextArea' },
    ],
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate) && data.record) {
      rowId.value = data.record.id;
      await setFieldsValue({ ...data.record });
    } else {
      rowId.value = undefined;
      await setFieldsValue({ status: 0, version: 1, id: undefined });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑工作流' : '新增工作流'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (unref(isUpdate)) {
        values.id = rowId.value;
      }
      await novaAiWorkflowSave(values);
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
