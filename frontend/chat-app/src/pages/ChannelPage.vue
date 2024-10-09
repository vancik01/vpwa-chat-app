<template>
  
    <section class="channel-wraper">
        <div class="channel-name">
          <q-icon v-if="channelStore.current_channel?.type === 'private'" name="lock" />
          <q-icon v-else name="tag" />
        <span>{{ channelStore.current_channel?.id }}</span>
        </div>
        <div ref="messageContainer" class="channel-messages" v-if="channelStore.messages && !channelStore.is_loading">
          <ChannelMessage
            v-for="item, i in channelStore.messages" 
            :message="item" 
            v-bind:key="`${item.sent_at}-${i}`"
        />
        </div>
    </section>
  
</template>

<script setup lang="ts">
import ChannelMessage from 'src/components/ChannelMessage.vue';
import { useChannelStore } from 'src/stores/channelStore';
import { nextTick, ref, watch } from 'vue';
const channelStore = useChannelStore()

const messageContainer = ref<HTMLElement | null>(null)

defineOptions({
  name: 'ChannelPage'
});

// scroll on new message
watch(() => channelStore.messages, async (newMessages) => {
  if (newMessages && newMessages.length) {
    // Ensure DOM has updated before scrolling
    await nextTick()

    // Scroll the container to the bottom
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }
}, { deep: true })


</script>

<style scoped>
.channel-name{
  padding: 12px 20px;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  border-bottom: 1px solid #DDDDDD;
}

.channel-name i{
  font-size: 24px;
}

.channel-messages {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: scroll;
}

.channel-messages .message:nth-of-type(1){
  margin-top: auto;

}

section.channel-wraper{
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}
</style>