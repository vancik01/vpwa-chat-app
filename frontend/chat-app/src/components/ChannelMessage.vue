<template>
    <div class="message">
        <div class="message-wraper">
            <div class="message-user">
                <span>🚀</span>
            </div>
            <div class="message-content">
                <div class="message-meta">
                    <div class="message-user-name">{{message.from.display_name}}</div>
                    <div class="message-time">{{message.sent_at}}</div>
                </div>
                <p v-html="props.message.message_content" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Message } from './models';

const props = defineProps<{
    message: Message
}>()
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

</style>