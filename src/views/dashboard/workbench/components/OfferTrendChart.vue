<template>
  <Card title="近7日用户与学习" :loading="loading">
    <div ref="chartRef" :style="{ width, height }"></div>
  </Card>
</template>
<script lang="ts" setup>
  import { Ref, ref, watch } from 'vue';
  import type { PropType } from 'vue';
  import { Card } from 'ant-design-vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import type { CoTrendPoint } from '../../mianshiDashboard.api';

  const props = defineProps({
    loading: Boolean,
    userTrend: {
      type: Array as PropType<CoTrendPoint[]>,
      default: () => [],
    },
    studyTrend: {
      type: Array as PropType<CoTrendPoint[]>,
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
    () => [props.loading, props.userTrend, props.studyTrend],
    () => {
      if (props.loading) return;
      const dates = (props.userTrend.length ? props.userTrend : props.studyTrend).map(
        (p) => p.date?.slice(5) || p.date
      );
      setOptions({
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, data: ['新增用户', '学习活跃'] },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', data: dates },
        yAxis: { type: 'value' },
        series: [
          {
            name: '新增用户',
            type: 'bar',
            data: props.userTrend.map((p) => Number(p.count ?? 0)),
            itemStyle: { color: '#5ab1ef' },
          },
          {
            name: '学习活跃',
            type: 'line',
            smooth: true,
            data: props.studyTrend.map((p) => Number(p.count ?? 0)),
            itemStyle: { color: '#67e0e3' },
          },
        ],
      });
    },
    { immediate: true, deep: true }
  );
</script>
