<template>
  <div class="offer-login-brand">
    <div class="brand-copy">
      <div class="brand-logo">
        <span class="brand-mark" aria-hidden="true">N</span>
        <span class="brand-name">Nova Cloud</span>
      </div>
      <h2 class="brand-title">{{ t('sys.login.signInTitle') }}</h2>
      <p class="brand-desc">{{ t('sys.login.signInDesc') }}</p>
      <div class="brand-tags">
        <span v-for="tag in tags" :key="tag" class="brand-tag">{{ tag }}</span>
      </div>
    </div>

    <div class="brand-stage" aria-hidden="true">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-head">Nova Cloud</div>
        <div class="phone-stat">
          <div class="stat-cell">
            <strong>12</strong>
            <span>服务实例</span>
          </div>
          <div class="stat-cell">
            <strong>36</strong>
            <span>今日请求</span>
          </div>
          <div class="stat-cell">
            <strong>8</strong>
            <span>在线用户</span>
          </div>
        </div>
        <div class="phone-chips">
          <span>Gateway</span>
          <span>Auth</span>
          <span>System</span>
        </div>
      </div>
      <div class="float-card card-a">系统管理</div>
      <div class="float-card card-b">认证 · 网关</div>
      <div class="float-card card-c">模拟面试</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const tags = ['微服务', '网关认证', '系统管理'];
</script>
<style lang="less" scoped>
  @accent: #ff6a1a;
  @ink: #1f2937;
  @muted: #6b7280;

  .offer-login-brand {
    position: relative;
    width: 100%;
    min-height: 420px;
    color: @ink;
  }

  .brand-copy {
    position: relative;
    z-index: 2;
    max-width: 360px;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
  }

  .brand-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: @accent;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0;
  }

  .brand-name {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .brand-title {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.35;
    margin: 0 0 12px;
  }

  .brand-desc {
    font-size: 14px;
    line-height: 1.75;
    color: @muted;
    margin: 0 0 18px;
  }

  .brand-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 28px;
  }

  .brand-tag {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    color: @accent;
    background: rgba(255, 106, 26, 0.1);
    border: 1px solid rgba(255, 106, 26, 0.18);
  }

  .brand-stage {
    position: relative;
    height: 220px;
    margin-top: 8px;
  }

  .phone {
    position: absolute;
    right: 24px;
    top: 0;
    width: 168px;
    height: 210px;
    padding: 14px 12px 12px;
    border-radius: 22px;
    background: #111827;
    color: #f9fafb;
    box-shadow: 0 16px 40px rgba(17, 24, 39, 0.28);
  }

  .phone-notch {
    width: 42px;
    height: 5px;
    border-radius: 999px;
    background: #374151;
    margin: 0 auto 10px;
  }

  .phone-head {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .phone-stat {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }

  .stat-cell {
    background: #1f2937;
    border-radius: 8px;
    padding: 8px 4px;
    text-align: center;

    strong {
      display: block;
      font-size: 14px;
      color: #fff;
    }

    span {
      font-size: 10px;
      color: #9ca3af;
    }
  }

  .phone-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    span {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(255, 106, 26, 0.2);
      color: #fed7aa;
    }
  }

  .float-card {
    position: absolute;
    padding: 8px 14px;
    border-radius: 10px;
    background: #fff;
    font-size: 12px;
    font-weight: 600;
    color: @ink;
    border: 1px solid rgba(17, 24, 39, 0.06);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.1);
    white-space: nowrap;
  }

  .card-a {
    left: 0;
    top: 28px;
  }

  .card-b {
    left: 12px;
    top: 88px;
  }

  .card-c {
    left: 36px;
    top: 148px;
  }

  html[data-theme='dark'] & {
    color: #e5e7eb;

    .brand-name,
    .brand-title {
      color: #f3f4f6;
    }

    .brand-desc {
      color: #9ca3af;
    }

    .float-card {
      background: #1f2937;
      color: #e5e7eb;
      border-color: #374151;
    }
  }
</style>
