<template>
  <div class="video-upload-container">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleUpload">上传视频</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>

    <a-modal
      v-model:open="showVideoDialog"
      :title="currentVideo?.title"
      width="80%"
      @cancel="handleCloseVideoDialog"
      :footer="null"
    >
      <div class="video-player-container" v-if="currentVideo">
        <VideoPlayer
          :video-src="currentVideo.playUrl"
          :poster="currentVideo.coverUrl"
          :video-title="currentVideo.title"
          :view-count="currentVideo.viewCount || 0"
          :publish-date="currentVideo.createTime"
          :video-description="currentVideo.description || '暂无视频描述'"
        />
      </div>
    </a-modal>

    <VodDrawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="system-vod" setup>
import { ref, reactive, onMounted } from 'vue';
import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
import { useDrawer } from '/@/components/Drawer';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './vod.data';
import { getVideoList, deleteVideo, getPlayInfo } from './vod.api';
import { VideoPlayer } from '/@/components/Vod';
import VodDrawer from './VodDrawer.vue';

const { createMessage } = useMessage();

const showVideoDialog = ref(false);
const currentVideo = ref<any>(null);

const { tableContext } = useListPage({
  designScope: 'video-list',
  tableProps: {
    title: '视频列表',
    api: getVideoList,
    columns: columns,
    canResize: true,
    size: 'small',
    formConfig: {
      schemas: searchFormSchema,
    },
    beforeFetch: (params) => {
      return Object.assign({ page: params.page || 1, limit: params.pageSize || 10 }, params);
    },
    fetchSetting: {
      listField: 'list',
      totalField: 'total',
    },
  },
});

const [registerTable, { reload, updateTableDataRecord }] = tableContext;

// 注册抽屉
const [registerDrawer, { openDrawer }] = useDrawer();

const handleUpload = () => {
  openDrawer(true, {
    isUpdate: false,
    showFooter: false,
  });
};

const handleSuccess = () => {
  reload();
};

const getTableAction = (record): ActionItem[] => [
  {
    label: '播放',
    onClick: async () => {
      await playVideo(record);
    },
  },
  {
    label: '删除',
    color: 'error',
    popConfirm: {
      title: '确定删除该视频吗？',
      confirm: () => handleDelete(record),
    },
  },
];

const playVideo = async (video) => {
  try {
    const res = await getPlayInfo(video.videoId);
    if (res.success && res.result) {
      showVideoDialog.value = true;
      currentVideo.value = {
        ...video,
        playUrl: res.result.playUrl,
        coverUrl: res.result.coverUrl || res.result.cover,
      };
    } else {
      createMessage.error('获取播放信息失败');
    }
  } catch (error) {
    console.error('获取播放信息失败:', error);
    createMessage.error('获取播放信息失败');
  }
};

const handleDelete = async (record) => {
  await deleteVideo(record.id, () => {
    // createMessage.success('删除成功');
    reload();
  });
};

const handleCloseVideoDialog = () => {
  showVideoDialog.value = false;
  currentVideo.value = null;
};
</script>

<style scoped>
.video-upload-container {
  padding: 20px;
}

.video-player-container {
  text-align: center;
}
</style>
