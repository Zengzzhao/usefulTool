// 适用于H5环境下的SSE

// SSE消息
interface SSEMessage {
    event: string,
    data: string
}
// SSE配置
interface SSEOptions {
    url: string,
    onMessage: (msg: SSEMessage) => void,
    onError: (err: any) => void
}

export class H5SSE {
    private controller: AbortController | null = null // 中断控制器
    private options: SSEOptions // SSE配置

    constructor(options: SSEOptions) {
        this.options = options
    }

    // h5下使用fetch实现SSE
    private async startPostSSE(url: string, bodyData: any) {
        this.controller = new AbortController() // 创建控制器，用于后续超时主动中断请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify(bodyData),
            signal: this.controller.signal // 控制请求生命周期，实现请求超时主动中断，允许关联一个AbortSingal对象
        })
        // http错误/此浏览器不支持流式读取
        if (!response.ok || !response.body) {
            this.options.onError(response)
        }
        // 流式读取数据
        const reader = response.body?.getReader() // 流式读取器
        const decoder = new TextDecoder('utf-8') // 二进制数据解析为字符串的解析器
        while (reader) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value)
            // 按照SSE返回数据的格式解析字符串数据
            text.split('\n\n').forEach(event => {
                const msg: SSEMessage = { event: '', data: '' }
                event.split('\n').forEach(line => {
                    if (line.startsWith('data:')) {
                        msg.data = line.replace('data:', '')
                    } else if (line.startsWith('event:')) {
                        msg.event = line.replace('event:', '')
                    }
                })
                this.options.onMessage(msg)
            })
        }
    }
    // 连接
    connect(bodyData: any) {
        this.startPostSSE(this.options.url, bodyData)
    }
    // 断开连接
    close() {
        this.controller?.abort()
        this.controller = null
    }
}