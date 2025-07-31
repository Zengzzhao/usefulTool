# index1

通过SSE每次从后端拿到部分MD格式的数据，转换成HTML格式，使用富文本组件呈现在页面上（流式效果）

使用到的库：

1. marked：解析markdown格式数据
2. DOMPurify：对输出的 HTML进行清理
3. mp-html：富文本组件

**具体实现**

使用全局变量md存储服务器返回的md格式的数据，在sse每次接收到消息的回调处理函数中将返回的md数据追加到全局变量md中。使用全局变量html存储将md格式数据解析为html格式的数据，使用watch一直监听全局变量md的变化，当改变时将新md值解析为html格式存储在全局变量html中。在富文本mp-html组件中传入html呈现。



# index2

聊天界面完整功能实现，支持实时对话、消息流式加载和推荐问题功能。

## 功能特点

- **实时对话**：使用SSE(Server-Sent Events)技术实现实时通信
- **流式响应**：支持AI回答的流式加载显示
- **推荐问题**：在对话完成后显示相关推荐问题
- **自动滚动**：新消息自动滚动到底部，用户手动滚动时暂停自动滚动，确保当用户专注于阅读上方内容时不会被强制拉到底部，当用户已经在底部时会自动跟随新消息滚动
- **会话保持**：通过sessionId维护对话上下文

## 页面结构

- **顶部导航栏**：显示标题
- **聊天记录区域**：显示用户问题和AI回答
- **推荐问题区域**：显示相关推荐问题
- **底部输入区域**：用户输入问题和发送按钮

## 状态管理

组件使用`chatStore`管理以下状态：

- 聊天队列 (`chatQueue`)，每个元素是一个问题/回答，问题的type为user，AI的回答的type为assistant
- 推荐问题列表 (`recommendQuestionList`)
- 回答状态 (`isAnswering`, `isLoading`)
- 会话ID (`sessionId`)

## 实现细节

1. **消息发送流程**:

   - 用户输入问题并点击发送
   - 问题添加到聊天队列
   - 通过SSE发送到服务器
   - 初始化空的AI回答

2. **响应处理流程**:

   - 接收SSE流式数据
   - 每次接收到的数据使用SSE的回调逐步更新AI回答内容，将上面index1抽离成AnswerCard组件将回答内容传入显示
   - 完成后更新推荐问题和状态

3. **滚动逻辑**:

   使用autoScroll变量记录当前是否需要自动滚动，只要自动滚动autoScroll为真那么就会触发scrollToBottom方法滚动到底部。监听scroll-view组件上的滚动事件，当该组件滚动时就会判断当前滚动条距离下方的距离是否超过了门限，若超过了则说明用户此时将滚动条拉在了上面看回答内容，此时将autoScroll设为false不自动滑动，确保当用户专注于阅读上方内容时不会被强制拉到底部，当用户已经在底部时会自动跟随新消息滚动。

   - 新消息自动滚动到底部
   - 监听滚动事件，当用户主动滚动时暂停自动滚动
   - 用户接近底部时恢复自动滚动

# index3

在index1的基础上，使用`MdImageProcessor`对Markdown文本中图片语法进行流式解析

`MdImageProcessor`是一个专门处理Markdown文本中图片语法的流式解析器。在流式内容输入（如打字机效果、分块传输等）场景下，它能够优化图片的显示体验。（将未完全接收的图片URL替换为友好提示，避免用户看到半成品的URL）

## 功能特点

- **流式处理**：专为处理逐步传入的Markdown内容而设计
- **图片语法优化**：将未完全接收的图片URL替换为友好提示，避免用户看到半成品的URL
- **状态管理**：通过有限状态机实现精确的解析逻辑

## 工作原理

在流式输入情况下，Markdown中的图片语法`![alt](url)`可能会被分段接收。常规解析会导致URL在接收过程中就直接显示，使用本解析器可以：

1. 在URL未完全接收前，将`![alt](incomplete-url`显示为`![alt]图片解析中...`
2. 当URL完全接收后，自动将占位文本替换回完整的图片语法，展示为正常图片

## 状态定义

解析器使用有限状态机实现，包括以下状态：

- `Normal`：正常文本处理状态
- `Alt_Started`：检测到`![`后开始收集alt文本
- `Alt_Complete`：alt文本收集完成，等待URL开始
- `Url_Parsing`：正在收集URL

## 使用方法

```typescript
import MdImageProcessor from '@/common/MdImageProcessor';

// 创建解析器实例
const mdImageProcessor = new MdImageProcessor();
// 处理Markdown文本
const processedMarkdown = mdImageProcessor.process('一些文字![图片说明](https://example.com/image.jpg)');
// 可用于后续Markdown解析
const html = await marked.parse(processedMarkdown);
```

## 流式输入示例

在逐步输入的场景中（如聊天应用、AI回答等）：

```typescript
const mdImageProcessor = new MdImageProcessor();

// 第一块内容: "一些文字![图片"
let content1 = mdImageProcessor.process("一些文字![图片");
// 结果: "一些文字![图片"

// 第二块内容: "一些文字![图片说明]("
let content2 = mdImageProcessor.process("一些文字![图片说明](");
// 结果: "一些文字![图片说明]图片解析中..."

// 最终完整内容: "一些文字![图片说明](https://example.com/image.jpg)"
let content3 = mdImageProcessor.process("一些文字![图片说明](https://example.com/image.jpg)");
// 结果: "一些文字![图片说明](https://example.com/image.jpg)"
```

# index4

综合了上述所有index实现的一个聊天界面组件，支持实时多轮对话、流式响应、历史记录恢复、推荐内容展示、新对话等功能

## 核心功能

- **实时对话**：基于SSE(Server-Sent Events)技术实现流式响应
- **会话管理**：支持创建新会话、恢复历史会话
- **消息控制**：支持停止生成回答、刷新重新生成回答
- **智能推荐**：展示相关推荐问题和推荐内容(推荐课程)
- **自动滚动**：新消息自动滚动，支持用户手动滚动控制
- **历史记录**：支持加载和恢复历史对话记录

## 交互特性

1. **流式响应**：AI回答实时流式显示，无需等待完整回答
2. **停止生成**：用户可随时停止当前回答的生成
3. **刷新回答**：支持重新生成上一个问题的回答
4. **推荐问题点击**：点击推荐问题直接发送提问
5. **新会话创建**：一键创建新的对话会话
6. **智能滚动**：根据用户行为自动控制滚动行为

## 状态管理

使用Pinia进行状态管理，主要状态包括：

- 聊天消息队列 (`chatQueue`)
- 前端向服务器发请求，响应是否到达的状态 (`isLoading`)
- 回答状态 (`isAnswering`)
- 会话ID (`sessionID`)
- 推荐问题列表 (`recommendQuestionList`)

# index5

将对话页面抽离成一个单独的组件，通过传递type为pgae代表使用组件的地方为页面，modal表示使用组件的地方为模态框组件modal

以此实现对话可以在一个页面上展现，也可以作为一个悬浮头像，当点击头像弹出输入框，输入问题发送后展现对话的功能
