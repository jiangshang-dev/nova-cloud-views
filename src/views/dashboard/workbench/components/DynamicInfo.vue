<template>
  <Card title="最新动态" v-bind="$attrs">
    <template #extra>
      <a-button type="link" size="small" @click="loadMore">刷新</a-button>
    </template>
    <a-empty v-if="!items.length && !loading" description="暂无动态" />
    <List v-else item-layout="horizontal" :data-source="items" :loading="loading">
      <template #renderItem="{ item }">
        <ListItem>
          <ListItemMeta>
            <template #description>{{ item.date }}</template>
            <template #title>{{ item.name }} · <span v-html="item.desc"></span></template>
            <template #avatar>
              <Icon :icon="item.avatar" :size="30" />
            </template>
          </ListItemMeta>
        </ListItem>
      </template>
    </List>
  </Card>
</template>
<script lang="ts" setup>
  import { Card, List } from 'ant-design-vue';
  import type { PropType } from 'vue';
  import { Icon } from '/@/components/Icon';
  import type { CoActivityItem } from '../../mianshiDashboard.api';

  const props = defineProps({
    loading: Boolean,
    items: {
      type: Array as PropType<CoActivityItem[]>,
      default: () => [],
    },
  });

  const emit = defineEmits(['refresh']);

  const ListItem = List.Item;
  const ListItemMeta = List.Item.Meta;

  function loadMore() {
    emit('refresh');
  }
</script>
