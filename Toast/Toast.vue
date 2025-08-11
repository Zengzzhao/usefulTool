<!-- Toast组件 -->
<template>
    <view class="toast-container">
        <Transition name="toast-fade" v-for="toast in avtiveToasts" :key="toast.id" @after-leave="removeToast(toast.id)">
            <view v-if="toast.visible" class="custom-toast">
                <text class="message">{{ toast.message }}</text>
            </view>
        </Transition>
    </view>
</template>

<script setup lang='ts'>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import toastManager from '@/common/toastManager';

// 每个要显示的toast消息实例
interface ToastItem {
    id: number,
    message: string,
    visible: boolean,
    timer?: number | null
}

// 当前有效的未被toastManager清除还存在的放入了当前toast组件实例中的toast消息组成的队列
const avtiveToasts = ref<ToastItem[]>([])
// 当前toast组件实例的toast消息队列进行编号的序号
let toastId = 0

// toast组件实例的open显示消息的主方法
const open = async (message: string, duration: number) => {
    const currentToastId = toastId++
    // 隐藏当前toast组件实例的toast消息队列中所有显示的toast
    avtiveToasts.value.forEach(toast => {
        if (toast.visible) {
            toast.visible = false
            if (toast.timer) {
                clearTimeout(toast.timer)
                toast.timer = null
            }
        }
    })
    // 等待一帧确保隐藏操作完成
    await nextTick()
    // 创建新的Toast
    const newToast: ToastItem = {
        id: currentToastId,
        message,
        visible: false
    }
    // 添加到数组
    avtiveToasts.value.push(newToast)
    // 等待DOM更新
    await nextTick()
    // 显示新的Toast
    const toast = avtiveToasts.value.find(toast => toast.id === currentToastId)
    if (toast) {
        toast.visible = true
        // 等待显示完成
        await nextTick()
        // 设置自动隐藏定时器
        toast.timer = setTimeout(() => {
            if (toast.visible) {
                toast.visible = false
            }
        }, duration)
    }
}
// 利用transition的js钩子在离开过渡完成、且元素已从DOM中移除时调用：移除在toast消息队列中指定id的toast
const removeToast = (id: number) => {
    const index = avtiveToasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
        const toast = avtiveToasts.value[index]
        if (toast.timer) {
            clearTimeout(toast.timer)
        }
        avtiveToasts.value.splice(index, 1)
    }
}

// 组件挂载时注册到ToastManager
onMounted(() => {
    toastManager.registerInstance({ open })
})
// 组件卸载时从ToastManager注销
onUnmounted(() => {
    toastManager.unregisterInstance()
})

</script>

<style scoped lang="scss">
.toast-container {
    position: fixed;
    bottom: 250rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    pointer-events: none; // 允许点击穿透
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80%;
}

.custom-toast {
    background: rgba(0, 0, 0, 0.40);
    box-shadow: 0 4px 7.6px 0 rgba(0, 0, 0, 0.14);
    color: white;
    padding: 16rpx 44rpx;
    line-height: 38rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    max-width: 100%;

    .message {
        font-size: 14px;
        word-break: break-word;
    }
}

// 过渡动画
.toast-fade-enter-active,
.toast-fade-leave-active {
    transition: all 0.3s ease;
}

.toast-fade-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.toast-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>