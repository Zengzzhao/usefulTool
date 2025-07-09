# index1

通过SSE每次从后端拿到部分MD格式的数据，转换成HTML格式，使用富文本组件呈现在页面上（流式效果）

使用到的库：

1. marked：解析markdown格式数据
2. DOMPurify：对输出的 HTML进行清理
3. mp-html：富文本组件

**具体实现**

使用全局变量md存储服务器返回的md格式的数据，在sse每次接收到消息的回调处理函数中将返回的md数据追加到全局变量md中。使用全局变量html存储将md格式数据解析为html格式的数据，使用watch一直监听全局变量md的变化，当改变时将新md值解析为html格式存储在全局变量html中。在富文本mp-html组件中传入html呈现。
