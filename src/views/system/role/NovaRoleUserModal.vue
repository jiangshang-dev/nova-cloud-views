<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="`角色用户 - ${roleName}`"
    @ok="handleSubmit"
    width="720px"
    :minHeight="420"
  >
    <a-spin :spinning="loading">
      <a-transfer
        :data-source="userOptions"
        :titles="['未分配用户', '已分配用户']"
        :target-keys="targetKeys"
        :render="(item) => item.title"
        :list-style="{ width: '300px', height: '360px' }"
        show-search
        @change="onChange"
      />
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { novaUserList, novaRoleUserIds, novaRoleAssignUsers } from '/@/api/nova/system';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const loading = ref(false);
  const roleId = ref<string | number>();
  const roleName = ref('');
  const userOptions = ref<any[]>([]);
  const targetKeys = ref<string[]>([]);

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    roleId.value = data?.record?.id;
    roleName.value = data?.record?.roleName || '';
    targetKeys.value = [];
    loading.value = true;
    setModalProps({ confirmLoading: false });
    try {
      const users = (await novaUserList()) || [];
      userOptions.value = users.map((u: any) => ({
        key: String(u.id),
        title: `${u.username}${u.realName ? `（${u.realName}）` : ''}`,
      }));
      const ids = (await novaRoleUserIds(roleId.value!)) || [];
      targetKeys.value = ids.map((id) => String(id));
    } finally {
      loading.value = false;
    }
  });

  function onChange(nextTargetKeys: string[]) {
    targetKeys.value = nextTargetKeys;
  }

  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      await novaRoleAssignUsers(
        roleId.value!,
        targetKeys.value.map((k) => Number(k) || k)
      );
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
