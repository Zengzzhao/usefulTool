# 自动收集和注册项目中所有模块的store的状态管理解决方案

## 简介

这是一个基于Vue 3和Pinia的自动化状态管理解决方案。该解决方案通过自动收集和注册项目中所有模块的store，极大地简化了状态管理的使用，提高了开发效率。同时，该方案内置了持久化存储功能，可以方便地保存状态到本地存储。

## 特性

- **自动化收集**：自动收集项目pages页面目录下所有模块的store，保存到pageStore中导出（记录仓库的usexxxStore名与usexxxStore钩子函数的映射）
- **统一导出**：通过统一入口pageStore访问所有store，无需手动导入
- **命名规范化**：自动规范化store的名称（首字母大写后形成useXxxStore的风格）
- **持久化存储**：内置Pinia持久化插件，支持状态持久化

## 使用方法

### 1. 创建模块store

在你的页面模块目录下创建`store.ts`文件：

```ts
// pages/yourModule/store.ts
import { defineStore } from "pinia";

export default defineStore('yourModule', {
    state: () => {
        return {
            // 你的状态
        }
    },
    actions: {
        // 你的actions
    }
})
```

### 2. 在组件中使用

```vue
<script setup lang='ts'>
import { pageStore } from '@/store'

// 自动生成的store名称为 useYourModuleStore (首字母大写)
const { useYourModuleStore } = pageStore
const yourModuleStore = useYourModuleStore()

// 现在可以使用你的store了
console.log(yourModuleStore.someState)
yourModuleStore.someAction()
</script>
```

## 工作原理

1. `core.ts` 使用 Vite 的 `import.meta.glob` 自动导入所有页面模块pages目录下所有文件夹中的 `store.ts` 文件
2. 将每个store的名称规范化为 `useXxxStore` 的格式（Xxx为模块名首字母大写）
3. 通过 `initializeStores` 函数确保所有store在应用启动时被正确注册
4. 使用 `pinia-plugin-persistedstate` 插件实现状态持久化

## 注意事项

1. 每个页面模块的store必须放在对应模块目录下的`store.ts`文件中
3. 在使用时，store的名称会自动转换为`useXxxStore`格式（Xxx为模块名首字母大写）

## 示例

查看 `page/case1` 目录下的示例，了解具体的使用方法。
