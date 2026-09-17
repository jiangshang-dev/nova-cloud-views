<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="分配菜单权限" @ok="handleSubmit" width="480px">
    <a-spin :spinning="loading">
      <a-tree
        v-if="treeData.length"
        checkable
        checkStrictly
        defaultExpandAll
        :tree-data="treeData"
        :field-names="{ title: 'menuName', key: 'id', children: 'children' }"
        :checkedKeys="checkedKeys"
        @check="onCheck"
      />
      <a-empty v-else description="暂无菜单" />
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { novaMenuTree, novaRoleMenuIds, novaRoleAssignMenus } from '/@/api/nova/system';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const loading = ref(false);
  const treeData = ref<any[]>([]);
  const checkedKeys = ref<Array<string | number>>([]);
  const roleId = ref<string | number>();

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    roleId.value = data?.record?.id;
    checkedKeys.value = [];
    loading.value = true;
    setModalProps({ confirmLoading: false });
    try {
      treeData.value = (await novaMenuTree()) || [];
      checkedKeys.value = (await novaRoleMenuIds(roleId.value!)) || [];
    } finally {
      loading.value = false;
    }
  });

  function onCheck(keys: any) {
    if (Array.isArray(keys)) {
      checkedKeys.value = keys;
    } else if (keys && Array.isArray(keys.checked)) {
      checkedKeys.value = keys.checked;
    }
  }

  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      await novaRoleAssignMenus(roleId.value!, checkedKeys.value);
      createMessage.success('保存成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
