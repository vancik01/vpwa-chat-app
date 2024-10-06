// src/stores/index.ts
import { store } from 'quasar/wrappers';
import { createPinia } from 'pinia';
import { markRaw } from 'vue';
import { routerInstance } from 'src/router'; // Import your router instance
import { Router } from 'vue-router';

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 */
declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router; // Declare router as a custom property
  }
}

export default store((/* { ssrContext } */) => {
  const pinia = createPinia();

  // Adding router instance to every store
  pinia.use(({ store }) => {
    store.router = markRaw(routerInstance);
  });

  return pinia;
});
