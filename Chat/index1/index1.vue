<template>
    <view>chat</view>
    <mp-html :content="html"></mp-html>
    <button @tap="send">发送</button>
</template>

<script setup lang='ts'>
import { SSE } from '@/common/sseService'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue'
import { ref, watch } from 'vue'

const html = ref('') // 将md转换为html后的内容
const md = ref('') // 服务器返回的md格式的内容
// SSE服务实例
const sseInstance = new SSE({
    url: 'xxxx',
    onMessage: (event) => {
        const data = JSON.parse(event.data)
        const { code, data: innerData } = data
        if (code == 0) {
            const { content = '', status } = innerData
            if (status !== 'stopped') {
                // 将服务器返回的新内容追加到md中
                md.value += content
            }
        }
    }
})
// 发送消息
const send = () => {
    const params = {
        message: "xxx",
        requestID: "xxxx",
        serviceType: 90,
        userID: 2
    }
    sseInstance.connect(params)
}
// MD解析器
marked.use({
    async: true,
    gfm: true,
    breaks: true
})
// 解析md格式数据为html格式数据的工具函数
async function parseMarkdown(markdown: string) {
    const html = await marked.parse(markdown) // 解析markdown
    return DOMPurify.sanitize(html) // 对输出的 HTML 进行清理 
}
// 一直监听md数据的变化，有变化时就将新的md数据解析为html数据
watch(() => md.value, async(newContent) => {
    html.value=await parseMarkdown(newContent)
})
</script>

<style scoped></style>