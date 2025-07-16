<template>
    <view>
        <mp-html :content="htmlContent"></mp-html>
    </view>
</template>

<script setup lang='ts'>
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ref,watch } from 'vue'
import MdImageProcessor from '@/common/MdImageProcessor'

const md=ref('') // 存储接收到后端的md内容
const htmlContent = ref('') // 存储将md格式内容转换为html格式后的内容
// 虚拟后端实现，每隔100毫秒将content中的两个字符给前端
let start=0
let end=2
const content='一些文字文字![操作图片](https://img2.baidu.com/it/u=3763669766,995124448&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=889)'
setInterval(()=>{
    md.value+=content.slice(start,end)
    start+=2
    end+=2
},100)
// MD解析器
marked.use({
    async: true,
    gfm: true,
    breaks: true
})
// 对MD内容中的图片语法部分的流式解析器
const mdImageProcessor=new MdImageProcessor()
// 解析md得到html
async function parseMarkdown(markdown: string) {
    const md=mdImageProcessor.process(markdown)
    const html = await marked.parse(md)
    return DOMPurify.sanitize(html)
}
watch(() => md.value, async (newContent) => {
    htmlContent.value = await parseMarkdown(newContent)
},{
    immediate:true
})
</script>

<style scoped>
</style>