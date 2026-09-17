<template>
  <LoginFormTitle class="enter-x" />
  <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef" @keypress.enter="handleLogin">
    <FormItem name="account" class="enter-x">
      <Input size="large" v-model:value="formData.account" :placeholder="t('sys.login.userName')" class="fix-auto-fill" />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword size="large" visibilityToggle v-model:value="formData.password" :placeholder="t('sys.login.password')" />
    </FormItem>

    <ARow class="enter-x" :gutter="12">
      <ACol :span="14">
        <FormItem name="inputCode" class="enter-x">
          <Input size="large" v-model:value="formData.inputCode" :placeholder="t('sys.login.inputCode')" maxlength="6" />
        </FormItem>
      </ACol>
      <ACol :span="10">
        <FormItem class="enter-x">
          <img
            class="captcha-img"
            :src="randCodeData.requestCodeSuccess ? randCodeData.randCodeImage : codeImg"
            :alt="t('sys.login.inputCode')"
            @click="handleChangeCheckCode"
          />
        </FormItem>
      </ACol>
    </ARow>

    <ARow class="enter-x">
      <ACol :span="24">
        <FormItem>
          <Checkbox v-model:checked="rememberMe" size="small">
            {{ t('sys.login.rememberMe') }}
          </Checkbox>
        </FormItem>
      </ACol>
    </ARow>

    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </Button>
    </FormItem>
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRaw, onMounted } from 'vue';
  import { Checkbox, Form, Input, Row, Col, Button } from 'ant-design-vue';
  import LoginFormTitle from './LoginFormTitle.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { useFormRules, useFormValid } from './useLogin';
  import { getCodeInfo } from '/@/api/sys/user';
  import { USE_NOVA_AUTH } from '/@/api/nova/paths';
  import { encryptAESCBC } from '/@/utils/cipher';
  import { createLocalStorage } from '/@/utils/cache';
  import codeImg from '/@/assets/images/checkcode.png';

  const ACol = Col;
  const ARow = Row;
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { notification } = useMessage();
  const userStore = useUserStore();
  const $ls = createLocalStorage();
  const REMEMBER_USERNAME_KEY = 'LOGIN_REMEMBER_USERNAME';

  const { getFormRules } = useFormRules();
  const formRef = ref();
  const loading = ref(false);
  const rememberMe = ref(false);

  const formData = reactive({
    account: 'admin',
    password: 'admin123',
    inputCode: '',
  });
  const randCodeData = reactive({
    randCodeImage: '',
    requestCodeSuccess: false,
    checkKey: '' as string,
  });

  const { validForm } = useFormValid(formRef);

  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const password = USE_NOVA_AUTH ? data.password : encryptAESCBC(data.password);
      const { userInfo } = await userStore.login(
        toRaw({
          password,
          username: data.account,
          captcha: data.inputCode,
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
        if (rememberMe.value && data.account) {
          $ls.set(REMEMBER_USERNAME_KEY, data.account);
        } else {
          $ls.remove(REMEMBER_USERNAME_KEY);
        }
      }
    } catch (error: any) {
      notification.error({
        message: t('sys.api.errorTip'),
        description: error?.message || t('sys.api.networkExceptionMsg'),
        duration: 3,
      });
      handleChangeCheckCode();
    } finally {
      loading.value = false;
    }
  }

  function handleChangeCheckCode() {
    formData.inputCode = '';
    randCodeData.checkKey = `${Date.now()}${Math.random().toString(36).slice(-4)}`;
    getCodeInfo(randCodeData.checkKey).then((res) => {
      randCodeData.randCodeImage = res as string;
      randCodeData.requestCodeSuccess = true;
    });
  }

  onMounted(() => {
    handleChangeCheckCode();
    const saved = $ls.get(REMEMBER_USERNAME_KEY);
    if (saved) {
      formData.account = saved;
      rememberMe.value = true;
    }
  });
</script>
