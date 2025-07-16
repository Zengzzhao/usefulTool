// 对流式输入的md内容的图片语法部分进行处理,返回处理后的md
// 在流式输入的情况下，图片的url会直接显示，至显示完全时才变为一张图片；
// 现在利用我们的处理器对原始md处理，在url没有完全接收到之前不会显示url，而是用内部变量processing_text图片解析中...替代显示；当url全部接收完毕时又会将文字替换为url，最终呈现图片
type ImageState =
    | { type: 'Normal' } // 正常状态
    | { type: 'Alt_Started', altBuffer: string } // ![alt]中的alt开始解析状态至解析完成
    | { type: 'Alt_Complete', alt: string } // ![alt]中的alt解析完成
    | { type: 'Url_Parsing', alt: string, urlBuffer: string, processingTextLength: number }; // ![alt](url)中的url开始解析到解析完成

export default class MdImageProcessor {
    private state: ImageState = { type: 'Normal' } // 当前解析器状态
    private readonly processing_text = '图片解析中...' // 图片解析时的提示文字
    private resultBuffer: string[] = [] // 解析结果缓冲区，使用数组存储，之后通过join('')返回字符串
    /**
     * 
     * @param content 原始md内容
     * @returns 对图片语法处理后的md内容
     */
    public process(content: string) {
        // 重置状态，重新处理本次传过来的md的完整内容
        this.reset()
        // 遍历每次传过来的md的每个字符
        let i = 0
        while (i < content.length) {
            const char = content[i]
            switch (this.state.type) {
                case 'Normal':
                    i = this.handleNormalState(char, content, i)
                    break
                case 'Alt_Started':
                    i = this.handleAltStartedState(char, i)
                    break
                case 'Alt_Complete':
                    i = this.handleAltCompleteState(char, i)
                    break
                case 'Url_Parsing':
                    i = this.handleUrlParsingState(char, i)
                    break
                default:
                    i++
                    break
            }
        }
        // 将结果缓存区中的内容数组拼接为一个字符串返回
        return this.resultBuffer.join("")
    }
    // 重置解析器状态
    private reset(): void {
        this.state = { type: 'Normal' },
            this.resultBuffer = []
    }
    // 添加内容到结果缓冲区
    private addToResult(content: string) {
        this.resultBuffer.push(content)
    }
    // 处理正常状态，当![出现时转变状态为alt处理开始状态，否则将内容添加到结果缓冲区
    private handleNormalState(char: string, content: string, index: number) {
        if (char === '!' && index + 1 < content.length && content[index + 1] === '[') {
            // 检测到图片开始
            this.state = { type: 'Alt_Started', altBuffer: '' }
            // 跳过![两个字符
            return index + 2
        }
        // 普通文本
        this.addToResult(char)
        return index + 1
    }
    // 处理图片alt开始状态
    private handleAltStartedState(char: string, index: number) {
        // Extract<a,b>为ts的内置工具类型，用于从联合类型ImageState中提取type属性为'Alt_Started'的特定状态类型
        const state = this.state as Extract<ImageState, { type: 'Alt_Started' }>
        if (char === ']') {
            // alt文本解析完毕
            this.state = { type: 'Alt_Complete', alt: state.altBuffer }
        } else {
            // alt文本解析未完成，缓存alt中的内容
            state.altBuffer += char
        }
        return index + 1
    }
    // 处理图片alt完成状态
    private handleAltCompleteState(char: string, index: number) {
        const state = this.state as Extract<ImageState, { type: 'Alt_Complete' }>
        if (char == '(') {
            // 开始解析图片url
            // 构造![alt]图片解析中...的加载字段放入结果缓存中
            const processingText = `![${state.alt}]${this.processing_text}`
            this.addToResult(processingText)
            this.state = {
                type: 'Url_Parsing',
                alt: state.alt,
                urlBuffer: '',
                processingTextLength: processingText.length
            }
        } else {
            // ![]后不是()，即不是![]()而是![]xxxx非图片语法的普通文本，此时将![]添加到结果缓存中，并设置状态为正常Normal状态，然后再将当前字符添加到结果缓存中
            this.addToResult(`![${state.alt}]`)
            this.state = { type: 'Normal' }
            this.addToResult(char)
        }
        return index + 1
    }
    // 处理Url解析状态
    private handleUrlParsingState(char: string, index: number) {
        const state = this.state as Extract<ImageState, { type: 'Url_Parsing' }>
        if (char === ')') {
            // url解析完成，用 完整的图片语法 替换之前的 '![alt]图片解析中...' ，然后转变状态为正常状态
            const completeImageMd = `![${state.alt}](${state.urlBuffer})`
            this.replaceLastProcessingText(state.processingTextLength, completeImageMd)
            this.state = { type: 'Normal' }
        } else {
            // url还未解析完成，继续收集url
            state.urlBuffer += char
        }
        return index + 1
    }
    // 用replacement替换最后的 结果缓存中后processingTextLength位字符('![alt]图片解析中...') 
    private replaceLastProcessingText(processingTextLength: number, replacement: string) {
        // 将缓存数组中的内容拼接为一个字符串
        const curResult = this.resultBuffer.join("")
        // 将后面processingTextLength位替换为replacement
        const newResult = curResult.slice(0, -processingTextLength) + replacement
        // 将字符串还原成数组
        this.resultBuffer = newResult.split('')
    }
}