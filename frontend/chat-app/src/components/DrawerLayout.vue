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
            </div>

            <!-- status bar -->
            <div class="status-bar">
                <span>{{ userStore.user.display_name }}</span>
            </div>
        </div>
    </q-drawer>
</template>
  
<script>
import { useUserStore } from 'src/stores/userStore';

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
        padding: 1rem;
    }
    .channels-section {
        flex: 1;
        padding: 1rem;
        border-top: 1px solid #DDDDDD;
        border-bottom: 1px solid #DDDDDD;
    }
    .channels-section h6 {
        margin-top: 0.6rem;
        padding: 0; 
    }
    .status-bar {
        height: fit-content;
    }
</style>
  