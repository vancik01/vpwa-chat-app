<template>
  <div 
    class="channel-box"
    :class="{
      'active': isActive,
      'new-message': channel.has_new_messages > 0 }"
    @click="selectChannel">
    
    <q-icon v-if="channel.type === 'private'" name="lock" />
    <q-icon v-else name="tag" />
    <span class="channel-name q-px-xs">{{ channel.name }}</span>
    <div v-if="channel.has_new_messages > 0" class="new-messages">{{ channel.has_new_messages }}</div>
  </div>
</template>

<script>
import { useUserStore } from 'src/stores/userStore';
import { useChannelStore } from 'src/stores/channelStore';

export default {
  name: 'ChannelBox',
  props: {
    channel: Object,
    isActive: Boolean
  },
  data() {
    return {
      userStore: useUserStore(),
      channelStore: useChannelStore()
    };
  },
  methods: {
    selectChannel() {
      this.channelStore.current_channel = this.channel;
    }
  }
};
</script>

<style scoped>
.channel-box {
  padding: 0.4rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 0.5rem;
  max-width: 100%;
  width: 100%;
  overflow: hidden;
}

.channel-box:not(.active){
  transition: background-color 0.3s ease;
}

.channel-box.active {
  background-color: #000000BD;
  color: white;
}

.channel-box:not(.active):hover {
  background-color: #00000014;
  color: black;
}

.new-messages {
  background-color: #2196F3;
  color: white;
  border-radius: 6px;
  padding: 0.2rem 0.6rem; 
  margin-left: auto;
  min-width: 1.5rem; 
  height: 1.5rem; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  font-size: 0.75rem; 
}


.channel-name {
  flex-grow: 1; 
  overflow-wrap: break-word; 
  white-space: normal;
  overflow: hidden; 
}
</style>