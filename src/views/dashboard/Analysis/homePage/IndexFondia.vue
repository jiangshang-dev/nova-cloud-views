<template>
  <div class="p-4">
    <!-- 核心指标 -->
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

    <!-- 趋势 + 排行 -->
    <a-card :loading="loading" :bordered="false" class="!my-4 enter-y" :body-style="{ padding: '0' }">
      <a-tabs v-model:activeKey="activeTab" size="large" :tab-bar-style="{ marginBottom: '24px', paddingLeft: '16px' }">
        <template #rightExtra>
          <a-radio-group v-model:value="trendDays" size="small" @change="loadTrend">
            <a-radio-button :value="7">近7天</a-radio-button>
            <a-radio-button :value="14">近14天</a-radio-button>
            <a-radio-button :value="30">近30天</a-radio-button>
          </a-radio-group>
        </template>
        <a-tab-pane tab="会员订单" key="member">
          <a-row>
            <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
              <Bar :chartData="memberBarData" height="38vh" :seriesColor="seriesColor" />
            </a-col>
            <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
              <RankList title="热门兑换商品" :list="rankList" />
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane tab="用户增长" key="user">
          <a-row>
            <a-col :span="24">
              <Bar :chartData="userBarData" height="38vh" :seriesColor="seriesColor" />
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane tab="商城兑换" key="mall">
          <a-row>
            <a-col :span="24">
              <Bar :chartData="mallBarData" height="38vh" :seriesColor="seriesColor" />
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 运营待办 + 业务概况 -->
    <a-row :gutter="16" class="enter-y">
      <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card :loading="loading" title="运营待办" :bordered="false">
          <a-list :data-source="todoPreview" item-layout="horizontal">
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
    getFdMemberOrderTrend,
    getFdMallOrderTrend,
    getFdOverview,
    getFdTopMallProducts,
    getFdUserTrend,
    getFdWorkbench,
    type FdOverview,
    type FdTodoItem,
  } from '../../fondiaDashboard.api';

  const router = useRouter();
  const { getThemeColor } = useRootSetting();
  const seriesColor = computed(() => getThemeColor.value);

  const loading = ref(true);
  const overview = ref<FdOverview | null>(null);
  const todoPreview = ref<FdTodoItem[]>([]);
  const rankList = ref<{ name: string; total: number }[]>([]);
  const activeTab = ref('member');
  const trendDays = ref(7);
  const memberBarData = ref<{ name: string; value: number }[]>([]);
  const userBarData = ref<{ name: string; value: number }[]>([]);
  const mallBarData = ref<{ name: string; value: number }[]>([]);

  const kpiCards = computed(() => {
    const o = overview.value;
    return [
      {
        title: '会员累计销售额',
        total: `¥${formatMoney(o?.totalMemberSales)}`,
        subTitle: `今日 ¥${formatMoney(o?.todayMemberSales)}`,
        footer: '今日订单',
        footerValue: `${o?.todayPaidMemberOrders ?? 0} 笔`,
        icon: 'ant-design:pay-circle-outlined',
      },
      {
        title: 'App 用户总数',
        total: `${o?.totalUsers ?? 0}`,
        subTitle: `今日新增 ${o?.todayNewUsers ?? 0}`,
        footer: '生效会员',
        footerValue: `${o?.activeMembers ?? 0} 人`,
        icon: 'ant-design:user-outlined',
      },
      {
        title: '商城兑换订单',
        total: `${o?.totalMallOrders ?? 0}`,
        subTitle: `待发货 ${o?.pendingMallOrders ?? 0}`,
        footer: '累计发放积分',
        footerValue: `${o?.totalPointsIssued ?? 0}`,
        icon: 'ant-design:shop-outlined',
      },
      {
        title: '上架菜谱',
        total: `${o?.onlineRecipes ?? 0}`,
        subTitle: '内容运营',
        footer: '会员订单(累计)',
        footerValue: `${o?.totalPaidMemberOrders ?? 0} 笔`,
        icon: 'ant-design:read-outlined',
      },
    ];
  });

  const bizStats = computed(() => {
    const o = overview.value;
    return [
      { label: '待审评论', value: o?.pendingComments ?? 0 },
      { label: '待处理反馈', value: o?.pendingFeedback ?? 0 },
      { label: '待发货兑换', value: o?.pendingMallOrders ?? 0 },
      { label: '待接入客服', value: o?.pendingCsSessions ?? 0 },
      { label: '生效会员', value: o?.activeMembers ?? 0 },
      { label: '今日新增用户', value: o?.todayNewUsers ?? 0 },
    ];
  });

  function formatMoney(val?: number) {
    if (val == null) return '0.00';
    return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function toBarData(points: { date: string; count: number; amount?: number }[], useAmount = false) {
    return points.map((p) => ({
      name: p.date?.slice(5) || p.date,
      value: useAmount ? Number(p.amount ?? 0) : Number(p.count ?? 0),
    }));
  }

  async function loadTrend() {
    const days = trendDays.value;
    const [member, user, mall] = await Promise.all([
      getFdMemberOrderTrend(days),
      getFdUserTrend(days),
      getFdMallOrderTrend(days),
    ]);
    memberBarData.value = toBarData(member, true);
    userBarData.value = toBarData(user);
    mallBarData.value = toBarData(mall);
  }

  async function loadData() {
    loading.value = true;
    try {
      const [ov, wb, ranks] = await Promise.all([
        getFdOverview(),
        getFdWorkbench(),
        getFdTopMallProducts(7),
      ]);
      overview.value = ov;
      todoPreview.value = wb.todos || [];
      rankList.value = (ranks || []).map((r) => ({ name: r.name, total: r.value }));
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
