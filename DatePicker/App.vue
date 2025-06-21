<template>
    <view class="container">
        <DatePicker v-model="date" v-model:visible="DatePickerVisible" @cancel="cancel" @confirm="confirm"/>
    </view>
</template>

<script setup lang='ts'>
import DatePicker from './components/index.vue'
import { ref } from 'vue'

const DatePickerVisible=ref(true)
const date=ref('2025.06.25')

const cancel=()=>{
    console.log('取消');
}
const confirm=(date:string|null)=>{
    console.log('选择的时间为：',date);
}
</script>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
    background-color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40rpx;
}
</style>