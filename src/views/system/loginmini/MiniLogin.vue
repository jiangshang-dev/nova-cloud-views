<template>
  <div :class="prefixCls" class="login-background-img">
    <AppLocalePicker class="absolute top-4 right-4 enter-x xl:text-gray-600" :showText="false" />
    <AppDarkModeToggle class="absolute top-3 right-7 enter-x" />
    <div class="aui-logo" v-if="!getIsMobile">
      <div class="offer-top-logo">
        <span class="offer-top-mark">N</span>
        <span class="offer-top-name">Nova Cloud</span>
      </div>
    </div>
    <div v-else class="aui-phone-logo offer-phone-logo">
      <span class="offer-top-mark sm">N</span>
      <span class="offer-top-name-sm">Nova Cloud</span>
    </div>
    <div class="aui-content">
      <div class="aui-container">
        <div class="aui-form">
          <div class="aui-image">
            <FondiaLoginBrand />
          </div>
          <div class="aui-formBox">
            <div class="aui-formWell">
              <div class="aui-flex aui-form-nav investment_title">
                <div class="aui-flex-box activeNav on">{{ t('sys.login.signInFormTitle') }}</div>
              </div>
              <div class="aui-form-box" style="height: auto; min-height: 220px">
                <a-form ref="loginRef" :model="formData" @keyup.enter.native="accountLogin">
                  <div class="aui-account">
                    <div class="aui-inputClear">
                      <i class="icon icon-code"></i>
                      <a-form-item>
                        <a-input class="fix-auto-fill" :placeholder="t('sys.login.userName')" v-model:value="formData.username" />
                      </a-form-item>
                    </div>
                    <div class="aui-inputClear">
                      <i class="icon icon-password"></i>
                      <a-form-item>
                        <a-input class="fix-auto-fill" type="password" :placeholder="t('sys.login.password')" v-model:value="formData.password" />
                      </a-form-item>
                    </div>
                    <div class="aui-inputClear">
                      <i class="icon icon-code"></i>
                      <a-form-item>
                        <a-input class="fix-auto-fill" type="text" :placeholder="t('sys.login.inputCode')" v-model:value="formData.inputCode" />
                      </a-form-item>
                      <div class="aui-code">
                        <img v-if="randCodeData.requestCodeSuccess" :src="randCodeData.randCodeImage" @click="handleChangeCheckCode" />
                        <img v-else style="margin-top: 2px; max-width: initial" :src="codeImg" @click="handleChangeCheckCode" />
                      </div>
                    </div>
                    <div class="aui-flex">
                      <div class="aui-flex-box">
                        <div class="aui-choice">
                          <a-checkbox v-model:checked="rememberMe">{{ t('sys.login.rememberMe') }}</a-checkbox>
                        </div>
                      </div>
                    </div>
                  </div>
                </a-form>
              </div>
              <div class="aui-formButton">
                <div class="aui-flex">
                  <a-button :loading="loginLoading" class="aui-link-login" type="primary" @click="accountLogin">
                    {{ t('sys.login.loginButton') }}
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup name="login-mini">
  import { getCodeInfo } from '/@/api/sys/user';
  import { onMounted, reactive, ref, toRaw } from 'vue';
  import codeImg from '/@/assets/images/checkcode.png';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FondiaLoginBrand from './FondiaLoginBrand.vue';
  import { AppLocalePicker, AppDarkModeToggle } from '/@/components/Application';
  import { createLocalStorage } from '/@/utils/cache';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useAppInject } from '/@/hooks/web/useAppInject';
  import { USE_NOVA_AUTH } from '/@/api/nova/paths';
  import { encryptAESCBC } from '/@/utils/cipher';

  const { prefixCls } = useDesign('mini-login');
  const { notification, createMessage } = useMessage();
  const userStore = useUserStore();
  const { t } = useI18n();
  const $ls = createLocalStorage();
  const REMEMBER_USERNAME_KEY = 'LOGIN_REMEMBER_USERNAME';
  const rememberMe = ref(false);
  const loginLoading = ref(false);
  const { getIsMobile } = useAppInject();

  const formData = reactive({
    inputCode: '',
    username: 'admin',
    password: 'admin123',
  });
  const randCodeData = reactive({
    randCodeImage: '',
    requestCodeSuccess: false,
    checkKey: '' as string,
  });

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  function handleChangeCheckCode() {
    formData.inputCode = '';
    randCodeData.checkKey = `${Date.now()}${Math.random().toString(36).slice(-4)}`;
    getCodeInfo(randCodeData.checkKey).then((res) => {
      randCodeData.randCodeImage = res as string;
      randCodeData.requestCodeSuccess = true;
    });
  }

  async function accountLogin() {
    if (!formData.username) {
      createMessage.warn(t('sys.login.accountPlaceholder'));
      return;
    }
    if (!formData.password) {
      createMessage.warn(t('sys.login.passwordPlaceholder'));
      return;
    }
    if (!formData.inputCode) {
      createMessage.warn(t('sys.login.inputCodePlaceholder'));
      return;
    }
    try {
      loginLoading.value = true;
      const password = USE_NOVA_AUTH ? formData.password : encryptAESCBC(formData.password);
      const { userInfo } = await userStore.login(
        toRaw({
          password,
          username: formData.username,
          captcha: formData.inputCode,
          checkKey: randCodeData.checkKey,
          mode: 'none',
        }),
      );
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.realname}`,
          duration: 3,
        });
        if (rememberMe.value && formData.username) {
          $ls.set(REMEMBER_USERNAME_KEY, formData.username);
        } else {
          $ls.remove(REMEMBER_USERNAME_KEY);
        }
      }
    } catch (error: any) {
      notification.error({
        message: t('sys.api.errorTip'),
        description: error?.message || t('sys.login.networkExceptionMsg'),
        duration: 3,
      });
      handleChangeCheckCode();
    } finally {
      loginLoading.value = false;
    }
  }

  onMounted(() => {
    handleChangeCheckCode();
    const saved = $ls.get(REMEMBER_USERNAME_KEY);
    if (saved) {
      formData.username = saved;
      rememberMe.value = true;
    }
  });
</script>

<style lang="less" scoped>
  @import '/@/assets/loginmini/style/home.less';
  @import '/@/assets/loginmini/style/base.less';

  :deep(.ant-input:focus) {
    box-shadow: none;
  }
  :deep(.jeecg-dark-switch) {
    position: absolute;
    margin-right: 10px;
  }
  .aui-link-login {
    height: 42px;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 8px;
    margin-top: 15px;
    margin-bottom: 8px;
    flex: 1;
    color: #fff;
    background: linear-gradient(90deg, #ff8a4c, #ff6a1a) !important;
    border: none !important;
    box-shadow: 0 4px 12px rgba(255, 106, 26, 0.3);
  }
  .offer-top-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;
  }
  .offer-top-mark {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #ff6a1a;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.sm {
      width: 24px;
      height: 24px;
      font-size: 12px;
    }
  }
  .offer-phone-logo {
    position: absolute;
    margin-left: 10px;
    top: 8px;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .offer-top-name-sm {
    font-size: 16px;
    font-weight: 600;
    color: #ff6a1a;
  }
  .top-3 {
    top: 0.45rem;
  }
</style>

<style lang="less">
  @prefix-cls: ~'@{namespace}-mini-login';
  @dark-bg: #293146;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg !important;
      background-image: none;

      &::before {
        background-image: url(/@/assets/svg/login-bg-dark.svg);
      }
      .aui-inputClear {
        background-color: #232a3b !important;
      }
      .ant-input,
      .ant-input-password {
        background-color: #232a3b !important;
      }
      .aui-formBox {
        background-color: @dark-bg !important;
      }
      .aui-form-nav .aui-flex-box {
        color: #c9d1d9 !important;
      }
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }
  }
</style>
