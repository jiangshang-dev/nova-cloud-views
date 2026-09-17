<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="`角色授权 - ${roleName}`"
    @ok="handleSubmit"
    width="520px"
    :minHeight="420"
  >
    <a-spin :spinning="loading">
      <div class="mb-2 text-gray-500">勾选目录 / 菜单 / 按钮权限后保存</div>
      <a-tree
        v-if="treeData.length"
        checkable
        checkStrictly
        defaultExpandAll
        :tree-data="treeData"
        :field-names="{ title: 'title', key: 'id', children: 'children' }"
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
  const roleName = ref('');

  const TYPE_LABEL = { M: '目录', C: '菜单', F: '按钮' };

  function mapTree(nodes: any[] = []): any[] {
    return nodes.map((n) => ({
      id: n.id,
      title: `${n.menuName}${n.menuType ? `（${TYPE_LABEL[n.menuType] || n.menuType}）` : ''}${
        n.permission ? ` [${n.permission}]` : ''
      }`,
      children: n.children?.length ? mapTree(n.children) : undefined,
    }));
  }

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    roleId.value = data?.record?.id;
    roleName.value = data?.record?.roleName || '';
    checkedKeys.value = [];
    loading.value = true;
    setModalProps({ confirmLoading: false });
    try {
      const tree = (await novaMenuTree()) || [];
      treeData.value = mapTree(tree);
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
      createMessage.success('授权成功');
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
