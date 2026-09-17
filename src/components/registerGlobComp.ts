import type { App } from 'vue';
import { Icon } from './Icon';
import AIcon from '/@/components/jeecg/AIcon.vue';

import { Button, JUploadButton } from './Button';
import { Space } from 'ant-design-vue';

// ant-design-vue 组件通过 unplugin-vue-components + AntDesignVueResolver 自动按需导入，无需手动注册
const compList = [Icon, AIcon, JUploadButton];
// 注册 online 模块的全局组件（本地实现，不依赖 @jeecg/online 包）
import { registerOnlineComp } from '/@/views/super/online/cgform/auto/comp/index';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

export function registerGlobComp(app: App) {
  compList.forEach((comp) => {
    app.component(comp.name || comp.displayName, comp);
  });
  // Space.Compact 是子组件，AntDesignVueResolver 无法自动解析，需手动注册
  app.component('ASpaceCompact', Space.Compact);

  // Tinymce 异步加载
  app.component(
    'Tinymce',
    createAsyncComponent(() => import('./Tinymce/src/Editor.vue'), {
      loading: true,
    }),
  );

  app.use(registerOnlineComp).use(Button);
  console.log('---初始化---，全局注册 Antd / Tinymce / Online / Button 等组件--------------');
}
