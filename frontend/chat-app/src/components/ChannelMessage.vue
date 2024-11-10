<template>
    <div class="message" v-if="props.message.type === 'message'">
        <div class="message-wraper">
            <div class="message-user">
                <span>💬</span>
                <div class="message-user-status">
                    <StatusDot v-if="props.message.from" :status="props.message.from.status" />
                </div>
            </div>
            <div class="message-content">
                <div class="message-meta">
                    <div class="message-user-name">{{message.type == "message" ? message.from?.display_name : "Bot"}}</div>
                    <div class="message-time">{{moment(message.sent_at).toLocaleString()}}</div>
                </div>
                <p>
                    <template v-for="(content, index) in parseMessageContent(props.message.messageContent)" :key="index">
                        <component v-if="typeof content === 'object'" :is="content" />
                        <span v-else v-html="content"></span>
                    </template>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { h, VNode } from 'vue';
import { usernameRegex } from 'src/utils/regex';
import { Message } from './models';
import StatusDot from './StatusDot.vue';
import MessageMention from './MessageMention.vue';
import { useUserStore } from 'src/stores/userStore';
import moment from 'moment'

const userStore = useUserStore()
const props = defineProps<{
    message: Message
}>()

function parseMessageContent(messageContent: string): (string | VNode)[] {
    const parts: string[] = messageContent.split(usernameRegex);
    const matches = [...messageContent.matchAll(usernameRegex)];

    const result: (string | VNode)[] = [];

    parts.forEach((part, index) => {
        if (part) {
            result.push(part);
        }
        if (matches[index]) {
            const nickname = matches[index][0].substring(1);
            result.push(h(MessageMention, { nickname: nickname, isCurrentUserMentioned: userStore.user ? userStore.user.nickname === nickname : false }));
        }
    });

    return result;
}
</script>

<style scoped>
.message {
    padding: 12px 20px;
    transition: background-color .3s;
    background-color: #fff;
}

.message:hover {
    background-color: #FAFAFA;
}
.message-user{
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 36px;
    width: 36px;
    margin-top: 6px;
    border-radius: 6px;
    background-color: #ECECEC;
}
.message-wraper{
    display: flex;
    gap: 10px;
}

.message-content {
    width: 100%;
}

.message-content p {
    padding-top: 2px;
    font-size: 15px;
    font-weight: 400;
    margin: 0px;
}

.message-user-name{
    font-size: 15px;
    font-weight: 700;
}

.message-time{
    color: var(--Black, #000);
    font-size: 12px;
    font-style: normal;
    font-weight: 300;
}

.message-meta{
    display: flex;
    gap: 24px;
    align-items: center;
}

.message-user{
    position:relative;
}

.message-user-status{
    position: absolute;
    right: -2px;
    bottom: -0px;
}
</style>