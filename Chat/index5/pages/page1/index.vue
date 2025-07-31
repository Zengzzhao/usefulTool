<template>
    <view class="container">
        <view class="title">page1</view>
        <ChatModal />
    </view>
</template>

<script setup lang='ts'>
import ChatModal from '@/components/ChatModal/index.vue'

</script>

<style scoped lang="scss">
.container{
    padding: 20rpx;
    box-sizing: border-box;
    height: 100vh;
    width: 100vw;
    background-color: #ccc;
    .title{
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>