import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  { title: '编码', dataIndex: 'storageCode', width: 120 },
  { title: '名称', dataIndex: 'storageName', width: 140 },
  { title: '类型', dataIndex: 'storageType', width: 100 },
  { title: 'Endpoint', dataIndex: 'endpoint', width: 220 },
  { title: 'Bucket', dataIndex: 'bucketName', width: 140 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '备注', dataIndex: 'remark', width: 160 },
];

export const formSchemas: FormSchema[] = [
  {
    field: 'storageCode',
    label: '存储编码',
    component: 'Input',
    required: true,
    dynamicDisabled: ({ values }) => !!values?.id,
  },
  { field: 'storageName', label: '存储名称', component: 'Input', required: true },
  {
    field: 'storageType',
    label: '存储类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '本地 Local', value: 'local' },
        { label: 'MinIO', value: 'minio' },
        { label: 'RustFS', value: 'rustfs' },
        { label: '阿里云 OSS', value: 'oss' },
        { label: '标准 S3', value: 's3' },
      ],
    },
  },
  {
    field: 'endpoint',
    label: 'Endpoint',
    component: 'Input',
    helpMessage: 'OSS 例：oss-cn-beijing.aliyuncs.com；MinIO/RustFS 填服务地址',
    ifShow: ({ values }) => values.storageType !== 'local',
  },
  {
    field: 'region',
    label: 'Region',
    component: 'Input',
    ifShow: ({ values }) => values.storageType !== 'local',
  },
  {
    field: 'accessKey',
    label: 'AccessKey',
    component: 'Input',
    ifShow: ({ values }) => values.storageType !== 'local',
  },
  {
    field: 'secretKey',
    label: 'SecretKey',
    component: 'InputPassword',
    ifShow: ({ values }) => values.storageType !== 'local',
  },
  {
    field: 'bucketName',
    label: 'Bucket',
    component: 'Input',
    ifShow: ({ values }) => values.storageType !== 'local',
  },
  {
    field: 'basePath',
    label: '基础路径',
    component: 'Input',
    helpMessage: '本地为磁盘目录；对象存储为 key 前缀',
  },
  { field: 'domain', label: '访问域名', component: 'Input' },
  {
    field: 'extConfig',
    label: '扩展配置',
    component: 'InputTextArea',
    helpMessage: 'JSON，如 {"pathStyle":true}；MinIO/RustFS 建议 pathStyle=true，OSS 一般为 false',
  },
  { field: 'remark', label: '备注', component: 'InputTextArea' },
];
