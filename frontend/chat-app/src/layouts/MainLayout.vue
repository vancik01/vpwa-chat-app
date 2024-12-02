<template>
  <q-layout view="lHh Lpr lF"> <!-- Modified view: lF to ensure footer is scrollable with the page -->

    <q-header bordered :class="`${userStore.isOnline ? 'bg-primary' : 'bg-red'}`">
      <q-toolbar class="navbar">
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <div v-if="!userStore.isOnline">You are offline</div>
      </q-toolbar>
    </q-header>

    <DrawerLayout :leftDrawerOpen="leftDrawerOpen" @update:leftDrawerOpen="leftDrawerOpen = $event" />

    <q-page-container v-if="!userStore.loading">
      <q-page>
        <router-view />
        <q-footer class="text-black bg-white">
          <command-line />
        </q-footer>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
import CommandLine from 'src/components/CommandLine.vue';
import DrawerLayout from 'src/components/DrawerLayout.vue';
import { useUserStore } from 'src/stores/userStore';
import { ref } from 'vue'
// eslint-disable-next-line no-use-before-define
const userStore = useUserStore()
export default {
  components: {
    DrawerLayout,
    CommandLine
  },

  created(){
    userStore.initializeChatApp()

  },
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
  },
}
</script>

<style>
 .q-drawer{
  display: flex;
  flex-direction: column;
 }
 .q-toolbar{
  justify-content: space-between;
 }
</style>


