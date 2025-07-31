// 停止当前对话
export async function stopChat(data: any) {
    await fetch(import.meta.env.VITE_API_BASE + '/chat-service/v1/stop', {
        method: 'post',
        // @ts-ignore
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': 2
        },
        body: JSON.stringify(data),
    })
        .then(res => res.json())
        .then(res => {
            console.log(res);
        })
}

// 根据课程的id，type获取详细内容
export async function getDetail(data: any) {
    return await fetch(import.meta.env.VITE_API_BASE + '/app/course/card/object/gets', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => res.data.list)
}

// 恢复聊天历史记录
export async function getChatHistory(data: any) {
    return await fetch(import.meta.env.VITE_API_BASE + '/app/chat/message/list', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': '2'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => res.data.list)
}