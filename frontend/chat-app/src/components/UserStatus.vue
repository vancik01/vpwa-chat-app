<template>
    <div class="label-wraper">
        <status-dot :status="props.status"  />
        <span>{{ getStatusLabel(props.status) }}</span>
    </div>
</template>

<script setup lang="ts">
import { getStatusLabel } from 'src/utils/statusLabelMapper';
import { UserStatus } from './models';
import StatusDot from './StatusDot.vue';
const props = defineProps<{
    status: UserStatus
}>()

</script>

<style scoped>
    .label-wraper {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .label-wraper span {
        font-size: 12px;
        color: #767676;
    }
</style>