<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="520px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaDictDataSave } from '/@/api/nova/system';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();
  const dictType = ref('');

  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 90,
    schemas: [
      { field: 'dictLabel', label: '字典标签', component: 'Input', required: true },
      { field: 'dictValue', label: '字典键值', component: 'Input', required: true },
      { field: 'sort', label: '排序', component: 'InputNumber', defaultValue: 0 },
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
    dictType.value = data?.dictType || data?.record?.dictType || '';
    if (unref(isUpdate) && data.record) {
      rowId.value = String(data.record.id);
      await setFieldsValue({ ...data.record });
    } else {
      rowId.value = undefined;
      await setFieldsValue({ status: 1, sort: 0 });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑字典项' : '新增字典项'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      values.dictType = dictType.value;
      if (unref(isUpdate)) {
        values.id = String(rowId.value);
      }
      await novaDictDataSave(values, unref(isUpdate));
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
