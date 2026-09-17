import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '标题',
    dataIndex: 'title',
    width: 200,
    resizable: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      const statusMap = {
        Processing: 'warning',
        Uploading: 'processing',
        Normal: 'success',
        Deleted: 'error',
      };
      const color = statusMap[text] || 'default';
      return h(Tag, { color }, () => text);
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '标题',
    field: 'title',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: '上传中', value: 'Uploading' },
        { label: '处理中', value: 'Processing' },
        { label: '正常', value: 'Normal' },
        { label: '已删除', value: 'Deleted' },
      ],
    },
    colProps: { span: 6 },
  },
];
