<template>
  <Card title="快捷导航" v-bind="$attrs">
    <template v-for="item in navItems" :key="item.title">
      <CardGrid class="cursor-pointer" @click="go(item.route)">
        <span class="flex flex-col items-center">
          <Icon :icon="item.icon" :color="item.color" size="20" />
          <span class="text-md mt-2">{{ item.title }}</span>
        </span>
      </CardGrid>
    </template>
  </Card>
</template>
<script lang="ts" setup>
  import { Card } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { offerNavItems } from './offerData';
  import { Icon } from '/@/components/Icon';

  const router = useRouter();
  const CardGrid = Card.Grid;
  const navItems = offerNavItems;

  function go(route: string) {
    if (route) router.push(route);
  }
</script>
