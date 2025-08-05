<template>
    <view class="video_controller" @tap="showControls = !showControls">
        <!-- 中心播放/暂停按钮 -->
        <template v-if="showControls">
            <view>
                <image v-if="isPlaying" @tap.stop="tooglePlay" class="center_icon"
                    src="https://static.tongyiqingyuan.com/icons/pause.svg" />
                <!-- 当前视频如果不是在播放的话，那么可能处于暂停，也可能处于播放结束 -->
                <template v-else>
                    <image v-if="isEnded" class="center_icon" @tap.stop="toogleReplay"
                        src="https://static.tongyiqingyuan.com/icons/replay.svg" />
                    <image v-else @tap.stop="tooglePlay" class="center_icon"
                        src="https://static.tongyiqingyuan.com/icons/play.svg" />
                </template>
            </view>
        </template>
        <!-- 拖拽时中间显示时间 -->
        <view v-if="isDragging" class="drag_time">{{ dragTimeText }}</view>
        <!-- 底部控制栏 -->
        <view v-if="showControls" class="control_bar" @tap.stop>
            <!-- 左侧播放/暂停按钮 -->
            <view class="play_btn" @tap.stop="tooglePlay">
                <image v-if="!isPlaying" src="https://static.tongyiqingyuan.com/icons/video_play_icon.svg"
                    class="icon" />
                <image v-else src="https://static.tongyiqingyuan.com/icons/video_pause_icon.svg" class="icon" />
            </view>
            <!-- 中间进度条 -->
            <view class="progress_container">
                <!-- 当前播放到的时间 -->
                <view class="display_time">{{ utils.formatSecondTime(currentTime) }}</view>
                <!-- 进度条 -->
                <view class="progress_bar" @touchstart.stop="handleProgressTouchStart"
                    @touchmove.stop="handleProgressTouchMove" @touchend.stop="handleProgressTouchEnd">
                    <!-- 背景进度条(灰色) -->
                    <view class="progress_bg"></view>
                    <!-- 已播放进度(白色) -->
                    <view class="progress_played" :style="{ width: maxProgressPercent + '%' }"></view>
                    <!-- 当前进度(蓝色) -->
                    <view class="progress_current" :style="{ width: progressPercent + '%' }"></view>
                    <!-- 拖拽原点 -->
                    <view class="progress_dot" :style="{
                        left: progressPercent + '%'
                    }">
                    </view>
                </view>
                <!-- 视频总时长 -->
                <view class="display_time">{{ utils.formatSecondTime(props.duration) }}</view>
            </view>
            <!-- 右侧倍速选择、全屏按钮 -->
            <view class="controls_right">
                <!-- 倍速选择 -->
                <view class="rate">
                    <!-- 当前播放速度 -->
                    <view @tap.stop="showRateOptions = !showRateOptions">{{ currentRate }}x</view>
                    <!-- 倍速选择选项弹窗 -->
                    <view class="rate_options_container" v-if="showRateOptions">
                        <view v-for="rate in playRate" :key="rate.value" class="rate_option"
                            :class="{ active: currentRate === rate.value }" @tap.stop="handleRateChange(rate.value)">
                            {{ rate.label }}
                        </view>
                    </view>
                </view>
                <!-- 全屏按钮 -->
                <image class="fullscreen_btn" src="https://static.tongyiqingyuan.com/icons/full_screen.svg"
                    @tap="handleFullscreen" />
            </view>
        </view>
    </view>
</template>

<script setup lang='ts'>
import { ref, computed, onMounted, getCurrentInstance, watch, onUnmounted } from 'vue';
import { utils } from '@/common/utils';

interface Props {
    isPlaying: boolean // 是否正在播放
    isEnded: boolean // 是否播放结束
    currentTime: number // 当前播放的时间
    duration: number // 视频总时长
    allowSeek?: boolean // 是否允许拖拽
    isFullscreen?: boolean // 是否全屏
}
const props = withDefaults(defineProps<Props>(), {
    allowSeek: true,
    isFullscreen: false
})
const emits = defineEmits<{
    (e: 'play'): void, // 播放事件
    (e: "pause"): void, // 暂停事件
    (e: 'repaly'): void // 重播事件
    (e: 'seek', value: number): void // 拖拽事件
    (e: 'rateChange', value: number): void // 视频播放倍速切换
    (e: 'fullscreenChange', isFullscreen: boolean): void // 全屏显示事件 
}>()

// 定义变量
const showControls = ref(true) // 是否显示控制器
const isDragging = ref(false) // 是否正在拖拉
const progressBarRect = ref<any>(null) // 进度条元素的位置信息
const tempProgress = ref(0) // 临时进度百分比，用于拖拽时实时显示
const maxPlayedTime = ref(0) // 已播放过的最大时间
const currentRate = ref(1) // 当前视频播放速率
const showRateOptions = ref(false) // 是否显示选择倍速选项弹窗
const controlsTimer = ref<number | null>(null) // 自动隐藏控制器的定时器
// 播放速率选项
const playRate = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '1.5x', value: 1.5 },
]
// 监听当前时间变化，更新已播放过的最大时间
watch(() => props.currentTime, (newTime) => {
    if (newTime > maxPlayedTime.value) {
        maxPlayedTime.value = newTime
    }
})
// 当前已经观看的时间的进度百分比
const progressPercent = computed(() => {
    // 如果正在拖拽，使用临时进度
    if (isDragging.value) {
        return tempProgress.value
    }
    // 没有在拖拽时则使用当前播放的时间的进度
    return (props.currentTime / props.duration) * 100
})
// 当前已经播放过的最大时间的进度百分比
const maxProgressPercent = computed(() => (maxPlayedTime.value / props.duration) * 100)
// 拖拽时屏幕中间显示的当前时间/视频总时间(xx:xx/xx:xx)
const dragTimeText = computed(() => {
    const curTime = (tempProgress.value / 100) * props.duration
    return `${utils.formatSecondTime(curTime)}/${utils.formatSecondTime(props.duration)}`
})
// 监听是否是全屏的变化,变化时重新获取进度条元素的位置信息
watch(() => props.isFullscreen, () => {
    setTimeout(() => {
        getProgressBarRect()
    }, 100)
})

// 如果正在播放时调用该方法：3s后自动隐藏控制器
const hideControls = () => {
    if (controlsTimer.value) {
        clearTimeout(controlsTimer.value)
        controlsTimer.value = null
    }
    controlsTimer.value = setTimeout(() => {
        showControls.value = false
    }, 3000)
}
// 监听播放状态，当视频正在播放、且控制器可见时隐藏控制器，否则当视频暂停/重播时显示控制器
watch(() => [props.isPlaying, showControls.value], ([newIsPlaying, newShowControls]) => {
    if (newIsPlaying) {
        // 正在播放时若此时控制器看得见，设置3s后自动隐藏控制器
        if (newShowControls) {
            hideControls()
        }
    } else {
        // 暂停或者重播时，清除计时器，显示控制器
        if (controlsTimer.value) {
            clearTimeout(controlsTimer.value)
            controlsTimer.value = null
        }
        showControls.value = true
    }
})

// 事件处理
// 点击播放/暂停按钮的事件处理：进行播放/暂停控制
const tooglePlay = () => {
    // 当前正在播放中，点击了暂停按钮，触发暂停事件
    if (props.isPlaying) {
        emits('pause')
    }
    // 当前处于暂停，点击了播放按钮，触发播放事件
    else {
        emits('play')
    }
}
// 点击了重播按钮的事件处理
const toogleReplay = () => {
    emits('repaly')
}
// 拖拽进度条事件处理相关
// 统一的进度计算和更新方法
const calculateAndUpdateProgress = (e: any, shouldSeek: boolean) => {
    // 获取触摸点位置
    const touch = e.changedTouches[0]

    const rect = progressBarRect.value
    const offsetX = Math.max(0, Math.min(rect.width, touch.clientX - rect.left)) // 进度条的触摸点距离进度条最左边的偏移距离
    const percent = (offsetX / rect.width) * 100
    const targetTime = (offsetX / rect.width) * props.duration

    // 当前视频不允许拖拽移动进度/当前拖拽到的时间超过了已经播放过的最大时间，则不允许拖拽了
    // if (!props.allowSeek || targetTime > maxPlayedTime.value) {
    //     console.log('不允许拖拽');
    //     return
    // }
    if (!props.allowSeek) {
        console.log('不允许拖拽');
        return
    }

    // 更新临时进度，用于实时显示
    tempProgress.value = percent
    // 只有拖拽结束时发送seek事件
    if (shouldSeek) {
        emits('seek', targetTime)
    }
}
// 进度条触摸开始
const handleProgressTouchStart = (e: any) => {
    isDragging.value = true
    calculateAndUpdateProgress(e, false)
}
// 进度条触摸移动中
const handleProgressTouchMove = (e: any) => {
    calculateAndUpdateProgress(e, false)
}
// 进度条触摸结束
const handleProgressTouchEnd = (e: any) => {
    calculateAndUpdateProgress(e, true)
    isDragging.value = false
}
// 点击了视频播放速率的事件处理
const handleRateChange = (rate: number) => {
    currentRate.value = rate
    showRateOptions.value = false
    emits('rateChange', rate)
}
// 点击了全屏按钮的事件处理
const handleFullscreen = () => {
    emits('fullscreenChange', !props.isFullscreen)
}

// 工具处理方法
// 获取进度条位置信息
const getProgressBarRect = () => {
    uni.createSelectorQuery()
        .in(getCurrentInstance())
        .select('.progress_bar')
        .boundingClientRect((rect: any) => {
            progressBarRect.value = rect
        }).exec()
}

// 生命周期
onMounted(() => {
    // 获取进度条位置信息
    getProgressBarRect()
})
onUnmounted(() => {
    if (controlsTimer.value) {
        clearTimeout(controlsTimer.value)
        controlsTimer.value = null
    }
})
</script>

<style scoped lang="scss">
@use './index.scss'
</style>