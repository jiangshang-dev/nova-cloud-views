<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="640px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaAiModelSave, novaAiProviderList } from '/@/api/nova/ai';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();

  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    labelWidth: 110,
    schemas: [
      {
        field: 'providerId',
        label: '提供商',
        component: 'Select',
        required: true,
        componentProps: { options: [], optionFilterProp: 'label' },
      },
      {
        field: 'modelCode',
        label: '模型编码',
        component: 'Input',
        required: true,
        dynamicDisabled: ({ values }) => !!values.id,
        helpMessage: '如 qwen-plus / gpt-4o',
      },
      { field: 'modelName', label: '模型名称', component: 'Input', required: true },
      {
        field: 'modelType',
        label: '模型类型',
        component: 'Select',
        defaultValue: 'chat',
        componentProps: {
          options: [
            { label: '对话', value: 'chat' },
            { label: 'Embedding', value: 'embedding' },
            { label: '多模态', value: 'multimodal' },
            { label: '重排序', value: 'rerank' },
          ],
        },
      },
      { field: 'contextWindow', label: '上下文窗口', component: 'InputNumber', componentProps: { min: 0 } },
      { field: 'maxTokens', label: 'Max Tokens', component: 'InputNumber', componentProps: { min: 0 } },
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

    const providers = ((await novaAiProviderList()) || []).map((p: any) => ({
      label: `${p.providerName} (${p.providerCode})`,
      value: p.id,
    }));
    updateSchema({
      field: 'providerId',
      componentProps: { options: providers, optionFilterProp: 'label' },
    });

    if (unref(isUpdate) && data.record) {
      rowId.value = data.record.id;
      await setFieldsValue({ ...data.record });
    } else {
      rowId.value = undefined;
      await setFieldsValue({ status: 1, modelType: 'chat', id: undefined });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑模型' : '新增模型'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (unref(isUpdate)) {
        values.id = rowId.value;
      }
      await novaAiModelSave(values);
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
