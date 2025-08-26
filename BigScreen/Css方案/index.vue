<template>
    <div class="container">
        <div class="content" ref="screen"></div>
    </div>
</template>

<script setup lang='ts'>
import { onMounted, onUnmounted, ref } from 'vue'
const screen = ref() // 数据大屏的dom实例
// 数据大屏自适应函数
const screenAuto = (designWidth: number = 1920, designHeight: number = 1080) => {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const scaleX = screenWidth / designWidth
  const scaleY = screenHeight / designHeight
  const scale = Math.min(scaleX, scaleY)
  screen.value.$el.style.transform = `scale(${scale}) translate(-50%,-50%)`
}

// 生命周期
onMounted(() => {
  screenAuto()
  window.onresize = () => screenAuto()
})
onUnmounted(() => {
  window.onresize = null
})
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}
.layout-container {
  width: 1920px;
  height: 1080px;
  /* // 缩放中心在元素中心时，缩放会向四周缩放；缩放中心在元素左上角时，缩放只会向右侧与下侧
  // 默认缩放中心在元素中心，如果只是简单的让子容器在父容器中居中，此时缩放中心与父容器的中心对齐了，此时进行缩放会向四周拉伸或收缩导致超出父容器边界溢出出现裁剪得到情况，无法达到“填满且不溢出”的目标
  // 设置缩放中心后子容器将以自己的左上角（现在父容器的中心点）为基准进行缩放，由于基准点在左上角，缩放操作会​​单向地向右和向下​​拉伸或收缩元素，去覆盖父容器的右下象限。
  // 之后再将缩放后的子容器移动放在父容器中间即可 */
  transform-origin:left top;
  position: fixed;
  left: 50%;
  top: 50%;
}
</style>