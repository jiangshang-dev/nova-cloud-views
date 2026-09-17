<template>
  <Card title="App 功能开关" v-bind="$attrs">
    <div class="flex items-center justify-between">
      <div class="pr-4">
        <div class="text-lg">会员总开关</div>
        <div class="text-secondary mt-1">打开后 AI 需会员、展示会员标识与付费入口；关闭后会员功能全部失效，AI 不再校验额度</div>
      </div>
      <a-switch
        :checked="memberEnabled"
        :loading="saving"
        checked-children="开"
        un-checked-children="关"
        @change="(v) => onChange('member', !!v)"
      />
    </div>
    <div class="flex items-center justify-between !mt-4 pt-4" style="border-top: 1px solid #f0f0f0">
      <div class="pr-4">
        <div class="text-lg">App 评论区</div>
        <div class="text-secondary mt-1">打开后题目详情显示评论；关闭则整块隐藏</div>
      </div>
      <a-switch
        :checked="commentEnabled"
        :loading="saving"
        checked-children="开"
        un-checked-children="关"
        @change="(v) => onChange('comment', !!v)"
      />
    </div>
    <div class="flex items-center justify-between !mt-4 pt-4" style="border-top: 1px solid #f0f0f0">
      <div class="pr-4">
        <div class="text-lg">题目详情 AI</div>
        <div class="text-secondary mt-1">打开后显示快捷提问和右下角 AI 按钮；关闭则隐藏</div>
      </div>
      <a-switch
        :checked="questionAiEnabled"
        :loading="saving"
        checked-children="开"
        un-checked-children="关"
        @change="(v) => onChange('questionAi', !!v)"
      />
    </div>
    <div class="flex items-center justify-between !mt-4 pt-4" style="border-top: 1px solid #f0f0f0">
      <div class="pr-4">
        <div class="text-lg">底部 AI 面试</div>
        <div class="text-secondary mt-1">打开后底部显示 AI 面试 Tab；关闭则隐藏该入口</div>
      </div>
      <a-switch
        :checked="interviewAiEnabled"
        :loading="saving"
        checked-children="开"
        un-checked-children="关"
        @change="(v) => onChange('interviewAi', !!v)"
      />
    </div>
    <div class="flex items-center justify-between !mt-4 pt-4" style="border-top: 1px solid #f0f0f0">
      <div class="pr-4">
        <div class="text-lg">底部专栏</div>
        <div class="text-secondary mt-1">打开后底部显示专栏 Tab；关闭则 App 彻底隐藏专栏入口与相关页</div>
      </div>
      <a-switch
        :checked="blogEnabled"
        :loading="saving"
        checked-children="开"
        un-checked-children="关"
        @change="(v) => onChange('blog', !!v)"
      />
    </div>
    <div class="flex items-center justify-between !mt-4 pt-4" style="border-top: 1px solid #f0f0f0">
      <div class="pr-4">
        <div class="text-lg">底部广场</div>
        <div class="text-secondary mt-1">打开后底部显示广场 Tab；关闭则 App 彻底隐藏广场入口与相关页</div>
      </div>
      <a-switch
        :checked="forumEnabled"
        :loading="saving"
        checked-children="开"
        un-checked-children="关"
        @change="(v) => onChange('forum', !!v)"
      />
    </div>
  </Card>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { Card } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getCoAppFeature, saveCoAppFeature } from '../../mianshiDashboard.api';

  defineProps({
    loading: Boolean,
  });

  type FeatureKey = 'member' | 'comment' | 'questionAi' | 'interviewAi' | 'blog' | 'forum';

  const { createMessage } = useMessage();
  const memberEnabled = ref(true);
  const commentEnabled = ref(true);
  const questionAiEnabled = ref(true);
  const interviewAiEnabled = ref(true);
  const blogEnabled = ref(true);
  const forumEnabled = ref(true);
  const saving = ref(false);

  function apply(data?: {
    memberEnabled?: boolean;
    commentEnabled?: boolean;
    questionAiEnabled?: boolean;
    interviewAiEnabled?: boolean;
    blogEnabled?: boolean;
    forumEnabled?: boolean;
  }) {
    memberEnabled.value = data?.memberEnabled !== false;
    commentEnabled.value = data?.commentEnabled !== false;
    questionAiEnabled.value = data?.questionAiEnabled !== false;
    interviewAiEnabled.value = data?.interviewAiEnabled !== false;
    blogEnabled.value = data?.blogEnabled !== false;
    forumEnabled.value = data?.forumEnabled !== false;
  }

  function snapshot() {
    return {
      memberEnabled: memberEnabled.value,
      commentEnabled: commentEnabled.value,
      questionAiEnabled: questionAiEnabled.value,
      interviewAiEnabled: interviewAiEnabled.value,
      blogEnabled: blogEnabled.value,
      forumEnabled: forumEnabled.value,
    };
  }

  async function load() {
    try {
      apply(await getCoAppFeature());
    } catch (_e) {
      apply();
    }
  }

  async function onChange(key: FeatureKey, checked: boolean) {
    const prev = snapshot();
    if (key === 'member') memberEnabled.value = checked;
    if (key === 'comment') commentEnabled.value = checked;
    if (key === 'questionAi') questionAiEnabled.value = checked;
    if (key === 'interviewAi') interviewAiEnabled.value = checked;
    if (key === 'blog') blogEnabled.value = checked;
    if (key === 'forum') forumEnabled.value = checked;
    saving.value = true;
    try {
      apply(await saveCoAppFeature(snapshot()));
      const labels: Record<FeatureKey, string> = {
        member: '会员总开关',
        comment: 'App 评论区',
        questionAi: '题目详情 AI',
        interviewAi: '底部 AI 面试',
        blog: '底部专栏',
        forum: '底部广场',
      };
      const on =
        key === 'member'
          ? memberEnabled.value
          : key === 'comment'
            ? commentEnabled.value
            : key === 'questionAi'
              ? questionAiEnabled.value
              : key === 'interviewAi'
                ? interviewAiEnabled.value
                : key === 'blog'
                  ? blogEnabled.value
                  : forumEnabled.value;
      createMessage.success(on ? `已开启${labels[key]}` : `已关闭${labels[key]}`);
    } catch (_e) {
      memberEnabled.value = prev.memberEnabled;
      commentEnabled.value = prev.commentEnabled;
      questionAiEnabled.value = prev.questionAiEnabled;
      interviewAiEnabled.value = prev.interviewAiEnabled;
      blogEnabled.value = prev.blogEnabled;
      forumEnabled.value = prev.forumEnabled;
      createMessage.error('开关更新失败');
    } finally {
      saving.value = false;
    }
  }

  onMounted(load);
</script>
