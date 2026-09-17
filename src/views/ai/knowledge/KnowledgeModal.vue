<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="640px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaAiKnowledgeSave, novaAiModelEnabledList } from '/@/api/nova/ai';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();

  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    labelWidth: 110,
    schemas: [
      {
        field: 'kbCode',
        label: '知识库编码',
        component: 'Input',
        required: true,
        dynamicDisabled: ({ values }) => !!values.id,
      },
      { field: 'kbName', label: '知识库名称', component: 'Input', required: true },
      {
        field: 'embeddingModelId',
        label: '向量模型',
        component: 'Select',
        componentProps: { options: [], optionFilterProp: 'label', allowClear: true },
      },
      { field: 'indexName', label: '索引名', component: 'Input' },
      {
        field: 'chunkSize',
        label: '分片大小',
        component: 'InputNumber',
        defaultValue: 500,
        componentProps: { min: 50 },
      },
      {
        field: 'chunkOverlap',
        label: '重叠长度',
        component: 'InputNumber',
        defaultValue: 50,
        componentProps: { min: 0 },
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

    const models = ((await novaAiModelEnabledList()) || [])
      .filter((m: any) => !m.modelType || m.modelType === 'embedding' || m.modelType === 'chat')
      .map((m: any) => ({
        label: `${m.modelName} (${m.modelCode})`,
        value: m.id,
      }));
    updateSchema({
      field: 'embeddingModelId',
      componentProps: { options: models, optionFilterProp: 'label', allowClear: true },
    });

    if (unref(isUpdate) && data.record) {
      rowId.value = data.record.id;
      await setFieldsValue({ ...data.record });
    } else {
      rowId.value = undefined;
      await setFieldsValue({ status: 1, chunkSize: 500, chunkOverlap: 50, id: undefined });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑知识库' : '新增知识库'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (unref(isUpdate)) {
        values.id = rowId.value;
      }
      await novaAiKnowledgeSave(values);
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
