<template>
  <PageWrapper>
    <template #headerContent>
      <WorkbenchHeader :stats="headerStats" />
    </template>
    <div class="lg:flex">
      <div class="lg:w-7/10 w-full !mr-4 enter-y">
        <TodoCard :loading="loading" :items="workbench?.todos || []" class="enter-y" />
        <DynamicInfo
          :loading="loading"
          :items="workbench?.activities || []"
          class="!my-4 enter-y"
          @refresh="loadData"
        />
      </div>
      <div class="lg:w-3/10 w-full enter-y">
        <CommentFeatureCard :loading="loading" class="enter-y" />
        <QuickNav :loading="loading" class="!my-4 enter-y" />
        <Card class="!my-4 enter-y" :loading="loading">
          <img class="xl:h-50 h-30 mx-auto" src="../../../assets/svg/illustration.svg" />
        </Card>
        <OfferTrendChart
          :loading="loading"
          :user-trend="userTrend"
          :study-trend="studyTrend"
          class="enter-y"
        />
      </div>
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { Card } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import WorkbenchHeader from './components/WorkbenchHeader.vue';
  import TodoCard from './components/TodoCard.vue';
  import QuickNav from './components/QuickNav.vue';
  import CommentFeatureCard from './components/CommentFeatureCard.vue';
  import DynamicInfo from './components/DynamicInfo.vue';
  import OfferTrendChart from './components/OfferTrendChart.vue';
  import {
    getCoStudyTrend,
    getCoUserTrend,
    getCoWorkbench,
    type CoTrendPoint,
    type CoWorkbench,
  } from '../mianshiDashboard.api';

  const loading = ref(true);
  const workbench = ref<CoWorkbench | null>(null);
  const userTrend = ref<CoTrendPoint[]>([]);
  const studyTrend = ref<CoTrendPoint[]>([]);

  const headerStats = computed(() => ({
    todoTotal: workbench.value?.todoTotal ?? 0,
    todayActive: workbench.value?.todayActive ?? 0,
    totalUsers: workbench.value?.totalUsers ?? 0,
  }));

  async function loadData() {
    loading.value = true;
    try {
      const [wb, user, study] = await Promise.all([
        getCoWorkbench(),
        getCoUserTrend(7),
        getCoStudyTrend(7),
      ]);
      workbench.value = wb;
      userTrend.value = user || [];
      studyTrend.value = study || [];
    } finally {
      loading.value = false;
    }
  }

  onMounted(loadData);
</script>
