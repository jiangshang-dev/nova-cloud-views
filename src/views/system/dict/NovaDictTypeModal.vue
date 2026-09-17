<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="560px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaDictTypeSave } from '/@/api/nova/system';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();

  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 90,
    schemas: [
      { field: 'dictName', label: '字典名称', component: 'Input', required: true },
      {
        field: 'dictType',
        label: '字典编码',
        component: 'Input',
        required: true,
        dynamicDisabled: () => unref(isUpdate),
        helpMessage: '唯一编码，如 sys_user_sex',
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
    if (unref(isUpdate) && data.record) {
      rowId.value = String(data.record.id);
      await setFieldsValue({ ...data.record, id: rowId.value });
    } else {
      rowId.value = undefined;
      await setFieldsValue({ status: 1 });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑字典' : '新增字典'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (unref(isUpdate)) {
        values.id = String(rowId.value);
      }
      await novaDictTypeSave(values, unref(isUpdate));
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
