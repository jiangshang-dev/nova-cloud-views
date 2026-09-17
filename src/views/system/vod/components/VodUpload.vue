<template>
  <VodUploadPanel @success="handleSuccess" />
</template>

<script lang="ts" setup>
  import { VodUploadPanel } from '/@/components/Vod';
  import type { VodUploadSuccessPayload } from '/@/components/Vod';

  const emit = defineEmits<{
    (e: 'success', payload?: VodUploadSuccessPayload): void;
  }>();

  function handleSuccess(payload: VodUploadSuccessPayload) {
    emit('success', payload);
  }
</script>
