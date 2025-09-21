<!-- 使用transform的translate优化移动 -->
<template>
    <div class="container">
        <!-- 移动盒子 -->
        <div class="box" @mousedown="handleMouseDown" :style="{transform:`translate(${translateX}px,${translateY}px)`}" ref="moveBox"></div>
        <!-- 盛放容器 -->
        <div class="bottomBar">
            <div class="boxContainer" v-for="i in [0,1,2]" :key="i" :ref="(el) => boxContainerRefs[i] = el"></div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

let startX: number // 鼠标开始移动/移动过程中初始x的位置
let startY: number // 鼠标开始移动/移动过程中初始y的位置
let translateX = ref<number>(0) // 移动元素相对于初始位置所移动的x，初始为0
let translateY = ref<number>(0) // 移动元素相对于初始位置所移动的y，初始为0
const moveBox = ref() // 移动元素
const boxContainerRefs: any[] = [] // 盛放容器
// 在移动盒子中鼠标按下事件处理
const handleMouseDown = (e: MouseEvent) => {
    startX = e.clientX
    startY = e.clientY
    window.addEventListener('mousemove', handleMouseMove)
    // 只监听一次鼠标抬起操作，与本次鼠标按下形成一个原子操作
    window.addEventListener('mouseup', handelMouseUp, { once: true })
}
// 在移动盒子中鼠标移动的事件处理
const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX // 本次移动x上的偏移
    const dy = e.clientY - startY // 本次移动y上的偏移
    startX = e.clientX
    startY = e.clientY
    translateX.value += dx
    translateY.value += dy
}
// 在移动盒子中鼠标放开的事件处理
const handelMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    const moveBoxRect = moveBox.value.getBoundingClientRect()
    // 移动元素的左下角、右下角
    const curLeftBottom = [moveBoxRect.left, moveBoxRect.bottom]
    const curRightBottom = [moveBoxRect.right, moveBoxRect.bottom]
    // 判断拖拽的div是否触碰到盛放容器
    for (let i = 0; i < boxContainerRefs.length; i++) {
        if (boxContainerRefs[i]) {
            const rect = boxContainerRefs[i].getBoundingClientRect()
            // 盛放容器左上角、右上角
            const rectLeftTop = [rect.x, rect.y]
            const rectRightTop = [rect.right, rect.y]
            if (isInner(curLeftBottom, curRightBottom, rectLeftTop, rectRightTop)) {
                // 当前在第i个盛放容器中，进行一些特点业务处理
                console.log(`在第${i+1}个盛放容器中`);
                // 将第i个盛放容器盛放移动元素，同时将移动元素从页面上移除
                boxContainerRefs[i].style.backgroundColor='aqua'
                moveBox.value.remove()
                break
            }
        }
    }
}

// 工具函数
/**
 * 判断移动元素是否在盛放容器内部(用移动元素的左右下角与盛放容器的左右上角进行判别)
 * @param curLeftBottom 当前移动元素左下角相对视口的[left,top]
 * @param curRightBottom 当前移动元素右下角相对视口的[left,top]
 * @param leftTop 当前盛放容器元素左上角相对视口的[left,top]
 * @param rightTop 当前盛放容器元素右上角相对视口的[left,top]
 */
const isInner = (curLeftBottom: number[], curRightBottom: number[], leftTop: number[], rightTop: number[]) => {
    // 水平距离判断
    if (curLeftBottom[0] <= rightTop[0] && curRightBottom[0] >= leftTop[0]) { // 移左<=放右 && 移右>=放左(移动元素左边到视口左侧距离<=盛放容器右边到视口左侧距离 && 移动元素右边到视口左侧距离>=盛放容器左边到视口左侧距离)
        // 竖直距离判断
        if (curLeftBottom[1] >= leftTop[1]) { // 移动元素底边到视口顶部距离>=盛放容器顶边到视口顶部距离
            return true
        }
    }
    return false
}

</script>

<style scoped lang="scss">
.container {
    height: 100vh;
    width: 100vw;
    position: relative;

    .box {
        background-color: aqua;
        height: vh(200);
        width: vw(200);
        left: 0;
        top: 0;
        position: absolute;
        cursor: move;
    }

    .bottomBar {
        position: fixed;
        bottom: 0;
        left: 50%;
        width: vw(800);
        height: vh(400);
        transform: translateX(-50%);
        display: flex;
        gap: vw(25);

        .boxContainer {
            width: vw(250);
            height: vh(400);
            border: vh(2) solid red
        }
    }
}
</style>