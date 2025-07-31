# Request 请求封装类

## 概述

`Request` 类是基于 uni-app 平台的 HTTP 请求封装,提供了统一的接口和错误处理机制,简化了应用中的网络请求操作。

## 主要特性

- **统一配置管理**: 集中管理基础 URL 和请求头
- **请求/响应拦截**: 支持请求前处理和响应后处理
- **错误统一处理**: 网络错误和业务错误的统一处理机制
- **加载状态管理**: 自动处理请求过程中的加载状态显示
- **请求取消功能**: 支持取消单个请求或所有请求
- **便捷请求方法**: 提供 GET、POST 等快捷方法

## 基本用法

### 创建请求实例

```typescript
// 已预配置的实例
import { http } from '@/common/request'

// 或者创建新的实例
import { Request } from '@/common/request'
const api = new Request({
  baseUrl: 'https://api.example.com',
  header: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  }
})
```

### 发起请求

```typescript
// GET 请求
http.get('/users', { page: '1', limit: '10' })
  .then(data => {
    console.log('请求成功:', data)
  })
  .catch(error => {
    console.error('请求失败:', error)
  })

// POST 请求
http.post('/users', { name: '张三', age: 25 })
  .then(data => {
    console.log('请求成功:', data)
  })
  .catch(error => {
    console.error('请求失败:', error)
  })
```

### 取消请求

```typescript
// 取消所有请求
http.cancelAllRequests()

// 取消特定请求
const task = uni.request({ ... })
http.cancelRequest(task)
```

## API 说明

### Request 构造函数

```typescript
constructor(config: { baseUrl: string; header?: Record<string, string> })
```

- `baseUrl`: 基础 URL,所有相对路径请求会附加此前缀
- `header`: 默认请求头配置

### 核心方法

#### request<T>

```typescript
request<T = any>(config: RequestConfig): Promise<T>
```

发起 HTTP 请求并返回 Promise

参数说明:
- `url`: 请求地址,可以是相对路径或完整 URL
- `method`: 请求方法,默认为 'GET'
- `data`: 请求体数据
- `params`: URL 查询参数
- `header`: 请求头,会与默认请求头合并
- `timeout`: 超时时间,默认 3000ms
- `showLoading`: 是否显示加载提示
- `loadingText`: 加载提示文字

#### get<T>

```typescript
get<T = any>(url: string, params?: Record<string, string>, options?: any)
```

发起 GET 请求的快捷方法

#### post<T>

```typescript
post<T = any>(url: string, data?: any, options?: any)
```

发起 POST 请求的快捷方法

#### cancelAllRequests

```typescript
cancelAllRequests(): void
```

取消所有进行中的请求

#### cancelRequest

```typescript
cancelRequest(task: UniApp.RequestTask): void
```

取消特定请求任务
