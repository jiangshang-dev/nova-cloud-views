<template>
  <div :class="prefixCls" class="relative w-full h-full">
    <AppLocalePicker class="login-locale" :showText="false" v-if="!sessionTimeout && showLocale" />
    <AppDarkModeToggle class="login-dark-toggle" v-if="!sessionTimeout" />

    <div class="login-layout">
      <div class="login-brand">
        <div class="brand-content enter-x">
          <div class="brand-logo">
            <span class="brand-mark">N</span>
            <span class="brand-text">Nova Cloud</span>
          </div>
          <h1 class="brand-title">{{ t('sys.login.signInTitle') }}</h1>
          <p class="brand-desc">{{ t('sys.login.signInDesc') }}</p>
          <div class="brand-tags">
            <span v-for="tag in brandTags" :key="tag" class="brand-tag">{{ tag }}</span>
          </div>
          <div class="brand-visual" aria-hidden="true">
            <div class="visual-card card-1">系统管理</div>
            <div class="visual-card card-2">认证 · 网关</div>
            <div class="visual-card card-3">微服务治理</div>
          </div>
        </div>
      </div>

      <div class="login-form-panel">
        <div class="login-form-card enter-x">
          <div class="form-header">
            <div class="form-header-mobile">
              <span class="brand-mark-sm">N</span>
              <span class="form-header-title">{{ title }}</span>
            </div>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { AppLocalePicker, AppDarkModeToggle } from '/@/components/Application';
  import LoginForm from './LoginForm.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLocaleStore } from '/@/store/modules/locale';
  import { useLoginState } from './useLogin';

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? 'Nova Cloud');
  const brandTags = ['微服务', '网关认证', '系统管理'];
  const { handleBackLogin } = useLoginState();
  handleBackLogin();
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @fondia-orange: #ff6a1a;
  @fondia-orange-light: #ff8a4c;
  @fondia-bg: #f7f9fa;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: #1a1a1a;

      .login-brand {
        background: linear-gradient(145deg, #3d2518 0%, #2a1810 100%);
      }

      .login-form-panel {
        background: #141414;
      }

      .login-form-card {
        background: #1f1f1f;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }

      .ant-input,
      .ant-input-password {
        background-color: #2a2a2a;
      }
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }
  }

  .@{prefix-cls} {
    min-height: 100%;
    overflow: hidden;
    background: @fondia-bg;

    .login-locale {
      position: absolute;
      top: 16px;
      right: 56px;
      z-index: 10;
      color: #666;
    }

    .login-dark-toggle {
      position: absolute;
      top: 12px;
      right: 16px;
      z-index: 10;
    }

    .login-layout {
      display: flex;
      min-height: 100vh;
    }

    .login-brand {
      display: none;
      flex: 1;
      position: relative;
      overflow: hidden;
      background: linear-gradient(145deg, @fondia-orange-light 0%, @fondia-orange 55%, #e85d10 100%);

      @media (min-width: @screen-xl) {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
      }

      &::before {
        content: '';
        position: absolute;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        top: -120px;
        right: -80px;
      }

      &::after {
        content: '';
        position: absolute;
        width: 280px;
        height: 280px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        bottom: -60px;
        left: -40px;
      }
    }

    .brand-content {
      position: relative;
      z-index: 1;
      max-width: 480px;
      color: #fff;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .brand-mark {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-text {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .brand-title {
      font-size: 36px;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 16px;
      color: #fff;
    }

    .brand-desc {
      font-size: 15px;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.88);
      margin: 0 0 24px;
    }

    .brand-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 40px;
    }

    .brand-tag {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .brand-visual {
      position: relative;
      height: 160px;
    }

    .visual-card {
      position: absolute;
      padding: 12px 18px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.95);
      color: #333;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      white-space: nowrap;
    }

    .card-1 {
      top: 0;
      left: 0;
      transform: rotate(-4deg);
    }

    .card-2 {
      top: 48px;
      left: 100px;
      transform: rotate(2deg);
    }

    .card-3 {
      top: 96px;
      left: 24px;
      transform: rotate(-2deg);
    }

    .login-form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      background: @fondia-bg;

      @media (min-width: @screen-xl) {
        flex: 0 0 520px;
        max-width: 520px;
        padding: 48px 40px;
      }
    }

    .login-form-card {
      width: 100%;
      max-width: 420px;
      padding: 32px 28px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(255, 106, 26, 0.08);

      @media (max-width: @screen-xl) {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      }
    }

    .form-header-mobile {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;

      @media (min-width: @screen-xl) {
        display: none;
      }
    }

    .brand-mark-sm {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: @fondia-orange;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .form-header-title {
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    .ant-btn-primary {
      background: linear-gradient(90deg, @fondia-orange-light, @fondia-orange) !important;
      border: none !important;
      box-shadow: 0 4px 12px rgba(255, 106, 26, 0.35);

      &:hover,
      &:focus {
        background: linear-gradient(90deg, #ff955b, #ff7a2e) !important;
      }
    }

    .ant-checkbox-checked .ant-checkbox-inner {
      background-color: @fondia-orange;
      border-color: @fondia-orange;
    }

    input:not([type='checkbox']) {
      min-width: unset;
      width: 100%;
    }

    .captcha-img {
      height: 40px;
      width: 120px;
      cursor: pointer;
      border-radius: 6px;
      object-fit: cover;
    }
  }
</style>
