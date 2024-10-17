<template>
    <div v-if="userStore.invitations.length > 0" class="invitation-wrapper">
      <span class="invitation-heading">Channel Invitations</span>
  
      <div 
        v-for="(channel, index) in userStore.invitations" 
        :key="index" 
        class="invitation-item"
        @mouseover="hoveredChannel = channel.id"
        @mouseleave="hoveredChannel = null"
        @click="toggleActions(channel.id)">
        <ChannelBox :channel="channel" :isActive="false" :isInvitation="true"/>
  
        <div v-if="hoveredChannel === channel.id" class="actions">
            <div class="icon-wrapper yes-icon" @click="userStore.acceptInvitation(channel.id)">
          <q-icon name="check" />
        </div>
        <div class="icon-wrapper no-icon" @click="userStore.rejectInvitation(channel.id)">
          <q-icon name="close" />
        </div>
        </div>
      </div>
    </div>
</template>
  

<script>
import { useUserStore } from 'src/stores/userStore';
import ChannelBox from './ChannelBox.vue';

export default {
  name: 'ChannelInvitations',
  components: {
    ChannelBox
  },
  data() {
    return {
      hoveredChannel: null
    };
  },
  computed: {
    userStore() {
      return useUserStore();
    }  
  },
  methods: {
    toggleActions(channelId) {
      this.hoveredChannel = this.hoveredChannel === channelId ? null : channelId;
    }
  }
};
</script>


<style scoped>
  .invitation-wrapper {
    background-color: #E2F2FF;
    padding: 0.5rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .invitation-item {
    position: relative;
    margin: 0.1rem 0;
    display: flex;
    align-items: center;
  }

  .invitation-heading {
    font-size: small;
    font-weight: bold;
    color: #5A5A5A;
  }

  .actions {
    display: flex;
    gap: 10px;
    position: absolute;
    right: 1rem;
  }

  .icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    cursor: pointer;
  }

  .yes-icon {
    background-color: #318525;
  }

  .no-icon {
    background-color: #CC3A3A;
  }

  .q-icon {
    color: white;
  }
</style>