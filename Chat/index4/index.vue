<template>
    <view>
        <!-- 顶部标题 -->
        <view class="nav">
            <text>chat</text>
            <view class="text" @tap="newChat">新对话</view>
        </view>
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
                        <answer-card :content="item.message" :is-last-chat="index === chatStore.chatQueue.length - 1"
                            :recommend-data="item.recommendData"></answer-card>
                        <!-- 重新生成回答 -->
                        <view
                            v-if="!chatStore.isLoading && !chatStore.isAnswering && index === chatStore.chatQueue.length - 1">
                            <view class="refresh_icon" @tap="refreshAnswer(item)"></view>
                        </view>
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
            <button class="stop" v-if="(chatStore.isLoading || chatStore.isAnswering) && chatStore.sessionID"
                @tap="stopAnswer"></button>
            <button @tap="send" :disabled="!inputVal" v-else>发送</button>
        </view>
    </view>
</template>

<script setup lang='ts'>
import { SSE } from '@/common/sseService'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { pageStore } from '@/store'
import AnswerCard from './components/AnswerCard.vue'
import { stopChat, getDetail } from './api'
import { onLoad } from '@dcloudio/uni-app'

const { useChatStore } = pageStore
const chatStore = useChatStore()
const inputVal = ref('') // 输入框输入问题
const viewScrollViewHeight = ref(0)
const autoScroll = ref(true) // 是否自动滚动
const scrollTop = ref(0) // scroll-view到顶部的距离
// SSE服务实例
const sseInstance = new SSE({
    url: import.meta.env.VITE_API_BASE + '/chat-service/v1/chat',
    onMessage: (event) => {
        // 设置当前正在回答问题中，后端服务器的响应已经到达前端
        chatStore.isAnswering = true
        chatStore.isLoading = false
        // 当前消息队列最后一个消息（当前回答）
        const lastChat = chatStore.chatQueue[chatStore.chatQueue.length - 1]
        // 当前消息队列中倒数第二个消息（最后一个用户问题）
        const lastQuestion = chatStore.chatQueue[chatStore.chatQueue.length - 2]
        // 解析SSE的响应
        const data = JSON.parse(event.data)
        const { code, data: innerData } = data
        if (code == 0) {
            const { content = '', num, status, recommends, recommendQuestions, sessionID } = innerData
            if (status !== 'stopped') {
                // 当前响应的状态不是停止时，将响应的内容添加md中
                lastChat.message += content
                if (autoScroll.value) {
                    scrollToBottom()
                }
            }
            // 首次对话，还没有sessionID，将后端返回的seesionId保存
            if (!chatStore.sessionID) {
                chatStore.sessionID = sessionID
            }
            // 记录当前回答在本轮会话中的次序
            if (num) {
                lastChat.num = num
                lastQuestion.num = num - 1
            }
            // 保存当前推荐问题
            if (recommendQuestions) {
                chatStore.recommendQuestionList = recommendQuestions
            }
            // 判断是否有推荐内容
            if (recommends && recommends.length) {
                parseRecommend(recommends)
            }
            // 此次问答的回答已全部完成，设置当前状态为不在回答问题了
            if (status == 'completed') {
                chatStore.isAnswering = false
                if (autoScroll.value) {
                    scrollToBottom()
                }
            }
        }
    }
})

// 解析响应中的推荐内容
async function parseRecommend(recommendData: any) {
    // 获取最后一条回答
    const lastAnswerItem = chatStore.chatQueue[chatStore.chatQueue.length - 1]
    // 构造初始数据
    let recommend: any = {
        list: []
    }
    const recommendDetail = await getDetail({
        list: recommendData.map((item: any) => {
            return {
                id: item.id,
                type: item.type
            }
        })
    })
    recommendDetail.forEach((item: any, index: number) => {
        let info = (item.type == 'course' || item.type == 'package') ? item.collection : item.mcourse
        info.type = item.type
        if (index == 0) {
            recommend = {
                list: recommend.list,
                ...info
            }
        } else {
            recommend.list.push(info)
        }
    });
    // 给最后一条回答加上推荐内容
    lastAnswerItem.recommendData = recommend
    nextTick(() => {
        scrollToBottom()
    })
}
// 发送消息
const send = () => {
    // 存储当前问题
    const curQuestion = inputVal.value
    // 将当前问题组装添加到仓库的聊天对话数据队列中
    chatStore.addChat({
        type: 'user',
        message: curQuestion,
        id: Date.now(),
    })
    // 清空当前输入框的内容
    inputVal.value = ''
    // 获取回答
    getAnswer(curQuestion)
}
/**
 * 获取问题答案
 * @param curQuestion 问题 
 * @param num 当前问题在历史聊天中的索引（第几个），正常问答可不传递num，如果是刷新回答则需要传递num（现在来看传了就行，不过我约定传递的num为当前需要刷新问题的num）
 */
function getAnswer(curQuestion: string, num?: number) {
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
    if (num) {
        params.num = num
    }
    // 非首次问答，将之前的sessionID携带
    if (chatStore.sessionID) {
        params['sessionID'] = chatStore.sessionID
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
// 刷新回答
function refreshAnswer(messageInfo: any) {
    // 将当前仓库中聊天消息队列中最后一个元素弹出队列
    chatStore.popChat()
    chatStore.isLoading = true
    // 找到消息队列中最后一个消息
    const lastQuestionItem = chatStore.chatQueue[chatStore.chatQueue.length - 1]
    getAnswer(lastQuestionItem.message, messageInfo.num)
}
// 停止回答
async function stopAnswer() {
    // 像服务器发生请求停止回答
    await stopChat({
        userId: 2,
        sessionID: chatStore.sessionID,
        stop: true
    })
    // 设置isLoading，isAnswering状态
    chatStore.isLoading = false
    chatStore.isAnswering = false
    // 对仓库中消息队列中最后一条消息处理
    const lastAnswerItem = chatStore.chatQueue[chatStore.chatQueue.length - 1]
    // 若当前服务器还没有响应回答则将回答显示为对话已停止，否则就显示服务器响应的回答
    if (!lastAnswerItem.message) {
        lastAnswerItem.message = '对话已停止'
    }
    // 关闭SSE
    sseInstance.close()
}
// 新建立对话
async function newChat() {
    // 如果正在对话先停止对话
    if (chatStore.isAnswering || chatStore.isLoading) {
        await stopAnswer()
    }
    uni.showToast({
        title: '新对话',
        icon: 'none'
    })
    // 将仓库数据初始化
    chatStore.initStore()
    // 重定向到当前页面，但不携带参数，清除URL上的sessionID
    uni.redirectTo({
        url: '/pages/chat/index'
    })
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
    // 先重置滚动位置，然后平滑滚动到底部
    scrollTop.value = 0
    nextTick(() => {
        // 使用一个合理的大数值，实现滚动
        scrollTop.value = 9999999999
    })
}

// 生命周期
// 首次加载时若传递了sessionID则恢复历史对话记录
onLoad((options) => {
    const { sessionID } = options || {}
    if (sessionID) {
        console.log('恢复历史记录', sessionID);
        // 初始化仓库状态，并保留当前sessionID
        chatStore.initStore()
        chatStore.sessionID = sessionID - 0
        uni.showToast({
            title: '恢复历史记录',
            icon: 'none'
        })
        // 发送网络请求获取历史对话
        chatStore.getChatHistory({
            sessionId: chatStore.sessionID,
            page: 1,
            size: 99
        }).then((chatMessageQueue: any) => {
            // chatMessageQueue即为时间从前到后的聊天记录
            chatMessageQueue.forEach((message: any, index: number) => {
                if (message.num !== -1) {
                    const contentBody = JSON.parse(message.contentBody)
                    const num = message.num
                    // AI的回答(contentBody为{role:'assistant',content:'',},content是MD格式的回答/推荐内容则为回答+推荐内容)
                    try {
                        const { summary, recommends } = JSON.parse(contentBody.content)
                        // 非推荐内容回答直接使用content中的内容
                        let message = contentBody.content
                        // 推荐内容回答使用解析后的summary
                        if (summary) {
                            message = summary
                        }
                        chatStore.addChat({
                            id: Date.now(),
                            type: contentBody.role,
                            message,
                            num
                        })
                        if (recommends) {
                            parseRecommend(recommends)
                        }
                    }
                    // 用户的问题(contentBody为{type: 'user', content: ''},content中就是字符串问题内容)
                    catch {
                        chatStore.addChat({
                            id: Date.now(),
                            type: contentBody.role,
                            message: contentBody.content,
                            num
                        })
                    }
                }
            })
            setTimeout(() => {
                scrollToBottom()
            }, 100)
        })
    }
})
// 挂载完毕，将scroll-view的可视高度保存
onMounted(() => {
    // 元素挂载完毕时，将scroll-view的可视高度保存
    uni.createSelectorQuery().select('.scroll-container').boundingClientRect((rect: any) => {
        viewScrollViewHeight.value = rect.height
    }).exec()
})
// 卸载时断开SSE，将仓库中的数据初始化
onUnmounted(() => {
    sseInstance.close()
    chatStore.initStore()
})
</script>

<style scoped lang="scss">
@use './index.scss';
</style>