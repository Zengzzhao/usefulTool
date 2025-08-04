<template>
    <view class="page">
        <view class="video_container">
            <video class="video" :src="lessonStore.lessonInfo.resource" id="video" :controls="false"
                :show-center-play-btn="false" @loadedmetadata="handleLoadedMetadata" @play="handlePaly"
                @pause="handlePause" @timeupdate="handleTimeUpdate" @ended="handleEnded" />
            <view class="controller" v-if="!showVideoCover">
                <controller :is-playing="isPlaying" :is-ended="isEnded" @play="onControllerPlay"
                    @pause="onControllerPause" @repaly="onControllerReplay" :current-time="currentTime"
                    :duration="duration" @seek="onControllerSeek" @rate-change="onControllerRateChange" />
            </view>
            <image v-if="showVideoCover" :src="lessonStore.lessonInfo.cover" class="img" />
        </view>
    </view>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { pageStore } from '@/store';
import { onReady } from '@dcloudio/uni-app';
import { lessonApi } from './api';
import Controller from './components/Controller/index.vue'

// 数据仓库
const { useLessonStore } = pageStore
const lessonStore = useLessonStore()
// 定义变量
const videoContext = ref<UniApp.VideoContext | null>(null) // video上下文对象
const showVideoCover = ref(true) // 是否显示视频封面图
const isPlaying = ref(false) // 是否正在播放
const isEnded = ref(false) // 是否播放结束
const currentTime = ref(0) // 当前视频播放到的时间
const duration = ref(0) // 视频总时长

// 生命周期
onReady(async () => {
    videoContext.value = uni.createVideoContext('video')
    const res = await lessonApi.getLessonDetail({ id: import.meta.env.VITE_LESSON_ID })
    lessonStore.lessonInfo = res.detail
    lessonStore.mcourseWatchRecord = res.mcourseWatchRecord
})

// 视频的事件处理
// 视频元数据加载完毕时的事件处理
const handleLoadedMetadata = (e: any) => {
    showVideoCover.value = false
    duration.value = e.detail.duration
}
// 视频播放的事件处理函数
const handlePaly = () => {
    isPlaying.value = true
    isEnded.value = false
}
// 视频暂停的事件处理函数
const handlePause = () => {
    isPlaying.value = false
}
// 视频结束的事件处理函数
const handleEnded = () => {
    isPlaying.value = false
    isEnded.value = true
}
// 视频播放进度变化的事件处理函数
const handleTimeUpdate = (e: any) => {
    currentTime.value = e.detail.currentTime
}

// 控制器的事件处理
// 点击了控制器播放按钮的事件处理
const onControllerPlay = () => {
    videoContext.value?.play()
}
// 点击了控制器暂停按钮的事件处理
const onControllerPause = () => {
    videoContext.value?.pause()
}
// 点击了控制器重播按钮的事件处理
const onControllerReplay = () => {
    videoContext.value?.seek(0)
    videoContext.value?.play()
    isEnded.value = false
}
// 控制器拖拽结束时的事件处理
const onControllerSeek = (time: number) => {
    console.log('seek', time);
    videoContext.value?.seek(time)
    currentTime.value = time
}
// 控制器选择视频播放倍速的事件处理
const onControllerRateChange = (rate: number) => {
    videoContext.value?.playbackRate(rate)
}

</script>

<style scoped lang="scss">
@use './index.scss'
</style>