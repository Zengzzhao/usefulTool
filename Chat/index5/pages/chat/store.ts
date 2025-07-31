import { defineStore } from "pinia";
import type { chatStoreState, chatQueueEle } from 'types/chat'
import { getChatHistory } from "./api";

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
            sessionID: 0,
            // 推荐问题列表
            recommendQuestionList: []
        }
    },
    actions: {
        // 添加消息到聊天对话数据队列
        addChat(chatInfo: chatQueueEle) {
            this.chatQueue.push(chatInfo)
        },
        // 删除聊天对话数据队列中最后一个元素
        popChat() {
            this.chatQueue.pop()
        },
        // 初始化仓库状态
        initStore() {
            this.chatQueue = []
            this.isLoading = false
            this.isAnswering = false
            this.sessionID = 0
            this.recommendQuestionList = []
        },
        // 获取聊天历史记录
        getChatHistory(data: any) {
            return new Promise((resolve, reject) => {
                getChatHistory(data).then(res => {
                    // 按照num递增排序
                    const chatMessageQueue = res.sort((a: any, b: any) => a.num - b.num)
                    resolve(chatMessageQueue)
                }).catch(err=>reject(err))
            })
        }
    }
})