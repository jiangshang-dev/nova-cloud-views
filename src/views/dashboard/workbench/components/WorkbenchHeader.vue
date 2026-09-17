<template>
  <div class="lg:flex">
    <Avatar :src="userinfo.avatar || headerImg" :size="72" class="!mx-auto !block" />
    <div class="md:ml-6 flex flex-col justify-center md:mt-0 mt-2">
      <h1 class="md:text-lg text-md">{{ greeting }}, {{ userinfo.realname || '管理员' }}，开始您一天的工作吧！</h1>
      <span class="text-secondary">Nova Cloud · 微服务管理后台</span>
    </div>
    <div class="flex flex-1 justify-end md:mt-0 mt-4">
      <div class="flex flex-col justify-center text-right">
        <span class="text-secondary">待办</span>
        <span class="text-2xl">{{ stats.todoTotal ?? 0 }}</span>
      </div>
      <div class="flex flex-col justify-center text-right md:mx-16 mx-12">
        <span class="text-secondary">今日活跃</span>
        <span class="text-2xl">{{ stats.todayActive ?? 0 }}</span>
      </div>
      <div class="flex flex-col justify-center text-right md:mr-10 mr-4">
        <span class="text-secondary">App用户</span>
        <span class="text-2xl">{{ stats.totalUsers ?? 0 }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import type { PropType } from 'vue';
  import { Avatar } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import headerImg from '/@/assets/images/header.jpg';

  defineProps({
    stats: {
      type: Object as PropType<{ todoTotal?: number; todayActive?: number; totalUsers?: number }>,
      default: () => ({}),
    },
  });

  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);

  const greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return '早安';
    if (h < 18) return '下午好';
    return '晚上好';
  });
</script>
