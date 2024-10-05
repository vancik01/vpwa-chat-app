<template>
    <q-menu anchor="bottom left" self="top left" class="account-toolbar">
        <div class="toolbar-content">
            <div class="category status">
                <span class="item-wrap-title">Set status</span>
                <div class="menu-items-wrap">
                    <div v-bind:key="item" v-for="item in status" :class="`item ${item} ${item === userStore.user?.status ? 'active' : ''}`" @click="userStore.setStatus(item)">
                        <StatusDot :status="item" /> <span>{{ getStatusLabel(item) }}</span>
                    </div>
                </div>
            </div>

            <div class="category notifications">
                <span class="item-wrap-title">Notifications</span>
                <div class="menu-items-wrap">
                    <div class="item">
                        <StatusDot :status="'online'" /> <span>All</span>
                    </div>
                    <div class="item">
                        <StatusDot :status="'dnd'" /> <span>Only mentions</span>
                    </div>
                </div>
            </div>
            <div class="divider"></div>
            <div class="category logout">
                <div class="menu-items-wrap">
                    <div class="item" @click="userStore.logout()">
                        Log out <q-icon name="logout"></q-icon>
                    </div>
                </div>
            </div>
        </div>
    </q-menu>
</template>

<script setup lang="ts">
import { getStatusLabel } from 'src/utils/statusLabelMapper';
import { UserStatus } from './models';
import StatusDot from './StatusDot.vue';
import { useUserStore } from 'src/stores/userStore';

const status:UserStatus[] = ['online', 'dnd', 'offline']
const userStore = useUserStore()

</script>

<style>
    .account-toolbar.q-menu {
        box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.10) !important;
        min-width: 230px !important;
        border-radius: 6px;
        border: 1px solid #EAEAEA;
        background: #F7F7F7;
        padding: 12px 16px;
    }

    .account-toolbar .toolbar-content{
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .account-toolbar .item-wrap-title{
        color: #5A5A5A;
        font-size: 12px;
        font-style: normal;
        font-weight: 900;
    }

    .account-toolbar .menu-items-wrap{
        display: flex;
        flex-direction: column;
    }

    .account-toolbar .item{
        display: flex;
        padding: 4px 8px;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
        border-radius: 6px;
    }

    .account-toolbar .item:hover, .account-toolbar .item.active {
        background-color: #EDEDED;
    }

    .account-toolbar .divider{
        height: 1px;
        width: 100%;
        background-color: #EEE;
    }

    .account-toolbar .category.logout{
        color: #CC3A3A;
    }
</style>