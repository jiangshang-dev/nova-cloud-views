# Nova Cloud Views

Nova Cloud 管理后台前端，基于 **Vue 3 + TypeScript + Vite + Ant Design Vue 4**，组件与工程规范对齐 [JeecgBoot Vue3](https://github.com/jeecgboot/JeecgBoot)。

## 技术栈

- Vue 3.5 / TypeScript / Vite 7
- Ant Design Vue 4 / Pinia / Vue Router 4
- Axios（`defHttp`）/ VXE Table / ECharts
- JeecgBoot 风格基础组件：`BasicTable`、`BasicForm`、`BasicModal`、`BasicDrawer` 等（`src/components`）

## 快速开始

```bash
# 需要 Node 18+ 或 20+，推荐 pnpm
cd /Users/xiaobai/Deveploer/workspace/lingxi/nova-cloud-views
pnpm install
pnpm dev
```

浏览器访问：http://127.0.0.1:3100

> 默认开启 Mock（`.env.development` 中 `VITE_USE_MOCK=true`），后端网关未就绪也可先跑通登录与布局。
>
> 若本机 `pnpm install` 因 registry/权限受阻，可临时：
> `ln -s <jeecgboot-vue3>/node_modules ./node_modules`
> （当前环境为便于验证可能已使用该软链；正式开发请改为独立安装。）

## 目录结构（核心）

```
src/
  api/            # 接口定义（含 api/nova 微服务对接预留）
  components/     # JeecgBoot 风格组件库（已完整迁入）
  layouts/        # 管理后台布局
  router/         # 路由与权限守卫
  store/          # Pinia（user / permission / user ...）
  utils/http/     # Axios 封装（Bearer + 统一响应）
  views/          # 页面（system / dashboard / demo ...）
```

## 与微服务网关 / 认证对接

详见 [docs/网关与认证对接.md](./docs/网关与认证对接.md)。

要点：

| 项 | 约定 |
|----|------|
| 开发代理 | `/api` → `http://localhost:8080`（Gateway） |
| Token | `Authorization: Bearer <token>` + `X-Access-Token` |
| 成功码 | `code === 200`（兼容 `0`） |
| 数据字段 | 优先 `data`，兼容 `result` |
| 切换 Nova Auth | `src/api/nova/paths.ts` 中 `USE_NOVA_AUTH = true` |

## 常用命令

```bash
pnpm dev          # 开发
pnpm build        # 生产构建
pnpm preview      # 构建预览
pnpm clean:cache  # 清理 Vite 缓存
```

## 开发规范（对齐 Jeecg）

- 路径别名：`/@/` → `src/`，`/#/` → `types/`
- 列表页优先使用 `BasicTable` + `useTable`；表单用 `BasicForm` + `useForm`
- 弹窗用 `BasicModal` / `useModal`；权限用 `v-auth` 或 `Authority`
- API 统一走 `defHttp`，不要直接 `axios`
- 权限模式默认 **BACK**（菜单/按钮由后端下发）

## 说明

- 组件 CSS 前缀仍为 `jeecg`（与 JeecgBoot 组件样式兼容，请勿随意改 `prefixCls`）
- 已移除原业务模块 `views/mianshi` 与依赖 `@jeecg/aiflow`
- 未执行任何 git 操作
