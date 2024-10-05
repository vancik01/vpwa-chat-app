<template>
  <q-layout view="lHh Lpr lF"> <!-- Modified view: lF to ensure footer is scrollable with the page -->

    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
      </q-toolbar>
    </q-header>

    <DrawerLayout :leftDrawerOpen="leftDrawerOpen" @update:leftDrawerOpen="leftDrawerOpen = $event" />

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
import DrawerLayout from 'src/components/DrawerLayout.vue';
import { useUserStore } from 'src/stores/userStore';
import { ref } from 'vue'

export default {
  components: {
    DrawerLayout
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
