<!-- AI的回答展示卡片 -->
<template>
    <view>
        <!-- 展示回答的富文本框 -->
        <mp-html :content="htmlContent"></mp-html>
        <!-- 推荐内容 -->
        <view class="lessonCard" v-if="recommendData">
            <!-- 主课程 -->
            <view class="main">
                <image :src="recommendData.cover" mode="scaleToFill" class="img" />
                <view>
                    <view class="title">{{ recommendData.name }}</view>
                    <view class="desc">{{ recommendData.description }}</view>
                </view>
            </view>
            <!-- 更多内容 -->
            <view class="more_content">
                <view class="title">更多推荐内容</view>
                <view class="list">
                    <view class="item" v-for="item in recommendData.list" :key="item.id">
                        <image :src="item.cover" mode="scaleToFill" class="img" />
                        <view>{{ item.name }}</view>
                    </view>
                </view>
            </view>
        </view>
        <!-- 回答记载中的三个点特效 -->
        <view class="typing-indicator" v-if="isLastChat && (chatStore.isLoading || chatStore.isAnswering)">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
        </view>
    </view>
</template>

<script setup lang='ts'>
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ref, watch } from 'vue';
import { pageStore } from '@/store';
import MdImageProcessor from '@/common/MdImageProcessor';

const { useChatStore } = pageStore
const chatStore = useChatStore()
interface Props {
    content: string, // md格式的回答内容
    isLastChat: boolean, // 是否是最后一条回答
    recommendData: any // 推荐内容
}
const props = defineProps<Props>()

// MD解析器
marked.use({
    async: true,
    gfm: true,
    breaks: true
})
// MD图片语法解析器
const mdImageProcessor=new MdImageProcessor()
// 解析md得到html
async function parseMarkdown(markdown: string) {
    const md=mdImageProcessor.process(markdown)
    const html = await marked.parse(md)
    return DOMPurify.sanitize(html)
}
const htmlContent = ref('')
watch(() => props.content, async (newContent) => {
    htmlContent.value = await parseMarkdown(newContent)
},{
    // 当加载历史聊天记录时，第一次传递过来的就是完整的消息内容，此时就需要直接解析为html
    immediate:true
})
</script>

<style scoped lang="scss">
// 推荐课程内容
.lessonCard {
    width: 100%;

    // 主课程区域
    .main {
        width: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        gap: 10px;

        // 图片
        .img {
            width: 100%;
            border-radius: 10px;
        }

        // 标题
        .title {
            font-size: 30px;
            font-weight: bold;
        }

        // 描述
        .desc {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    // 更多内容
    .more_content {
        margin-top: 20px;

        // 标题
        .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        // 推荐课程列表
        .list {
            white-space: nowrap;
            overflow-x: auto;
            display: flex;
            gap: 20px;

            &::-webkit-scrollbar {
                display: none;
                visibility: hidden;
            }

            // 每个课程
            .item {
                display: inline-block;
                text-align: center;

                // 图片
                .img {
                    width: 140px;
                    height: 140px;
                    border-radius: 10px;
                }
            }
        }
    }
}

// 加载中
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