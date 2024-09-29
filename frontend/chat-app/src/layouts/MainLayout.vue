<template>
  <q-layout view="lHh Lpr lF"> <!-- Modified view: lF to ensure footer is scrollable with the page -->

    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content -->
      <q-scroll-area class="fit">
        <div>Drawer</div>
        <!-- Exampel use of store -->
        <div>{{userStore.user.display_name}}</div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <router-view />
        <q-footer class="text-black bg-white message-bar">
          <div>Command / message input</div>
        </q-footer>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
import { useUserStore } from 'src/stores/userStore';
import { ref } from 'vue'

export default {
  setup () {
    const leftDrawerOpen = ref(false)
    const userStore = useUserStore();

    return {
      userStore,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
}
</script>

<style>
.message-bar {
  padding: 16px;
  min-height: 140px;
  border-top: 1px solid #DDDDDD;
}
</style>
