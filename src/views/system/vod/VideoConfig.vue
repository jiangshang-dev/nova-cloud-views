<template>
  <div class="video-config-container">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="aliyun" tab="阿里云VOD配置">
        <a-form
          ref="aliyunFormRef"
          :model="aliyunConfig"
          :rules="aliyunRules"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-form-item label="AccessKey ID" name="accessKeyId">
            <a-input v-model:value="aliyunConfig.accessKeyId" placeholder="请输入阿里云AccessKey ID" />
          </a-form-item>
          <a-form-item label="AccessKey Secret" name="accessKeySecret">
            <a-input-password v-model:value="aliyunConfig.accessKeySecret" placeholder="请输入阿里云AccessKey Secret" />
          </a-form-item>
          <a-form-item label="区域ID" name="regionId">
            <a-input v-model:value="aliyunConfig.regionId" placeholder="请输入区域ID，如：cn-shanghai" />
          </a-form-item>
          <a-form-item label="接入点" name="endpoint">
            <a-input v-model:value="aliyunConfig.endpoint" placeholder="请输入接入点，如：vod.cn-shanghai.aliyuncs.com" />
          </a-form-item>
          <a-form-item label="是否启用" name="enable">
            <a-switch v-model:checked="aliyunConfig.enable" checked-children="启用" un-checked-children="禁用" />
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
            <a-space>
              <a-button type="primary" @click="handleSaveAliyun">保存配置</a-button>
              <a-button @click="loadAliyunConfig">刷新</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="video" tab="视频业务配置">
        <a-form
          ref="videoFormRef"
          :model="videoConfig"
          :rules="videoRules"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-form-item label="最大并发上传数" name="maxConcurrentUploads">
            <a-input-number v-model:value="videoConfig.maxConcurrentUploads" :min="1" :max="1000" />
          </a-form-item>
          <a-form-item label="默认转码模板" name="defaultTranscodeTemplate">
            <a-input v-model:value="videoConfig.defaultTranscodeTemplate" placeholder="请输入默认转码模板" />
          </a-form-item>
          <a-form-item label="默认水印配置" name="defaultWatermarkConfig">
            <a-textarea v-model:value="videoConfig.defaultWatermarkConfig" placeholder="请输入默认水印配置" :rows="3" />
          </a-form-item>
          <a-form-item label="存储位置" name="storageLocation">
            <a-input v-model:value="videoConfig.storageLocation" placeholder="请输入存储位置" />
          </a-form-item>
          <a-form-item label="是否启用" name="enable">
            <a-switch v-model:checked="videoConfig.enable" checked-children="启用" un-checked-children="禁用" />
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
            <a-space>
              <a-button type="primary" @click="handleSaveVideo">保存配置</a-button>
              <a-button @click="loadVideoConfig">刷新</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <div class="test-section">
      <a-card title="功能测试" style="margin-top: 20px">
        <a-space>
          <a-button type="primary" @click="goToUploadTest">上传功能测试</a-button>
          <a-button type="primary" @click="goToVideoUpload">视频上传页面</a-button>
        </a-space>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from '/@/hooks/web/useMessage';
import { getAliyunConfig, saveAliyunConfig, getVideoConfig, saveVideoConfig } from './vod.api';

const router = useRouter();
const { createMessage } = useMessage();

const activeKey = ref('aliyun');
const aliyunFormRef = ref();
const videoFormRef = ref();

const aliyunConfig = reactive({
  id: null,
  accessKeyId: '',
  accessKeySecret: '',
  regionId: 'cn-shanghai',
  endpoint: 'vod.cn-shanghai.aliyuncs.com',
  enable: true,
});

const videoConfig = reactive({
  id: null,
  maxConcurrentUploads: 100,
  defaultTranscodeTemplate: '',
  defaultWatermarkConfig: '',
  storageLocation: '',
  enable: true,
});

const aliyunRules = {
  accessKeyId: [{ required: true, message: '请输入AccessKey ID', trigger: 'blur' }],
  accessKeySecret: [{ required: true, message: '请输入AccessKey Secret', trigger: 'blur' }],
  regionId: [{ required: true, message: '请输入区域ID', trigger: 'blur' }],
  endpoint: [{ required: true, message: '请输入接入点', trigger: 'blur' }],
};

const videoRules = {
  maxConcurrentUploads: [{ required: true, message: '请输入最大并发上传数', trigger: 'blur' }],
};

const goToUploadTest = () => {
  router.push('/vod/upload-test');
};

const goToVideoUpload = () => {
  router.push('/vod/video-upload');
};

const loadAliyunConfig = async () => {
  const res = await getAliyunConfig();
  Object.assign(aliyunConfig, res);
};

const loadVideoConfig = async () => {
  const res = await getVideoConfig();
  Object.assign(videoConfig, res);
};

const handleSaveAliyun = async () => {
  try {
    await aliyunFormRef.value.validate();
    const res = await saveAliyunConfig(aliyunConfig);
    Object.assign(aliyunConfig, res);
    createMessage.success('保存成功');
    await loadAliyunConfig();
  } catch (error) {
    console.error('保存失败:', error);
  }
};

const handleSaveVideo = async () => {
  try {
    await videoFormRef.value.validate();
    const res = await saveVideoConfig(videoConfig);
    Object.assign(videoConfig, res);
    createMessage.success('保存成功');
    await loadVideoConfig();
  } catch (error) {
    console.error('保存失败:', error);
  }
};

onMounted(() => {
  loadAliyunConfig();
  loadVideoConfig();
});
</script>

<style scoped>
.video-config-container {
  padding: 20px;
}

.test-section {
  margin-top: 20px;
}
</style>
