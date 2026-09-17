<template>
  <div class="p-4">
    <div class="md:flex enter-y">
      <ChartCard
        v-for="(item, index) in kpiCards"
        :key="item.title"
        :loading="loading"
        :title="item.title"
        :total="item.total"
        class="md:w-1/4 w-full !md:mt-0 !mt-4"
        :class="[index + 1 < 4 && '!md:mr-4']"
      >
        <template #action>
          <Icon :icon="item.icon" :size="20" />
        </template>
        <div class="text-secondary text-sm">{{ item.subTitle }}</div>
        <template #footer>
          <span>{{ item.footer }}<span class="ml-1">{{ item.footerValue }}</span></span>
        </template>
      </ChartCard>
    </div>

    <a-card :loading="loading" :bordered="false" class="!my-4 enter-y" :body-style="{ padding: '0' }">
      <a-tabs v-model:activeKey="activeTab" size="large" :tab-bar-style="{ marginBottom: '24px', paddingLeft: '16px' }">
        <template #rightExtra>
          <a-radio-group v-model:value="trendDays" size="small" @change="loadTrend">
            <a-radio-button :value="7">近7天</a-radio-button>
            <a-radio-button :value="14">近14天</a-radio-button>
            <a-radio-button :value="30">近30天</a-radio-button>
          </a-radio-group>
        </template>
        <a-tab-pane tab="用户增长" key="user">
          <a-row>
            <a-col :span="24">
              <Bar :chartData="userBarData" height="38vh" :seriesColor="seriesColor" />
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane tab="学习活跃" key="study">
          <a-row>
            <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
              <Bar :chartData="studyBarData" height="38vh" :seriesColor="seriesColor" />
            </a-col>
            <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
              <RankList title="热门分类（浏览）" :list="hotCategories" />
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane tab="模拟面试" key="interview">
          <a-row>
            <a-col :span="24">
              <Bar :chartData="interviewBarData" height="38vh" :seriesColor="seriesColor" />
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-row :gutter="16" class="enter-y">
      <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card :loading="loading" title="运营待办" :bordered="false">
          <a-empty v-if="!todoPreview.length" description="暂无待办" />
          <a-list v-else :data-source="todoPreview" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item class="cursor-pointer" @click="goRoute(item.route)">
                <a-list-item-meta>
                  <template #title>
                    <a-badge :count="item.count" :overflow-count="999">
                      <span class="mr-4">{{ item.title }}</span>
                    </a-badge>
                  </template>
                  <template #description>{{ item.desc }}</template>
                  <template #avatar>
                    <Icon :icon="item.icon" :color="item.color" :size="28" />
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card :loading="loading" title="业务概况" :bordered="false">
          <a-row :gutter="16">
            <a-col :span="8" v-for="item in bizStats" :key="item.label">
              <div class="biz-stat">
                <div class="biz-stat-value">{{ item.value }}</div>
                <div class="biz-stat-label">{{ item.label }}</div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="!mt-4 enter-y">
      <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card :loading="loading" title="薄弱知识点" :bordered="false">
          <RankList title="" :list="weakTopics" />
        </a-card>
      </a-col>
      <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card :loading="loading" title="题库构成" :bordered="false">
          <Bar :chartData="groupBarData" height="28vh" :seriesColor="seriesColor" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Icon } from '/@/components/Icon';
  import ChartCard from '/@/components/chart/ChartCard.vue';
  import Bar from '/@/components/chart/Bar.vue';
  import RankList from '/@/components/chart/RankList.vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import {
    getCoHotCategories,
    getCoInterviewTrend,
    getCoOverview,
    getCoStudyTrend,
    getCoUserTrend,
    getCoWeakTopics,
    getCoWorkbench,
    type CoOverview,
    type CoTodoItem,
  } from '../../mianshiDashboard.api';

  const router = useRouter();
  const { getThemeColor } = useRootSetting();
  const seriesColor = computed(() => getThemeColor.value);

  const loading = ref(true);
  const overview = ref<CoOverview | null>(null);
  const todoPreview = ref<CoTodoItem[]>([]);
  const hotCategories = ref<{ name: string; total: number }[]>([]);
  const weakTopics = ref<{ name: string; total: number }[]>([]);
  const activeTab = ref('user');
  const trendDays = ref(7);
  const userBarData = ref<{ name: string; value: number }[]>([]);
  const studyBarData = ref<{ name: string; value: number }[]>([]);
  const interviewBarData = ref<{ name: string; value: number }[]>([]);

  const kpiCards = computed(() => {
    const o = overview.value;
    return [
      {
        title: 'App 用户',
        total: `${o?.totalUsers ?? 0}`,
        subTitle: `今日新增 ${o?.todayNewUsers ?? 0}`,
        footer: '今日活跃',
        footerValue: `${o?.todayActiveUsers ?? 0} 人`,
        icon: 'ant-design:user-outlined',
      },
      {
        title: '启用题目',
        total: `${o?.enabledQuestions ?? 0}`,
        subTitle: `分类 ${o?.enabledCategories ?? 0} 个`,
        footer: '技能 / 公司 / 专项',
        footerValue: `${o?.skillQuestions ?? 0} / ${o?.companyQuestions ?? 0} / ${o?.specialQuestions ?? 0}`,
        icon: 'ant-design:file-text-outlined',
      },
      {
        title: '今日刷题',
        total: `${o?.todayQuestionCount ?? 0}`,
        subTitle: `学习 ${o?.todayLearners ?? 0} 人`,
        footer: '今日打卡',
        footerValue: `${o?.todayCheckins ?? 0}`,
        icon: 'ant-design:read-outlined',
      },
      {
        title: '今日面试',
        total: `${o?.todayInterviews ?? 0}`,
        subTitle: `场均 ${o?.todayAvgScore ?? 0} 分`,
        footer: '简历数',
        footerValue: `${o?.resumeCount ?? 0}`,
        icon: 'ant-design:audio-outlined',
      },
    ];
  });

  const bizStats = computed(() => {
    const o = overview.value;
    return [
      { label: '已上传简历', value: o?.resumeCount ?? 0 },
      { label: '今日打卡', value: o?.todayCheckins ?? 0 },
      { label: '收藏记录', value: o?.favoriteCount ?? 0 },
      { label: 'AI 会话', value: o?.aiSessionCount ?? 0 },
      { label: '空分类', value: o?.emptyCategoryCount ?? 0 },
      { label: '禁用账号', value: o?.disabledUserCount ?? 0 },
    ];
  });

  const groupBarData = computed(() => [
    { name: '技能', value: overview.value?.skillQuestions ?? 0 },
    { name: '公司', value: overview.value?.companyQuestions ?? 0 },
    { name: '专项', value: overview.value?.specialQuestions ?? 0 },
  ]);

  function toBarData(points: { date: string; count: number }[]) {
    return (points || []).map((p) => ({
      name: p.date?.slice(5) || p.date,
      value: Number(p.count ?? 0),
    }));
  }

  async function loadTrend() {
    const days = trendDays.value;
    const [user, study, interview] = await Promise.all([
      getCoUserTrend(days),
      getCoStudyTrend(days),
      getCoInterviewTrend(days),
    ]);
    userBarData.value = toBarData(user);
    studyBarData.value = toBarData(study);
    interviewBarData.value = toBarData(interview);
  }

  async function loadData() {
    loading.value = true;
    try {
      const [ov, wb, hot, weak] = await Promise.all([
        getCoOverview(),
        getCoWorkbench(),
        getCoHotCategories(7),
        getCoWeakTopics(7),
      ]);
      overview.value = ov;
      todoPreview.value = wb.todos || [];
      hotCategories.value = (hot || []).map((r) => ({ name: r.name, total: r.value }));
      weakTopics.value = (weak || []).map((r) => ({ name: r.name, total: r.value }));
      await loadTrend();
    } finally {
      loading.value = false;
    }
  }

  function goRoute(route: string) {
    if (route) router.push(route);
  }

  onMounted(loadData);
</script>

<style lang="less" scoped>
  .biz-stat {
    text-align: center;
    padding: 12px 0;
    .biz-stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #1890ff;
    }
    .biz-stat-label {
      margin-top: 4px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 13px;
    }
  }
</style>
