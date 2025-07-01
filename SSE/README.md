# SSE (Server-Sent Events) 实现

该模块提供了两种不同环境下的 SSE (Server-Sent Events) 客户端实现：

## 功能简介

Server-Sent Events (SSE) 是一种允许服务器向客户端推送数据的 Web 技术。这个模块提供了两种环境下的 SSE 实现：

1. **H5SSE**: 适用于 H5/浏览器环境
2. **MPSSE**: 适用于微信小程序环境

## H5SSE 使用说明

H5SSE 基于浏览器的 Fetch API 和 ReadableStream 实现了 SSE 功能。

### 使用示例

```typescript
import { H5SSE } from './H5SSE';

const sse = new H5SSE({
  url: 'https://api.example.com/sse',
  onMessage: (msg) => {
    console.log('收到消息:', msg.event, msg.data);
  },
  onError: (err) => {
    console.error('SSE 错误:', err);
  }
});

// 连接并发送数据
sse.connect({ userId: 123 });

// 断开连接
sse.close();
```

## MPSSE 使用说明

MPSSE 基于微信小程序的 `uni.request` API 实现了 SSE 功能。

### 使用示例

```typescript
import { MPSSSE } from './MPSSE';

const sse = new MPSSSE({
  url: 'https://api.example.com/sse',
  onMessage: (msg) => {
    console.log('收到消息:', msg.event, msg.data);
  },
  onError: (err) => {
    console.error('SSE 错误:', err);
  }
});

// 连接并发送数据
sse.connect({ userId: 123 });

// 断开连接
sse.close();
```

## 注意事项

1. 两种实现都支持通过 POST 请求发送数据
2. 消息格式遵循 SSE 标准：`event:` 和 `data:` 字段