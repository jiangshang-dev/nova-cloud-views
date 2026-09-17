import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  { title: '文件名', dataIndex: 'fileName', width: 220 },
  { title: '大小(B)', dataIndex: 'fileSize', width: 100 },
  { title: 'MD5', dataIndex: 'fileMd5', width: 240 },
  { title: '访问地址', dataIndex: 'accessUrl', key: 'accessUrl' },
  { title: '上传时间', dataIndex: 'gmtCreate', width: 180 },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'fileName', label: '文件名', component: 'Input', colProps: { span: 8 } },
];
