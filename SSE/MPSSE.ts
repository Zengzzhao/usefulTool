// 适用于微信小程序环境下的SSE

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

export class MPSSSE {
    private task: UniApp.RequestTask | null = null // sse请求任务
    private buffer = '' // 存储接收到的sse数据
    private options: SSEOptions // SSE配置

    constructor(options: SSEOptions) {
        this.options = options
    }

    // 小程序下监听分片数据流的回调
    private handleChunk(res: any) {
        let chunk: string | ArrayBuffer = res.data
        if (chunk instanceof ArrayBuffer) {
            const decoder = new TextDecoder()
            chunk = decoder.decode(chunk)
        }
        this.buffer += chunk
        this.parseBuffer()
    }
    // 按照SSE协议返回数据的格式解析缓存中的内容
    private parseBuffer() {
        const events = this.buffer.split('\n\n')
        this.buffer = events.pop() || ''
        events.forEach(event => {
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
    // 连接
    connect(bodyData: any) {
        // 小程序下使用分片传输实现SSE
        this.task = uni.request({
            url: this.options.url,
            method: 'POST',
            data: bodyData,
            enableChunked: true,
            success: () => { },
            fail: () => { }
        })
        this.task?.onChunkReceived(this.handleChunk.bind(this))
    }
    // 断开连接
    close() {
        this.task?.offChunkReceived(this.handleChunk.bind(this))
        this.task = null
    }
}