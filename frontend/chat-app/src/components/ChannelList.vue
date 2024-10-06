<template>
    <div>
        <ChannelBox 
        v-for="(channel, index) in userStore.channels" 
        :key="index" 
        :channel="channel"
        :isActive="channel.id === channelStore.current_channel?.id"
        class="channel-item"/>

        <div class="button-div">
        <q-btn no-caps
            align="left"
            label="Create channel"
            icon="add"
            class="full-width create-channel-btn"
            @click="createChannel"/>
        </div>
    </div>
</template>

<script>
import { useUserStore } from 'src/stores/userStore';
import { useChannelStore } from 'src/stores/channelStore';
import ChannelBox from './ChannelBox.vue';

export default {
    components: {
        ChannelBox
    },

    data() {
        return {
        userStore: useUserStore(),
        channelStore: useChannelStore()
        };
    },

    methods: {
        createChannel() {
        }
    }   
}
</script>

<style scoped>
    .channel-item {
        margin-bottom: 0.2rem;
    }
    .create-channel-btn {
        border-radius: 0.5rem;
    }
    .button-div {
        position: sticky;
        bottom: 0;
        background: white;
        padding: 1rem 0;
        margin: 0;
        z-index: 1;
    }
</style>