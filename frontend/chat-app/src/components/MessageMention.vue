<template>
    <span :class="['mention-bar', isCurrentUserMentioned ? 'current-user' : '']">@{{ props.nickname }}</span>
</template>

<script lang="ts" setup>
const props = defineProps<{
    nickname: string,
    isCurrentUserMentioned:boolean
}>()
</script>

<style scoped>
.mention-bar{
    padding: 0px 4px 3px 4px;
    background-color: #C2DCF6;
    color: #1876D2;
    border-radius: 4px;
}

.mention-bar.current-user{
    background-color: #F6E4C2;
    color: #D29718;
}
</style>