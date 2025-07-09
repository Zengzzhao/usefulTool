<template>
    <!-- 顶部标题 -->
    <view class="nav">chat</view>
    <!-- 聊天记录 -->
    <scroll-view class="scroll-container" scroll-y @scroll="scrollViewScroll" :scroll-top="scrollTop">
        <view v-if="chatStore.chatQueue.length">
            <!-- 每个问答对 -->
            <view v-for="(item, index) in chatStore.chatQueue" :key="index" class="QAgroup">
                <!-- 用户问的问题 -->
                <view v-if="item.type == 'user'" class="question">
                    <view class="questionCard">
                        {{ item.message }}
                    </view>
                </view>
                <!-- AI的回答 -->
                <view v-else class="answer">
                    <answer-card :content="item.message"
                        :is-last-chat="index === chatStore.chatQueue.length - 1"></answer-card>
                </view>
            </view>
            <!-- 最后一个回答后面的推荐问题 -->
            <view class="recommend_question_container"
                v-if="chatStore.recommendQuestionList.length && !chatStore.isAnswering">
                <view class="recommend_question_item" v-for="(question, index) in chatStore.recommendQuestionList"
                    :key="index" @tap='clickRecommendQuestion(question)'>
                    {{ question }}
                </view>
            </view>
        </view>
        <view v-else>
            <text>下方输入框输入内容开始对话吧</text>
        </view>
    </scroll-view>
    <!-- 底部问题输入框 -->
    <view class="footer">
        <input class="input" type="text" v-model="inputVal">
        <button class="btn" @tap="send">发送</button>
    </view>
</template>

<script setup lang='ts'>
import { SSE } from '@/common/sseService'
import { nextTick, onMounted, ref } from 'vue'
import { pageStore } from '@/store'
import AnswerCard from './components/AnswerCard.vue'

const { useChatStore } = pageStore
const chatStore = useChatStore()
const inputVal = ref('') // 输入框输入问题
const viewScrollViewHeight = ref(0)
const autoScroll = ref(true) // 是否自动滚动
const scrollTop = ref(0) // scroll-view到顶部的距离
// SSE服务实例
const sseInstance = new SSE({
    url: 'xxxxx',
    onMessage: (event) => {
        // 设置当前正在回答问题中，后端服务器的响应已经到达前端
        chatStore.isAnswering = true
        chatStore.isLoading = false
        // 当前消息队列最后一个消息（当前回答）
        const lastChat = chatStore.chatQueue[chatStore.chatQueue.length - 1]
        // 解析SSE的响应
        const data = JSON.parse(event.data)
        const { code, data: innerData } = data
        if (code == 0) {
            const { content = '', status, recommendQuestions, sessionID } = innerData
            if (status !== 'stopped') {
                // 当前响应的状态不是停止时，将响应的内容添加md中
                lastChat.message += content
                if (autoScroll.value) {
                    scrollToBottom()
                }
            }
            // 首次对话，还没有sessionId，将后端返回的seesionId保存
            if (!chatStore.seesinId) {
                chatStore.seesinId = sessionID
            }
            // 保存当前推荐问题
            if (recommendQuestions) {
                chatStore.recommendQuestionList = recommendQuestions
            }
            // 此次问答的回答已全部完成，设置当前不在回答问题了
            if (status == 'completed') {
                chatStore.isAnswering = false
                if (autoScroll.value) {
                    scrollToBottom()
                }
            }
        }
    }
})

// 发送消息
const send = () => {
    // 存储当前问题
    const curQuestion = inputVal.value
    // 将当前问题组装添加到仓库的聊天对话数据队列中
    chatStore.addChat({
        type: 'user',
        message: curQuestion,
        id: Date.now()
    })
    // 清空当前输入框的内容
    inputVal.value = ''
    // 组装初始AI回答结构到仓库中
    chatStore.addChat({
        type: 'assistant',
        message: '',
        id: Date.now(),
    })
    // 设置当前网络交互正在进行中，后端服务器响应还未到前端
    chatStore.isLoading = true
    // 组件SSE请求的body参数
    const params: any = {
        message: curQuestion,
        serviceType: 90,
        userID: 2
    }
    // 非首次问答，将之前的sessionId携带
    if (chatStore.sessionId) {
        params['sessionId'] = chatStore.sessionId
    }
    // SSE发送请求
    sseInstance.connect(params)
}
// 点击了推荐问题
function clickRecommendQuestion(question: string) {
    // 将当前双向绑定的输入框内容赋值为当前选择的推荐问题，之后发送消息
    inputVal.value = question
    send()
}
// 滑动组件滑动时的处理函数，用于确保用户手动滚动远离底部时自动停止滚动功能
// 确保当用户专注于阅读上方内容时不会被强制拉到底部，当用户已经在底部时会自动跟随新消息滚动
function scrollViewScroll(event: any) {
    const { scrollTop: curViewScrollTop, scrollHeight } = event.detail
    const threshold = 50 // 自动滚动时距离底部的阈值
    autoScroll.value = curViewScrollTop + viewScrollViewHeight.value >= scrollHeight - threshold
}
// 让scroll-view滚动到底部的方法
function scrollToBottom() {
    scrollTop.value = 0
    nextTick(() => {
        scrollTop.value = 9999999999
    })
}

// 生命周期
onMounted(() => {
    // 元素挂载完毕时，将scroll-view的可视高度保存
    uni.createSelectorQuery().select('.scroll-container').boundingClientRect((rect: any) => {
        viewScrollViewHeight.value = rect.height
    }).exec()
})

</script>

<style scoped lang="scss">
@use './index.scss';
</style>