// 预加载项接口
interface ProloadItem {
    url: string, // 资源url
    priority: number, // 优先级
    retryCount: number, // 失败后重试次数
    loaded: boolean, // 是否已加载
    loading: boolean // 是否正在加载
}
// 预加载器配置接口
interface ProloadConfig {
    maxConcurrent: number // 最大并发数
    maxRetry: number // 最大重试次数
    batchSize: number // 批次大小
}

// 图片预加载器类
class ImagePreloader {
    private queue: ProloadItem[] = [] // 预加载队列
    private loadedCache = new Set<string>() // 已加载缓存
    private loadingCount = 0 // 当前加载中的数量
    private isIdle = false // 是否空闲，初始为false
    private manualPaused = false // 是否手动暂停
    private config: ProloadConfig // 加载器配置

    constructor(config?: Partial<ProloadConfig>) {
        this.config = {
            maxConcurrent: 2,
            maxRetry: 2,
            batchSize: 3,
            ...config
        }
        this.init()
    }
    // 初始化
    private init() {
        this.startIdleDetection()
    }
    // 空闲检测
    private startIdleDetection() {
        window.requestIdleCallback(() => {
            // 在空闲时将isIdle设为true
            this.isIdle = true
            console.log('空闲检测--当前状态为空闲')
            this.processQueue()
            // 设置一个微任务，在当前空闲回调完成后将isIdle重置为false
            Promise.resolve().then(() => {
                if (!this.manualPaused) {
                    this.isIdle = false
                }
            })
            // 无论如何都继续检测
            this.startIdleDetection()
        })
    }
    // 处理预加载资源队列
    private async processQueue() {
        // 手动关闭了 或者 不是空闲 或者 当前加载中数量超过最大并发数
        if (this.manualPaused || !this.isIdle || this.loadingCount >= this.config.maxConcurrent) {
            return
        }
        const batch = this.queue
            // 过滤掉已经加载完毕的 和 正在加载的，留下还未加载的 
            .filter(item => !item.loaded && !item.loading)
            .slice(0, Math.min(this.config.batchSize, this.config.maxConcurrent - this.loadingCount))
        if (!batch.length) return
        // 并发加载批次中的图片
        const promises = batch.map(item => this.loadImage(item))
        await Promise.allSettled(promises)
    }
    // 加载单张图片
    private async loadImage(item: ProloadItem) {
        // 已经在加载 或者 加载中 则不再加载了
        if (item.loaded || item.loading) return
        item.loading = true
        this.loadingCount++
        try {
            await this.loadImagePromise(item.url)
            item.loaded = true
            this.loadedCache.add(item.url)
            console.log(`图片预加载成功，${item.url}`);
        } catch (err) {
            item.retryCount = (item.retryCount || 0) + 1
            // 超过最大重试次数，移除该预加载项
            if (item.retryCount >= this.config.maxRetry) {
                this.queue = this.queue.filter(qItem => qItem.url != item.url)
                console.log(`图片预加载失败，已到达最大重连次数：${item.url}`, err);
            } else {
                // 没有超过最大重试次数，降低优先级排队重新加载
                item.priority = Math.max(0, item.priority - 1)
                this.queue.sort((a, b) => b.priority - a.priority)
                console.log(`图片预加载失败，将重试：${item.url}`, err);
            }
        } finally {
            item.loading = false
            this.loadingCount--
        }
    }
    // 加载单张图片核心代码
    private loadImagePromise(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = url
            img.onload = () => resolve()
            img.onerror = () => reject(`${url}预加载失败`)
        })
    }

    // 添加图片到预加载队列
    public addImage(url: string, priority: number = 1): void {
        // 检查是否已经在缓存中 或者 已经在加载队列中
        if (this.loadedCache.has(url) || this.queue.some(item => item.url == url)) return
        // 构造预加载项
        const item: ProloadItem = {
            url,
            priority,
            retryCount: 0,
            loaded: false,
            loading: false
        }
        this.queue.push(item)
        // 按照优先级重新降序排序
        this.queue.sort((a, b) => b.priority - a.priority)
    }
    // 批量将图片添加到预加载队列
    public addImages(images: Array<{ url: string, priority: number }>): void {
        images.forEach(img => {
            this.addImage(img.url, img.priority)
        })
    }
    // 暂停加载
    public pauseLoading(): void {
        this.manualPaused = true
    }
    // 恢复加载
    public resumeLoading(): void {
        this.manualPaused = false
    }
    // 检查图片是否已预加载
    public isImageLoaded(url:string):boolean{
        return this.loadedCache.has(url)
    }
    // 获取加载器状态
    public getStatus(){
        return{
            queueLength:this.queue.length,
            loadingCount:this.loadingCount,
            cacheSize:this.loadedCache.size,
            isIdle:this.isIdle,
            manualPaused:this.manualPaused
        }
    }
    // 清除已经加载的图片的缓存
    public clearCache():void{
        this.loadedCache.clear()
    }
    // 清除预加载队列
    public clearQueue():void{
        this.queue=[]
    }
    // 销毁预加载器
    public destroy():void{
        this.pauseLoading()
        this.clearQueue()
        this.clearCache()
    }
}

export const imagePreloader = new ImagePreloader()
export default ImagePreloader