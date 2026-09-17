<template>
  <div class="nova-upload">
    <a-upload :before-upload="beforeUpload" :show-upload-list="false" :multiple="multiple" :disabled="uploading">
      <a-button type="primary" :loading="uploading" preIcon="ant-design:cloud-upload-outlined">
        {{ uploading ? '上传中…' : buttonText }}
      </a-button>
    </a-upload>
    <div v-if="uploading || percent > 0" class="nova-upload__progress">
      <a-progress :percent="percent" size="small" />
      <span class="nova-upload__status">{{ statusText }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { chunkUpload } from './chunkUpload';
  import type { FileInfo } from '/@/api/nova/file';

  const props = withDefaults(
    defineProps<{
      buttonText?: string;
      multiple?: boolean;
      bizType?: string;
      bizId?: string;
      chunkSize?: number;
    }>(),
    {
      buttonText: '分块上传',
      multiple: false,
      chunkSize: 5 * 1024 * 1024,
    }
  );

  const emit = defineEmits<{
    (e: 'success', file: FileInfo): void;
    (e: 'error', err: Error): void;
  }>();

  const { createMessage } = useMessage();
  const uploading = ref(false);
  const percent = ref(0);
  const statusText = ref('');

  async function beforeUpload(file: File) {
    uploading.value = true;
    percent.value = 0;
    statusText.value = '';
    try {
      const info = await chunkUpload({
        file,
        chunkSize: props.chunkSize,
        bizType: props.bizType,
        bizId: props.bizId,
        onProgress: (p) => {
          percent.value = p;
        },
        onStatus: (t) => {
          statusText.value = t;
        },
      });
      createMessage.success('上传成功');
      emit('success', info);
    } catch (e: any) {
      createMessage.error(e?.message || '上传失败');
      emit('error', e);
    } finally {
      uploading.value = false;
    }
    return false;
  }
</script>

<style scoped>
  .nova-upload__progress {
    margin-top: 8px;
    max-width: 360px;
  }
  .nova-upload__status {
    color: #666;
    font-size: 12px;
  }
</style>
