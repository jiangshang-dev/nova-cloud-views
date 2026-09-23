# Nova Cloud Views

<p align="center">
  <strong>NovaCloud 管理后台前端</strong><br/>
  Vue 3 · TypeScript · Vite · Ant Design Vue 4
</p>

<p align="center">
  <a href="https://github.com/jiangshang-dev/nova-cloud-views"><img src="https://img.shields.io/badge/GitHub-nova--cloud--views-181717?style=flat-square&logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js" alt="Vue" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Ant%20Design%20Vue-4-0170FE?style=flat-square&logo=ant-design" alt="Ant Design Vue" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square" alt="License" />
</p>

---

> **如果本项目对你有帮助，请点一下右上角 Star。**  
> 管理后台工程持续维护，Star 是最直接的支持；欢迎使用与二次开发，也请别只白嫖不留痕迹。

## 项目简介

**Nova Cloud Views** 是 [NovaCloud](https://github.com/jiangshang-dev/nova-cloud) 的管理后台前端，基于 **Vue 3 + TypeScript + Vite + Ant Design Vue 4** 构建，组件体系与工程规范对齐 [JeecgBoot Vue3](https://github.com/jeecgboot/JeecgBoot)，可快速对接微服务网关与认证中心。

配套后端仓库：[nova-cloud](https://github.com/jiangshang-dev/nova-cloud)

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3.5 / TypeScript |
| 构建 | Vite 7 |
| UI | Ant Design Vue 4 |
| 状态 / 路由 | Pinia / Vue Router 4 |
| 请求 | Axios（`defHttp` 封装） |
| 表格 / 图表 | VXE Table / ECharts |
| 流程 | LogicFlow |
| 工程规范 | 对齐 JeecgBoot Vue3 组件与目录约定 |

基础组件：`BasicTable`、`BasicForm`、`BasicModal`、`BasicDrawer` 等（见 `src/components`）。

## 功能特性

- 后台布局、登录鉴权、动态菜单与按钮权限（默认 **BACK** 模式）
- 系统管理、仪表盘、文件、监控、报表、OpenAPI 等页面骨架
- 统一 HTTP 封装：Bearer Token + 统一响应码处理
- 开发代理直连 Spring Cloud Gateway，便于联调微服务
- 支持 Mock 模式（后端未就绪时可先跑通登录与布局）
- 支持 Docker / Electron 等多形态构建脚本

## 环境要求

- Node.js **18+**（推荐 20+）
- 包管理器：**pnpm**（推荐）

## 快速开始

```bash
git clone https://github.com/jiangshang-dev/nova-cloud-views.git
cd nova-cloud-views
pnpm install
pnpm dev
```

浏览器访问：http://127.0.0.1:3100

### Mock 说明

- 开发环境可在 `.env.development` 中配置：
  - `VITE_USE_MOCK = true`：不依赖后端，先跑页面
  - `VITE_USE_MOCK = false`：对接真实网关 / 认证（推荐联调时关闭）

### 开发代理约定

| 项 | 约定 |
| --- | --- |
| 代理 | `/api` → `http://localhost:8080`（Gateway） |
| Token | `Authorization: Bearer <token>`，兼容 `X-Access-Token` |
| 成功码 | `code === 200`（兼容 `0`） |
| 数据字段 | 优先 `data`，兼容 `result` |
| 切换 Nova Auth | `src/api/nova/paths.ts` 中 `USE_NOVA_AUTH = true` |

网关路由规划示例（与后端对齐）：

```text
/api/auth/**    → nova-auth
/api/system/**  → nova-system
/api/file/**    → nova-file
```

更多对接说明见：[docs/网关与认证对接.md](./docs/网关与认证对接.md)

## 常用命令

```bash
pnpm dev              # 本地开发
pnpm build            # 生产构建
pnpm build:docker     # Docker 模式构建
pnpm preview          # 构建结果预览
pnpm clean:cache      # 清理 Vite 缓存
pnpm batch:prettier   # 格式化源码
```

## 目录结构

```text
src/
├── api/            # 接口定义（含 api/nova 微服务对接）
├── components/     # JeecgBoot 风格组件库
├── layouts/        # 管理后台布局
├── router/         # 路由与权限守卫
├── store/          # Pinia（user / permission 等）
├── utils/http/     # Axios 封装
├── views/          # 业务页面
│   ├── system/     # 系统管理
│   ├── dashboard/  # 仪表盘
│   ├── file/       # 文件
│   ├── monitor/    # 监控
│   └── ...
├── settings/       # 项目配置
└── main.ts
```

## 开发规范

- 路径别名：`/@/` → `src/`，`/#/` → `types/`
- 列表页优先：`BasicTable` + `useTable`
- 表单优先：`BasicForm` + `useForm`
- 弹窗优先：`BasicModal` / `useModal`
- 权限：`v-auth` 或 `Authority` 组件
- API 统一走 `defHttp`，不要直接使用裸 `axios`
- 组件 CSS 前缀仍为 `jeecg`（兼容 JeecgBoot 样式，请勿随意改 `prefixCls`）

## 与后端联调

1. 启动 [nova-cloud](https://github.com/jiangshang-dev/nova-cloud) 核心服务（建议顺序：Nacos → Redis → MySQL → gateway / auth / system）
2. 确认网关地址与 `.env.development` 中 `VITE_PROXY` / `VITE_GLOB_DOMAIN_URL` 一致（默认 `8080`）
3. 设置 `VITE_USE_MOCK = false` 后执行 `pnpm dev`
4. 使用初始化账号登录（常见：`admin` / `admin123`，以后端初始化数据为准）

## 支持与反馈

如果本项目帮到你：

1. **给仓库点 Star**（最重要）
2. 关注公众号「架构师姜小白」获取更新
3. 通过 GitHub Issues 反馈问题或建议

前端工程也不容易，欢迎 PR，也请留下一个 Star。

## 相关链接

- 前端仓库：https://github.com/jiangshang-dev/nova-cloud-views
- 后端仓库：https://github.com/jiangshang-dev/nova-cloud
- 作者 GitHub：https://github.com/jiangshang-dev?tab=repositories
- 个人博客：https://alibabap8developer.github.io/myblog/

## License

[Apache License 2.0](./LICENSE)

---

**Nova Cloud Views** · 姜小白  
Vue3 Admin · Microservices · NovaCloud
