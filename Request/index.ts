import type { RequestConfig, BaseResponse } from "uniapp/types/request";

// 存储所有pending的请求任务
const pendingRequests = new Set<UniApp.RequestTask>()
// 请求类
export class Request {
    // 统一管理请求配置
    private readonly baseUrl: string // 基础url
    private readonly defaultHeader: Record<string, string> // 默认配置好的请求头
    // 构造函数
    constructor(config: { baseUrl: string; header?: Record<string, string> }) {
        this.baseUrl = config.baseUrl
        this.defaultHeader = config.header || {}
    }
    // 请求方法
    async request<T = any>(config: RequestConfig): Promise<T> {
        // 合并请求配置
        const mergedConfig: RequestConfig & UniApp.RequestOptions = {
            url: config.url.startsWith('http') ? config.url : (this.baseUrl + config.url),
            method: config.method || 'GET',
            data: config.data,
            header: { ...this.defaultHeader, ...config.header },
            timeout: config.timeout || 3000
        }
        // 请求拦截器
        this.requestInterceptor(mergedConfig)
        // 如果配置了loading效果,则显示加载效果
        if (mergedConfig.showLoading) {
            uni.showLoading({ title: mergedConfig.loadingText || '数据加载中...' })
        }
        try {
            return new Promise((resolve, reject) => {
                const requestTask = uni.request({
                    ...mergedConfig,
                    success: (res) => {
                        try {
                            const result = this.responseInterceptor<T>(res, mergedConfig)
                            resolve(result)
                        } catch (error) {
                            reject(error)
                        }
                    },
                    fail: (err) => {
                        const error = this.errorHandler(err)
                        reject(error)
                    },
                    complete: () => {
                        // 请求完成后,从队列中移除
                        pendingRequests.delete(requestTask)
                    }
                })
                // 将请求任务添加到队列中
                pendingRequests.add(requestTask)
            })
        } catch (error) {
            uni.hideLoading()
            return this.errorHandler(error)
        }
    }
    // 请求拦截器
    private requestInterceptor(config: RequestConfig) {
        console.log('请求参数', config);
        // 请求拦截做其他事情
    }
    // 响应拦截器
    private responseInterceptor<T>(response: UniApp.RequestSuccessCallbackResult, config: RequestConfig & UniApp.RequestOptions): T {
        const { statusCode, data } = response
        const resData = data as BaseResponse<T>
        // 响应已到达,此时loading消失
        if (config.showLoading) {
            uni.hideLoading()
        }
        // http状态码不是200ok
        if (statusCode !== 200) {
            // 登录失效或未登录
            if (statusCode === 401) {
                // 清空storage保存的token信息,跳转到登录页面
            }
            throw Error(`HTTP Error ${statusCode}`)
        } else {
            return resData.data
        }
    }
    // 错误处理
    private errorHandler(error: any): never {
        const toastText = '请求失败,请稍后重试'
        uni.showToast({
            title: toastText,
            icon: 'error'
        })
        throw error
    }

    // 快捷方法
    get<T = any>(url: string, params?: Record<string, string>, options?: any) {
        return this.request<T>({ url, method: 'GET', params, ...options })
    }
    post<T = any>(url: string, data?: any, options?: any) {
        return this.request<T>({ url, method: 'POST', data, ...options })
    }

    // 取消所有请求
    cancelAllRequests() {
        pendingRequests.forEach(task => task.abort())
        pendingRequests.clear()
    }
    // 取消单个请求
    cancelRequest(task: UniApp.RequestTask) {
        task.abort()
        pendingRequests.delete(task)
    }
}

// 导出一个配置好的基本请求对象
export const http = new Request({
    baseUrl: 'xxx',
    header: {
        'Content-Type': 'application/json'
    }
})