import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'home',
		meta: { requiresAuth: true },
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: '', component: () => import('pages/UserWelcomePage.vue') },
			{ path: '/channel/:id', component: () => import('pages/ChannelPage.vue') },
		],
	},

	{
		path: '/auth',
		component: ()=>import('layouts/AuthLayout.vue'),
		children: [
			{ path: 'register', name: 'register', meta: { guestOnly: true }, component: () => import('pages/RegisterPage.vue') },
      		{ path: 'login', name: 'login', meta: { guestOnly: true }, component: () => import('pages/LoginPage.vue') }
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
