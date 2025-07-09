import { defineStore } from "pinia";
import type { chatStoreState,chatQueueEle } from './type'

export default defineStore('chat', {
    state: (): chatStoreState => {
        return {
            // 聊天对话数据队列
            chatQueue: [],
            // 问答网络交互是否正在进行中，后端服务器的响应是否到达前端
            isLoading: false,
            // 是否正在回答
            isAnswering: false,
            // 本次对话的id
            sessionId: 0,
            // 推荐问题列表
            recommendQuestionList: []
        }
    },
    actions: {
        // 添加消息到聊天对话数据队列
        addChat(chatInfo:chatQueueEle){
            this.chatQueue.push(chatInfo)
        }
    }
})