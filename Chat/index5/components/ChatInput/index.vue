<template>
    <view class="container">
        <input class="input" type="text" v-model="inputVal">
        <button class="stop" v-if="(chatStore.isLoading || chatStore.isAnswering) && chatStore.sessionID"
            @tap="stopAnswer"></button>
        <button @tap="send" :disabled="!inputVal" v-else>发送</button>
    </view>
</template>

<script setup lang='ts'>
import { pageStore } from '@/store';
import { ref, watch } from 'vue';

const { useChatStore } = pageStore
const chatStore = useChatStore()
interface Props {
    value: string
}
const props = defineProps<Props>()
const emits = defineEmits<{
    (e: 'update:value', value: string): void,
    (e: 'stop'): void,
    (e: "send"): void
}>()
const inputVal = ref('')
watch(() => props.value, (newVal) => {
    inputVal.value = newVal
})
watch(inputVal, () => {
    emits('update:value', inputVal.value)
})

function stopAnswer() {
    emits('stop')
}
function send() {
    emits('send')
}
</script>

<style scoped lang="scss">
@use './index.scss'
</style>