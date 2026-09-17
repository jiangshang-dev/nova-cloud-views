interface NavItem {
  title: string;
  icon: string;
  color: string;
  route: string;
}

export const fondiaNavItems: NavItem[] = [
  { title: 'App用户', icon: 'ant-design:user-outlined', color: '#1890ff', route: '/fondia/user' },
  { title: '菜谱管理', icon: 'ant-design:read-outlined', color: '#52c41a', route: '/fondia/cuisine/recipe' },
  { title: '评论审核', icon: 'ant-design:message-outlined', color: '#722ed1', route: '/fondia/interaction/comment' },
  { title: '会员套餐', icon: 'ant-design:crown-outlined', color: '#fa541c', route: '/fondia/member/plan' },
  { title: '积分流水', icon: 'ant-design:gold-outlined', color: '#faad14', route: '/fondia/points/ledger' },
  { title: '商城商品', icon: 'ant-design:shop-outlined', color: '#13c2c2', route: '/fondia/mall/product' },
  { title: '客服工作台', icon: 'ant-design:customer-service-outlined', color: '#eb2f96', route: '/fondia/support/workbench' },
  { title: '意见反馈', icon: 'ant-design:comment-outlined', color: '#2f54eb', route: '/fondia/user/feedback' },
  { title: '运营首页', icon: 'ion:home-outline', color: '#1fdaca', route: '/dashboard/analysis' },
];
