<template>

  <section class="channel-wraper">
    <div class="channel-name">
      <q-icon v-if="channelStore.current_channel?.type === 'private'" name="lock" />
      <q-icon v-else name="tag" />
      <span>{{ channelStore.current_channel?.id }}</span>
    </div>
    <div class="channel-messages">
      <div v-if="channelStore.page === 0 && channelStore.is_loading" class="init-loading">
        <q-spinner-tail color="primary" size="2em" />
      </div>
      <q-scroll-area v-else class="message-scroll-wraper" ref="chatScroll">
        <q-infinite-scroll @load="onLoadNew" :offset="0" reverse>
          <template v-for="(item, i) in channelStore.messages" :key="`${item.sent_at}-${i}`">
            <!-- Conditionally render based on the message type -->
            <ChannelMessage v-if="item.type === 'message'" :message="item" />

            <!-- System message rendering -->
            <SystemMessage v-if="item.type === 'system'" :commandType="item.command_type" :users="channelStore.members"
              :invitedUser="item.invited_user" />
          </template>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </q-scroll-area>
    </div>

    <div v-if="typingUsers.length > 0" class="is-typing-component">
      <div v-if="typingUsers.length === 1">
        <strong @click="viewUserTyping = true; selectedUserId = String(typingUsers[0]?.id)" class="user-id">{{ typingUsers[0]?.display_name }}</strong> is typing
        <span class="spinner"><q-spinner-dots color="grey" size="1.3em" /></span>
      </div>
      <div v-else-if="typingUsers.length === 2">
        <strong @click="viewUserTyping = true; selectedUserId = String(typingUsers[0]?.id)" class="user-id">{{ typingUsers[0]?.display_name }}</strong> and
        <strong @click="viewUserTyping = true; selectedUserId = String(typingUsers[1]?.id)" class="user-id">{{ typingUsers[1]?.display_name }}</strong> are typing
        <span class="spinner"><q-spinner-dots color="grey" size="1.3em" /></span>
      </div>
      <div v-else-if="typingUsers.length === 3">
        <strong @click="viewUserTyping = true; selectedUserId = String(typingUsers[0]?.id)" class="user-id">{{ typingUsers[0]?.display_name }}</strong>,
        <strong @click="viewUserTyping = true; selectedUserId = String(typingUsers[1]?.id)" class="user-id">{{ typingUsers[1]?.display_name }}</strong>, and
        <strong @click="viewUserTyping = true; selectedUserId = String(typingUsers[2]?.id)" class="user-id">{{ typingUsers[2]?.display_name }}</strong> are typing
        <span class="spinner"><q-spinner-dots color="grey" size="1.3em" /></span>
      </div>
      <div v-else>
        <span>Several people are typing</span>
        <span class="spinner"><q-spinner-dots color="grey" size="1.3em" /></span>
      </div>
    </div>

    <div v-if="viewUserTyping" class="is-typing-component">
      <strong v-if="selectedUserId" @click="viewUserTyping = false; selectedUserId = null" class="user-id">
        {{ typingUsers.find(user => user?.id === parseInt(String(selectedUserId)))?.display_name }}
      </strong>
      <div v-if="selectedUserId" class="text-user-id">{{ typingContents[selectedUserId] }}</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { QScrollArea } from 'quasar';
import ChannelMessage from 'src/components/ChannelMessage.vue';
import SystemMessage from 'src/components/SystemMessage.vue';
import { useChannelStore } from 'src/stores/channelStore';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
const channelStore = useChannelStore()
const route = useRoute()
const chatScroll = ref<null | QScrollArea>()
let viewUserTyping = ref(false)
let selectedUserId = ref<string | null>(null);


defineOptions({
  name: 'ChannelPage'
});

const typingUsers = computed(() => {
  const typingStatus: Record<string, string> = channelStore.typingStatus[channelStore.current_channel?.id || ''] || {};
  return Object.keys(typingStatus).map(userId => {
    const member = channelStore.members.find(member => member.id === parseInt(userId));
    return member ? { ...member, content: typingStatus[userId] } : null;
  }).filter(Boolean);
});

const typingContents = computed(() => {
  const typingStatus: Record<string, string> = channelStore.typingStatus[channelStore.current_channel?.id || ''] || {};
  return typingStatus;
});

watch([typingUsers, selectedUserId], ([newTypingUsers, newSelectedUserId]) => {
  const user = newTypingUsers.find(user => user?.id === parseInt(String(newSelectedUserId)));
  if (!user) {
    viewUserTyping.value = false;
    selectedUserId.value = null;
  }
});

async function onLoadNew(index: number, done: VoidFunction) {
  if (channelStore.is_last_page) {
    done()
    return
  }

  channelStore.is_loading = true;
  console.log(channelStore.page, channelStore.is_loading)
  const newMessages = await channelStore.loadMessages(channelStore.page);

  if (newMessages.length === 0) {
    channelStore.is_last_page = true
  } else {
    channelStore.page = channelStore.page + 1
    channelStore.messages.unshift(...newMessages);
  }
  channelStore.is_loading = false;
  done();
}


onMounted(async () => {
  if (route.params.id) {
    setTimeout(() => {
      channelStore.setCurrentChannel(route.params.id as string);
    }, 0)
  }
});


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
      scrollToBottom();
    });
  } else if (name === 'setCurrentChannel') {
    after(() => {
      scrollToBottom()
    })
  } else if (name === 'newMessage') {
    after(() => {
      if (chatScroll.value) {
        const percent = chatScroll.value.getScrollPercentage()
        console.log(percent)
        if (percent.top * 100 > 90) {
          scrollToBottom()
        }
      }
    })
  }

});

</script>

<style scoped>
.channel-name {
  padding: 12px 20px;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  border-bottom: 1px solid #DDDDDD;
}

.channel-name i {
  font-size: 24px;
}

.channel-messages {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 20px;
}

.message-scroll-wraper {
  height: 100%;
}

.message-scroll-wraper-wraper {
  height: 100%;
}

section.channel-wraper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}

.channel-messages .message:nth-of-type(1) {
  margin-top: auto;
}

.channel-messages {
  position: relative;
}

.is-typing-component {
  position: absolute;
  padding: 4px 20px;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
}

.user-id {
  cursor: pointer;
}

.text-user-id {
  font-size: 13px;
  color: rgb(42, 42, 42);
  padding: 5px 0;
  margin-bottom: 0;
}

.spinner {
  margin-left: 4px;
}

.init-loading {
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

<style>
.q-infinite-scroll__loading.invisible {
  display: none;
}

.q-scrollarea__content.absolute {
  display: flex;
  flex-direction: column;
  justify-content: end;
}
</style>