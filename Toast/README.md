# Toast 组件与全局 Toast 管理器使用说明

uniapp虽然自带了showToast（支持全局，不依赖于页面组件树，由小程序容器统一管理（只要duration没到，即使页面跳转了Toast也会显示在新页面上）），但是其不支持队列形式，只能显示一个，多个Toast不能同时显示，且不能自定义各种样式

所以我们实现自定义Toast，由于Toast组件依赖于页面组件树，当页面跳转时，当前页面的所有组件都会销毁，利用全局Toast管理器使得消息与组件解耦，消息由全局Toast管理器全局托管，组件动态注册。

toastManager是一个全局单例对象，不随页面跳转销毁，始终存在于内存中。当调用uni.$toast()时，toastManager会判断当前是否有Toast组件实例，有实例：直接调用组件的open方法显示消息。无实例：把消息暂存到队列里。新页面加载时，Toast组件会自动注册到Toast管理器，此时Toast管理器会把之前暂存的消息“补发”给新页面的Toast组件显示。这样就实现了：页面跳转时，Toast组件虽然会被销毁，但消息不会丢失，Toast管理器会在新页面的Toast组件准备好后自动显示这些消息。保证了全局任意页面都能无缝显示Toast提示。

## 1. 组件结构与功能简介

本 Toast 组件用于在页面中以浮层的形式展示临时消息，支持全局调用，自动消失，支持多种消息类型（普通、成功、错误、警告、信息）。

- 组件文件：`src/components/Toast/index.vue`
- 管理器文件：`src/common/toastManager.ts`
- 全局调用方式：`uni.$toast(...)`

## 2. 快速使用

### 2.1 页面引入 Toast 组件

在页面的 `<template>` 中引入 Toast 组件（建议在 App.vue 或每个页面的根节点引入一次）：

```vue
<template>
  <Toast />
</template>

<script setup lang="ts">
import Toast from '@/components/Toast/index.vue'
</script>
```

### 2.2 全局调用 Toast

在任意地方（如页面、组件、API 回调等）直接调用：

```ts
uni.$toast('普通消息', 2000)           // 显示普通消息，2秒后自动消失
uni.$toast.success('操作成功', 2000)   // 显示带“成功”图标的消息
uni.$toast.error('操作失败', 3000)     // 显示带“错误”图标的消息
uni.$toast.warning('警告信息', 2500)   // 显示带“警告”图标的消息
uni.$toast.info('提示信息', 2000)      // 显示带“信息”图标的消息
```

> 注意：`uni.$toast` 方法已在 `toastManager.ts` 中自动挂载到全局 `uni` 对象，无需手动注册。

## 3. 主要实现说明

### 3.1 Toast 组件（index.vue）

- 通过 `toastManager` 注册自身实例，实现全局消息调度。
- 支持多条消息队列，自动隐藏与移除。
- 使用 Vue 的 `<Transition>` 实现淡入淡出动画。
- 样式可自定义，支持多种消息类型。

### 3.2 toastManager.ts

- 负责管理 Toast 组件实例的注册与注销。
- 提供 `show` 方法用于显示消息，支持消息队列与延迟处理。
- 自动将 `$toast` 方法挂载到全局 `uni` 对象，支持多种类型的消息调用。