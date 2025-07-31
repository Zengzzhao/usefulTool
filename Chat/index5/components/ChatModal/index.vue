<!-- AI聊天助手浮层，悬浮在页面右下角作为聊天助手，点开后输入文字即可展开对话记录 -->
<template>
    <!-- 对话模态框 -->
    <template v-if="isModalOpen">
        <!-- 对话界面 -->
        <view v-if="showPageModal" class="page_modal" :style="{ maxHeight: `calc(100vh - 88rpx)` }">
            <!-- 关闭按钮 -->
            <view>
                <uni-icons type="closeempty" size="26" @tap="closeChatPage" />
            </view>
            <!-- 对话记录 -->
            <ChatContent type="modal" :question="question"></ChatContent>
        </view>
        <!-- 输入框 -->
        <view v-else>
            <view class="mask" @tap="closeModal">
                <view class="input_container" @tap.stop>
                    <ChatInput v-model:value="question" @send="send" />
                </view>
            </view>
        </view>
    </template>
    <!-- AI悬浮头像 -->
    <view v-else class="chat_entry" @tap="isModalOpen = true"></view>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import ChatInput from '@/components/ChatInput/index.vue'
import ChatContent from '@/components/ChatContent/index.vue'
import { pageStore } from '@/store';

// 数据仓库
const { useChatStore } = pageStore
const chatStore = useChatStore()

const isModalOpen = ref(false) // 是否打开对话模态框，否则显示AI悬浮头像，是则显示对话模态框
const showPageModal = ref(false) // 是否打开聊天界面的模态框，否则显示输入框的模态框，是则显示聊天界面的模态框
const question = ref('') // 输入的问题

// 关闭模态框变为AI悬浮头像，将数据初始化
const closeModal = () => {
    isModalOpen.value = false
    showPageModal.value = false
}
// 点击了关闭对话界面的事件处理：关闭蒙层模态框显示最初的AI悬浮头像，初始化对话聊天仓库
const closeChatPage = () => {
    closeModal()
    chatStore.initStore()
}
// 输入框发送消息
const send = () => {
    chatStore.initStore()
    showPageModal.value = true
}

</script>

<style scoped lang="scss">
@use './index.scss'
</style>