<template>
    <q-drawer show-if-above :model-value="leftDrawerOpen" @update:model-value="updateDrawer" side="left" bordered>
        <div class = "drawer-layout">
            <!-- logo placeholder -->
            <div class="logo-placeholder">
                <span>App Logo</span>
            </div>
        
            <!-- channels section -->
            <div class="channels-section">
                <h6 class="text-h6 text-weight-bold">Channels</h6>
                <ChannelList/>
            </div>

            <!-- status bar -->
            <div class="status-bar">
                <UserStatusBar />
            </div>
        </div>
    </q-drawer>
</template>
  
<script>
import { useUserStore } from 'src/stores/userStore';
import UserStatusBar from './UserStatusBar.vue';
import ChannelList from './ChannelList.vue';

export default {
    props: ['leftDrawerOpen'],
  
    data() {
        return {
        userStore: useUserStore()
        };
    },

    methods: {
        updateDrawer(value) {
            this.$emit('update:leftDrawerOpen', value);
        }
    },
    components:{
        UserStatusBar,
        ChannelList
    }
}
</script>
  
<style>
    .drawer-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .logo-placeholder {
        min-height: 50px;
        display: flex;
        justify-content: start;
        align-items: center; 
        padding: 12px 16px;
    }
    .channels-section {
        flex: 1;
        padding: 1rem;
        padding-top: 0;
        margin-top: 0;
        margin-bottom: 0;
        padding-bottom: 0;
        border-top: 1px solid #DDDDDD;
        overflow-y: auto;
    }
    .channels-section h6 {
        position: sticky;
        top: 0; 
        background: white; 
        padding: 1.5rem 0; 
        margin: 0; 
        z-index: 1; 
    }
    .status-bar {
        height: fit-content;
    }
</style>
  