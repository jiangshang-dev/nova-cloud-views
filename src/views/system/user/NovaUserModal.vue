<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="560px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { novaUserSave, novaUserRoleIds, novaUserAssignRoles, novaRoleList } from '/@/api/nova/system';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(false);
  const rowId = ref<string | number>();

  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    labelWidth: 90,
    schemas: [
      { field: 'username', label: '账号', component: 'Input', required: true, dynamicDisabled: ({ values }) => !!values.id },
      {
        field: 'password',
        label: '密码',
        component: 'InputPassword',
        ifShow: ({ values }) => !values.id,
        helpMessage: '不填默认 admin123',
      },
      { field: 'nickname', label: '昵称', component: 'Input' },
      { field: 'realName', label: '姓名', component: 'Input' },
      { field: 'phone', label: '手机', component: 'Input' },
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
      {
        field: 'roleIds',
        label: '角色',
        component: 'Select',
        componentProps: {
          mode: 'multiple',
          options: [],
          optionFilterProp: 'label',
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

    const roles = ((await novaRoleList()) || []).map((r: any) => ({
      label: r.roleName,
      value: r.id,
    }));
    updateSchema({
      field: 'roleIds',
      componentProps: { mode: 'multiple', options: roles, optionFilterProp: 'label' },
    });

    if (unref(isUpdate) && data.record) {
      rowId.value = data.record.id;
      const roleIds = (await novaUserRoleIds(data.record.id)) || [];
      await setFieldsValue({ ...data.record, id: data.record.id, roleIds, password: undefined });
    } else {
      rowId.value = undefined;
      await setFieldsValue({ status: 1, id: undefined });
    }
  });

  const getTitle = computed(() => (unref(isUpdate) ? '编辑用户' : '新增用户'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      const { roleIds, id: _id, ...user } = values;
      let userId = rowId.value;
      if (unref(isUpdate)) {
        user.id = userId;
        await novaUserSave(user, true);
      } else {
        userId = await novaUserSave(user, false);
      }
      if (userId != null && Array.isArray(roleIds)) {
        await novaUserAssignRoles(userId, roleIds);
      }
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
