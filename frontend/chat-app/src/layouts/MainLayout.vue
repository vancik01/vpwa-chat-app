<template>
  <q-layout view="lHh Lpr lF"> <!-- Modified view: lF to ensure footer is scrollable with the page -->

    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered class="q-drawer">
      <!-- drawer content -->
      <!-- <q-scroll-area class="fit">
        
      </q-scroll-area> -->
      <div>Drawer</div>
        <!-- Exampel use of store -->
      <div>{{userStore.user.display_name}}</div>
      <user-status-bar></user-status-bar>
    </q-drawer>

    <q-page-container>
      <q-page padding>
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
import UserStatusBar from 'src/components/UserStatusBar.vue';
import { useUserStore } from 'src/stores/userStore';
import { ref } from 'vue'
// eslint-disable-next-line no-use-before-define

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
	},
	components:{
		CommandLine,
		UserStatusBar,
	}
}
</script>

<style>
 .q-drawer{
  display: flex;
  flex-direction: column;
 }
</style>


