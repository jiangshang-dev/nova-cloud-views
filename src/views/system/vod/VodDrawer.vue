<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="getTitle"
    :width="640"
    :showFooter="false"
    destroyOnClose
  >
    <VodUpload @success="handleUploadSuccess" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import VodUpload from './components/VodUpload.vue';

  const emit = defineEmits(['success', 'register']);

  const [registerDrawer, { closeDrawer }] = useDrawerInner(async () => {});

  const getTitle = computed(() => '上传视频');

  function handleUploadSuccess() {
    emit('success');
    closeDrawer();
  }
</script>
