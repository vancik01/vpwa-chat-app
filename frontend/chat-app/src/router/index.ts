import { route } from 'quasar/wrappers';
import {
  createRouter,
  createWebHistory,
  Router
} from 'vue-router';
import routes from './routes';

let routerInstance: Router;

export default route(function () {
  const createHistory = createWebHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  routerInstance = Router; // Store the router instance for use elsewhere
  return Router;
});

// Export router instance for use in other files
export { routerInstance };
