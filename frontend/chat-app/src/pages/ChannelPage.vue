<template>
  
    <section class="channel-wraper">
        <div class="channel-name">
          <q-icon v-if="channelStore.current_channel?.type === 'private'" name="lock" />
          <q-icon v-else name="tag" />
          <span>{{ channelStore.current_channel?.id }}</span>
          {{ channelStore.current_channel?.type }}
        </div>
        <div class="channel-messages">
          <div v-if="channelStore.page === 0 && channelStore.is_loading" class="init-loading">
            <q-spinner-tail
              color="primary"
              size="2em"
            />
          </div>
            <q-scroll-area v-else class="message-scroll-wraper" ref="chatScroll">
              <q-infinite-scroll  @load="onLoadNew" :offset="0" reverse>
                <template  v-for="(item, i) in channelStore.messages" :key="`${item.sent_at}-${i}`">
                  <!-- Conditionally render based on the message type -->
                  <ChannelMessage
                    v-if="item.type === 'message'"
                    :message="item"
                  />
                  
                  <!-- System message rendering -->
                  <SystemMessage
                    v-if="item.type === 'system'"
                    :commandType="item.command_type"
                    :users="channelStore.current_channel?.channel_members"
                    :invitedUser="item.invited_user"/>
                </template>
                <template v-slot:loading>
                  <div class="row justify-center q-my-md">
                    <q-spinner-dots color="primary" size="40px" />
                  </div>
                </template>
              </q-infinite-scroll>
            </q-scroll-area>
        </div>
        <div class="is-typing-component">
          <strong>User Name</strong> is typing ...
        </div>
        
    </section>
</template>

<script setup lang="ts">
import { QScrollArea } from 'quasar';
import ChannelMessage from 'src/components/ChannelMessage.vue';
import SystemMessage from 'src/components/SystemMessage.vue';
import { useChannelStore } from 'src/stores/channelStore';
import { nextTick, onMounted, ref  } from 'vue';
import { useRoute } from 'vue-router';
const channelStore = useChannelStore()
const route = useRoute()

const chatScroll = ref<null | QScrollArea>()

defineOptions({
  name: 'ChannelPage'
});

async function onLoadNew(index: number, done: VoidFunction) {
  channelStore.page = index;
  channelStore.is_loading = true;
  const newMessages = await channelStore.loadMessages(index);
  channelStore.messages.unshift(...newMessages);
  channelStore.is_loading = false;
  done();
}

onMounted(() => {
  if(route.params.id){
    channelStore.setCurrentChannel(route.params.id as string)
  }
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatScroll.value) {
      chatScroll.value.setScrollPercentage('vertical', 200)
    }
  });
};

channelStore.$onAction(({ name, after }) => {
      if (name === 'postMessage') {
        after(() => {
          // Scroll to bottom after a new message is added
          console.log('Wocap')
          scrollToBottom();
        });
      }
    });

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
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 20px;
}

.message-scroll-wraper{
  height: 100%;
}
.message-scroll-wraper-wraper{
  height: 100%;
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

.channel-messages .message:nth-of-type(1){
  margin-top: auto;
}

.channel-messages {
  position: relative;
}

.is-typing-component{
  position: absolute;
  padding: 4px 20px;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
}

.init-loading{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>