<template>
  <Card title="待办事项" v-bind="$attrs">
    <template #extra>
      <a-button type="link" size="small" @click="$router.push('/dashboard/analysis')">运营首页</a-button>
    </template>
    <a-empty v-if="!items.length && !loading" description="暂无待办，一切正常" />
    <template v-for="item in items" :key="item.title">
      <CardGrid class="!md:w-1/2 !w-full cursor-pointer" @click="go(item.route)">
        <span class="flex items-center">
          <Icon :icon="item.icon" :color="item.color" size="28" />
          <span class="text-lg ml-3">{{ item.title }}</span>
          <a-badge class="ml-2" :count="item.count" :overflow-count="999" />
        </span>
        <div class="flex mt-2 h-10 text-secondary">{{ item.desc }}</div>
        <div class="flex justify-between text-secondary">
          <span>点击进入处理</span>
          <Icon icon="ant-design:right-outlined" />
        </div>
      </CardGrid>
    </template>
  </Card>
</template>
<script lang="ts" setup>
  import { Card } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import type { PropType } from 'vue';
  import { Icon } from '/@/components/Icon';
  import type { CoTodoItem } from '../../mianshiDashboard.api';

  defineProps({
    loading: Boolean,
    items: {
      type: Array as PropType<CoTodoItem[]>,
      default: () => [],
    },
  });

  const router = useRouter();
  const CardGrid = Card.Grid;

  function go(route: string) {
    if (route) router.push(route);
  }
</script>
