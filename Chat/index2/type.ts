// 聊天对话数据队列中的每个元素
// 用户问的问题：type:'user',message:'问题',id
// AI回答：type:'assistant',message:'通过SSE获取到的MD格式的回答',id,requestId,num
export interface chatQueueEle {
    type: 'user' | 'assistant',
    message: string,
    id: number,
    num?: number
}

// 仓库中的state
export interface chatStoreState{
    chatQueue:chatQueueEle[],
    isLoading:boolean,
    isAnswering:boolean,
    sessionId:number,
    recommendQuestionList:string[]
}