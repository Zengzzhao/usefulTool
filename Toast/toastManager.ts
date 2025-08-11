// Toast实例
interface ToastInstance {
    open: (message: string, duration: number) => void
}

class ToastManager {
    // 当前Toast实例
    private currentInstance: ToastInstance | null = null
    // 待处理消息组成的队列
    private pendingMessages: Array<{ message: string, duration: number }> = []

    /**
     * 显示Toast消息
     * @param message 消息
     * @param duration 显示持续时间
     */
    show(message: string, duration: number) {
        if (this.currentInstance) { // 当前toast组件实例存在，则使用实例的open方法显示消息
            this.currentInstance.open(message, duration)
        } else { // 当前toast组件实例不存在，则当前消息暂存到待处理消息队列中，超过5s则清理避免消息堆积
            this.pendingMessages.push({ message, duration })
            setTimeout(() => {
                const index = this.pendingMessages.findIndex(item => item.message === message && item.duration === duration)
                if (index > -1) {
                    this.pendingMessages.splice(index, 1)
                }
            }, 5000)
        }
    }

    /**
     * 注册toast组件实例
     * @param instance toast组件实例
     */
    registerInstance(instance: ToastInstance) {
        // 挂载当前toast组件实例
        this.currentInstance = instance
        // 如果当前待处理消息队列有消息，则让当前toast组件实例显示消息，并清空待处理消息队列
        if (this.pendingMessages.length) {
            const messages = [...this.pendingMessages]
            // 清空待处理消息队列
            this.pendingMessages = []
            // 延迟处理，让当前toast组件实例显示消息
            setTimeout(() => {
                messages.forEach(({ message, duration }) => {
                    this.show(message, duration)
                })
            }, 100)
        }
    }

    /**
     * 注销当前注册的toast组件实例
     */
    unregisterInstance() {
        this.currentInstance = null
    }

    /**
     * 检查实例状态
     */
    isReady(): boolean {
        return this.currentInstance !== null
    }

    /**
     * 获取待处理消息数量
     */
    getPendingCount(): number {
        return this.pendingMessages.length
    }
}

// 创建全局ToastManager实例
const toastManager = new ToastManager()
// 挂载到全局uni对象
const setupGlobalToast = () => {
    if (!uni.$toast) {
        uni.$toast = (message: string, duration: number) => {
            toastManager.show(message, duration)
        }
        uni.$toast.success = (message: string, duration: number) => {
            toastManager.show(`✅ ${message}`, duration)
        }
        uni.$toast.error = (message: string, duration = 3000) => {
            toastManager.show(`❌ ${message}`, duration)
        }
        uni.$toast.warning = (message: string, duration = 2500) => {
            toastManager.show(`⚠️ ${message}`, duration)
        }
        uni.$toast.info = (message: string, duration = 2000) => {
            toastManager.show(`ℹ️ ${message}`, duration)
        }
    }
}
setupGlobalToast()

export default toastManager