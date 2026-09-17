<template>
  <Card title="近7日业务趋势" :loading="loading">
    <div ref="chartRef" :style="{ width, height }"></div>
  </Card>
</template>
<script lang="ts" setup>
  import { Ref, ref, watch } from 'vue';
  import type { PropType } from 'vue';
  import { Card } from 'ant-design-vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import type { FdTrendPoint } from '../../fondiaDashboard.api';

  const props = defineProps({
    loading: Boolean,
    memberTrend: {
      type: Array as PropType<FdTrendPoint[]>,
      default: () => [],
    },
    userTrend: {
      type: Array as PropType<FdTrendPoint[]>,
      default: () => [],
    },
    width: {
      type: String as PropType<string>,
      default: '100%',
    },
    height: {
      type: String as PropType<string>,
      default: '320px',
    },
  });

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  watch(
    () => [props.loading, props.memberTrend, props.userTrend],
    () => {
      if (props.loading) return;
      const dates = props.memberTrend.map((p) => p.date?.slice(5) || p.date);
      setOptions({
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, data: ['会员订单额', '新增用户'] },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', data: dates },
        yAxis: { type: 'value' },
        series: [
          {
            name: '会员订单额',
            type: 'bar',
            data: props.memberTrend.map((p) => Number(p.amount ?? 0)),
            itemStyle: { color: '#5ab1ef' },
          },
          {
            name: '新增用户',
            type: 'line',
            smooth: true,
            data: props.userTrend.map((p) => Number(p.count ?? 0)),
            itemStyle: { color: '#67e0e3' },
          },
        ],
      });
    },
    { immediate: true, deep: true }
  );
</script>
