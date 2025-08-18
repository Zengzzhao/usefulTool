# Loading 旋转加载组件

一个简单的CSS旋转加载动画组件，用于显示加载状态。

## 效果预览

该组件显示一个旋转的圆圈和"加载中..."文字提示，表示正在进行某个操作。

## 实现原理

### 1. HTML结构
```html
<div class="loading">
  <div class="loading-spinner"></div>
  <div class="loading-text">加载中...</div>
</div>
```

组件包含两个主要部分：
- `loading-spinner`：旋转动画元素
- `loading-text`：文字提示

### 2. CSS样式实现

#### 旋转元素样式
```scss
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 212, 255, 0.2); // 外圈颜色，透明度较低
  border-top: 2px solid #00D4FF; // 顶部颜色，较亮
  border-radius: 50%;
  animation: spin 1s linear infinite; // 应用旋转动画
}
```

旋转动画的关键实现点：
1. 设置元素为正方形（20px*20px）
2. 使用`border-radius: 50%`将其变成圆形
3. 通过设置不同颜色的边框创建视觉差异：
   - 整体边框为浅蓝色透明（rgba(0, 212, 255, 0.2)）
   - 顶部边框为亮蓝色（#00D4FF）
4. 应用旋转动画`spin`

#### 关键帧动画
```scss
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

动画从0度旋转到360度，实现完整的旋转效果。

### 3. 动画参数说明

- `animation: spin 1s linear infinite;`
  - `spin`：动画名称
  - `1s`：动画持续时间1秒
  - `linear`：动画速度曲线，匀速运动
  - `infinite`：无限循环

## 自定义样式

如果需要使用自定义图标代替纯色圆圈，可以修改样式为：

```scss
.loading-spinner {
  width: 20px;
  height: 20px;
  background: url('@/assets/icon/loading.svg');
  animation: spin 1s linear infinite;
}
```

## 使用方法

在Vue组件中直接引入使用：

```vue
<template>
  <Loading />
</template>

<script setup>
import Loading from './Loading/index.vue'
</script>