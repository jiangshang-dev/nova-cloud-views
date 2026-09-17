<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="720px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaAiAgentSave, novaAiModelEnabledList } from '/@/api/nova/ai';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();

  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'agentCode',
        label: 'Agent 编码',
        component: 'Input',
        required: true,
        dynamicDisabled: ({ values }) => !!values.id,
      },
      { field: 'agentName', label: 'Agent 名称', component: 'Input', required: true },
      {
        field: 'modelId',
        label: '绑定模型',
        component: 'Select',
        required: true,
        componentProps: { options: [], optionFilterProp: 'label' },
      },
      {
        field: 'sysPrompt',
        label: '系统提示词',
        component: 'InputTextArea',
        componentProps: { rows: 4 },
      },
      { field: 'workspacePath', label: '工作区路径', component: 'Input' },
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

    const models = ((await novaAiModelEnabledList()) || []).map((m: any) => ({
      label: `${m.modelName} (${m.modelCode})`,
      value: m.id,
    }));
    updateSchema({
      field: 'modelId',
      componentProps: { options: models, optionFilterProp: 'label' },
    });

    if (unref(isUpdate) && data.record) {
      rowId.value = data.record.id;
      await setFieldsValue({ ...data.record });
    } else {
      rowId.value = undefined;
      await setFieldsValue({ status: 1, id: undefined });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑 Agent' : '新增 Agent'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (unref(isUpdate)) {
        values.id = rowId.value;
      }
      await novaAiAgentSave(values);
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
