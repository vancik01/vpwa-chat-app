import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [{ path: '/channel/:id', component: () => import('pages/ChannelPage.vue') }],
	},

	{
		path: '/auth',
		component: ()=>import('layouts/AuthLayout.vue'),
		children: [
			{
				path: 'login',
				component: () => import('pages/LoginPage.vue'),
			},
			{
				path: 'register',
				component: () => import('pages/RegisterPage.vue'),
			},
		],
	},
  
	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue'),
	},
];

export default routes;
