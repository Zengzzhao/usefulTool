<!-- AI的回答展示卡片 -->
<template>
    <!-- 展示回答的富文本框 -->
    <mp-html :content="htmlContent"></mp-html>
    <!-- 回答记载着的三个点特效 -->
    <view class="typing-indicator" v-if="isLastChat && (chatStore.isLoading || chatStore.isAnswering)">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
    </view>
</template>

<script setup lang='ts'>
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ref, watch } from 'vue';
import { pageStore } from '@/store';
const { useChatStore } = pageStore
const chatStore = useChatStore()

interface Props {
    content: string,
    isLastChat: boolean
}
const props = defineProps<Props>()

// MD解析器
marked.use({
    async: true,
    gfm: true,
    breaks: true
})
// 解析md得到html
async function parseMarkdown(markdown: string) {
    const html = await marked.parse(markdown)
    return DOMPurify.sanitize(html)
}
const htmlContent = ref('')
watch(() => props.content, async (newContent) => {
    htmlContent.value = await parseMarkdown(newContent)
})
</script>

<style scoped lang="scss">
.typing-indicator {
    display: flex;
    gap: 5px;

    .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #999;
        margin-top: 5px;
        animation: pulse 1.5s infinite;

        &:nth-child(2) {
            animation-delay: 0.5s;
        }

        &:nth-child(3) {
            animation-delay: 1s;
        }
    }

    @keyframes pulse {

        0%,
        100% {
            opacity: 0.4;
        }

        50% {
            opacity: 1;
        }
    }
}
</style>