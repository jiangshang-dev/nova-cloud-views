<template>
  <div>
    <h2 class="mb-1 text-2xl font-bold text-center xl:text-3xl enter-x xl:text-left text-[#333]">
      {{ getFormTitle }}
    </h2>
    <p v-if="getLoginState === LoginStateEnum.LOGIN" class="mb-4 text-sm text-center xl:text-left text-[#999] enter-x">
      欢迎登录 Nova Cloud 管理后台
    </p>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState } from './useLogin';

  const { t } = useI18n();
  const { getLoginState } = useLoginState();

  const getFormTitle = computed(() => {
    const titleObj = {
      [LoginStateEnum.RESET_PASSWORD]: t('sys.login.forgetFormTitle'),
      [LoginStateEnum.LOGIN]: t('sys.login.signInFormTitle'),
      [LoginStateEnum.REGISTER]: t('sys.login.signUpFormTitle'),
      [LoginStateEnum.MOBILE]: t('sys.login.mobileSignInFormTitle'),
      [LoginStateEnum.QR_CODE]: t('sys.login.qrSignInFormTitle'),
    };
    return titleObj[unref(getLoginState)];
  });
</script>
