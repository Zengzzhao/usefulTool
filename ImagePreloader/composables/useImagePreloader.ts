import { onMounted, onUnmounted, ref } from "vue";
import { imagePreloader } from "../main";

interface useImagePreloaderOptions {
    images: Array<{ url: string, priority: number }>, // 预加载的图片数组（图片url，预加载优先级）
    delay: number // 延迟预加载时间
}
export function useImagePreloader(options: useImagePreloaderOptions) {
    const { images=[], delay=1000 } = options
    const status = ref(imagePreloader.getStatus())
    let statusTimer: any = null // 状态监控计时器
    const isLoading = ref(false) // 预加载的图片项目是否正在加载中

    // 更新状态
    const updateStatus = () => {
        status.value = imagePreloader.getStatus()
        isLoading.value = status.value.loadingCount > 0
    }
    // 添加单张图片到预加载队列
    const addImage = (url: string, priority: number) => {
        imagePreloader.addImage(url, priority)
        updateStatus()
    }
    // 批量添加图片到预加载队列
    const addImages = (imageList: Array<{ url: string, priority: number }>) => {
        imagePreloader.addImages(imageList)
        updateStatus()
    }
    // 检查图片是否已预加载
    const isImageLoaded = (url: string): boolean => {
        return imagePreloader.isImageLoaded(url)
    }
    // 暂停预加载器
    const pause = () => {
        imagePreloader.pauseLoading()
    }
    // 恢复预加载器
    const resume = () => {
        imagePreloader.resumeLoading()
    }
    // 开始状态监控
    const startStatusMonitoring = () => {
        statusTimer = setInterval(updateStatus, 1000)
    }
    // 停止状态监控
    const stopStatusMonitoring = () => {
        if (statusTimer) {
            clearInterval(statusTimer)
            statusTimer = null
        }
    }
    onMounted(()=>{
        console.log('预拉取图片',images);
        if(images.length){
            setTimeout(()=>{
                addImages(images)
            },delay)
        }
        startStatusMonitoring()
    })
    onUnmounted(()=>{
        stopStatusMonitoring()
    })

    return {
        // 状态
        isLoading,
        status,
        // 方法
        addImage,
        addImages,
        isImageLoaded,
        pause,
        resume
    }
}