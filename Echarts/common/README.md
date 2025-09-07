# 通用 ECharts 组件实现说明

## 实现思路

实现分为两部分：

1) 在 `useChart.ts` 中按需引入 ECharts 并完成初始化、更新与销毁，以及窗口尺寸变化时的自适应。
2) 在 `index.vue` 中准备一个响应式的 `options`，调用 `useEcharts(options)` 把 ECharts 挂载到模板中的 DOM 上。

### 1) `useChart.ts`：通用图表逻辑封装

核心点：
- 按需引入：仅引入用到的 `charts/components/features/renderers`，减小体积。
- 生命周期管理：在 `onMounted` 初始化，在 `onUnmounted` 销毁实例。
- 响应式更新：`watch(options, { deep: true })`，当配置变化时调用 `setOption` 更新图表。
- 自适应：监听 `window.resize`，调用实例的 `resize()`。

设计要点：
- `chartRef`：提供给模板上用于挂载 ECharts 的 DOM 容器引用。
- `chartInstance`：当前返回的是一个普通变量引用（非响应式），如果需要在外部主动调用实例方法（如导出图片、手动触发 `resize`）

### 2) `index.vue`：示例组件

作用：给出一种使用方式。内部定义一个响应式 `options`，并把 `useEcharts(options)` 返回的 `chartRef` 绑定到模板。

## 使用方式

你可以在任何业务组件中复用 `useEcharts`，示例：

```vue
<template>
  <div class="chart" ref="chartRef" />
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEcharts } from '@/Echarts/common/useChart'

const options = ref({ /* 你的 ECharts 配置 */ })
const { chartRef } = useEcharts(options)

// 之后只需修改 options.value 即可驱动图表更新
// options.value = { ...新配置 }
</script>

<style scoped>
.chart { width: 100%; height: 100%; }
</style>
```

