# 图片预加载管理器

## 图片预加载管理器类、对象

在`main.ts`文件中创建了一个图片预加载管理器类，文件最后导出了一个全局预加载器实例，可直接使用。

该类/对象在应用空闲时智能预加载图片，使图片在用户需要时已经准备好，提升用户体验和页面加载速度。

具有以下核心功能：
1. 管理图片预加载队列，按优先级依次加载
2. 在用户空闲时间自动加载图片资源
3. 控制并发加载数量，避免资源占用过多
4. 失败重试机制，确保图片加载可靠性
5. 缓存已加载图片，避免重复加载

**使用**

```ts
import { imagePreloader } from './main';
imagePreloader.addImage('xxxxx',1)
```



# 图片预加载钩子函数

在`composables`文件夹的`useImagePreloader.ts`文件中

> 为什么有了图片预加载管理器类对象后，还需要写一个钩子函数呢？
>
> 这种设计是常见的前端架构模式：底层工具类负责核心功能实现，框架特定的包装器负责与框架集成，使开发者可以用最符合当前框架风格的方式使用功能。

**使用**

```ts
import {useImagePreloader} from "@/composables/useImagePreload"

// 直接使用钩子时预加载
useImagePreloader({
    images:[
        {url:'xxx',priority:10},
        {url:'xxx',priority:10},
    ]
})
// 使用钩子内的函数手动添加项目来预加载
const {addImage}=useImagePreloader()
onMounted(() => {
    addImage('xxx',10)
})
```

