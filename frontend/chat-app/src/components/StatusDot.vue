<template>
    <div :class="`dot ${props.status}`"></div>
</template>

<script setup lang="ts">
import { UserStatus } from './models';


const props = defineProps<{
  status: UserStatus
}>()
</script>

<style scoped>
    .dot {
        height: 6px;
        width: 6px;
        border-radius: 100%;
        background-color: aqua;
    }
    .dot.online{
        background-color: #6EE784;
    }
    .dot.dnd{
        background-color: #E7C56E;
    }
    .dot.offline{
        background-color: #CC3A3A;
    }
</style>