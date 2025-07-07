# index1

通过SSE每次从后端拿到部分MD格式的数据，转换成HTML格式，使用富文本组件呈现在页面上

使用到的库：

1. marked：解析markdown格式数据
2. DOMPurify：对输出的 HTML进行清理
3. mp-html：富文本组件