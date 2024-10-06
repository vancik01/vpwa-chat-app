<template>
    
    <div class="wraper" v-if="userStore.user != null">
        <div class="extend-button">
            <q-icon name="account_circle" size="40px" color="primary"></q-icon>
            <div>
                <div class="text-weight-bold">@{{ userStore.user?.nickname }}</div>
                <user-status :status="userStore.user.status" />
            </div>
            <UserAccountToolbar />
        </div>
    </div> 
    
</template>
<script setup lang="ts">
import { useUserStore } from 'src/stores/userStore';
import UserStatus from './UserStatus.vue';
import UserAccountToolbar from './UserAccountToolbar.vue';

const userStore = useUserStore();

</script>

<style scoped>
    .wraper {
        margin-top: auto;
        padding: 24px 16px;
        border-top: 1px solid #E0E0E0;
    }

    .wraper .extend-button{
        cursor: pointer;
        display: flex;
        gap: 6px;
        align-items: center;
        padding: 6px;
        border-radius: 6px;
        transition: background 0.3s;
    }

    .wraper .extend-button:hover {
        background-color: #F0F0F0;
    }

</style>