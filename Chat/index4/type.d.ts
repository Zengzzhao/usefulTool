declare module 'types/chat' {
    // 单个推荐数据
    interface recommendData {
        careerDirectionId?: number,
        careerLevelId?: number,
        cover: string,
        description: string,
        id: string,
        name: string,
        type: 'package' | 'course' | 'mcourse',
        career?: {},
        duration?: number,
        tags?: string[],
        list?: recommendData[]
    }

    // 聊天对话数据队列中的每个元素
    // 用户问的问题：type:'user',message:'问题',id,num
    // AI回答：type:'assistant',message:'通过SSE获取到的MD格式的回答',id,num,recommendData
    interface chatQueueEle {
        type: 'user' | 'assistant',
        message: string,
        id: number,
        num: number,
        recommendData?: recommendData | { list: recommendData[] }
    }

    // 仓库中的state
    interface chatStoreState {
        chatQueue: chatQueueEle[],
        isLoading: boolean,
        isAnswering: boolean,
        sessionID: number,
        recommendQuestionList: string[]
    }
}
