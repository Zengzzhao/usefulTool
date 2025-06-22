# DatePicker 日期选择器组件

一个功能丰富的 UniApp 日期选择器组件，支持单日期选择和日期范围选择，并提供多种日期禁用配置选项。

## 特性

- 支持单日期和日期范围两种选择模式
- 丰富的日期禁用配置
- 提供多种事件回调
- 完全响应式，支持 v-model 双向绑定

## 安装使用

将 `DatePicker` 文件夹复制到项目的 `components` 目录下，然后在需要使用的页面中导入：

```js
import DatePicker from '@/components/DatePicker/index.vue'
```

在模板中使用：

```html
<DatePicker v-model="date" v-model:visible="visible" @confirm="onConfirm" />
```

## 属性说明

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| visible | boolean | true | 控制日期选择器是否可见，支持 v-model:visible 双向绑定 |
| modelValue | string \| null | - | 当前选中的日期值，支持 v-model 双向绑定。单日期格式：YYYY.(M)M.(D)D，日期范围格式：YYYY.(M)M.(D)D-YYYY.(M)M.(D)D |
| type | 'single' \| 'range' | 'single' | 日期选择器类型，'single'：单日期选择，'range'：日期范围选择 |
| enabledRange | { start: Date \| string \| null, end: Date \| string \| null } | - | 可选的日期范围 |
| disabledRanges | Array<{ start: Date \| string \| null, end: Date \| string \| null }> | - | 禁用的日期范围数组 |
| disabledDates | Array<Date \| string> | - | 禁用具体日期数组 |
| disabledWeekdays | Array<number> | - | 禁用星期几，值为 0-6，其中 0 表示周日 |
| disablePast | boolean | false | 便捷设置：禁用今天之前的日期 |
| disableFuture | boolean | false | 便捷设置：禁用今天之后的日期 |

## 事件说明

| 事件名 | 回调参数 | 说明 |
|-------|---------|------|
| update:visible | (value: boolean) | 日期选择器可见状态变化时触发 |
| update:modelValue | (value: string) | 选中日期变化时触发 |
| confirm | (value: string \| null) | 点击确认按钮时触发，参数为选中的日期 |
| cancel | - | 点击取消按钮时触发 |

## 使用示例

### 基本使用

```html
<template>
  <view class="container">
    <button @tap="showPicker">打开日期选择器</button>
    <DatePicker v-model="date" v-model:visible="visible" @confirm="onConfirm" @cancel="onCancel" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker/index.vue'

const visible = ref(false)
// 绑定初始给日期选择器的日期值
const date = ref('2023.05.15')

const showPicker = () => {
  visible.value = true
}

const onConfirm = (selectedDate: string | null) => {
  // 由于使用v-model双向绑定了，所以绑定的date也是选中的最新值
  // 若没有绑定则只能通过事件的回调参数获取选中的最新值
  console.log('选中日期:', selectedDate, date.value)
}

const onCancel = () => {
  console.log('取消选择')
}
</script>
```

### 日期范围选择

```html
<template>
  <view class="container">
    <button @tap="showPicker">选择日期范围</button>
    <DatePicker v-model="dateRange" v-model:visible="visible" type="range" @confirm="onConfirm" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker/index.vue'

const visible = ref(false)
// 绑定初始给日期选择器的日期值
const dateRange = ref('2023.05.15-2023.05.20')

const showPicker = () => {
  visible.value = true
}

const onConfirm = (selectedRange: string | null) => {
  // 由于使用v-model双向绑定了，所以绑定的dateRange也是选中的最新值
  // 若没有绑定则只能通过事件的回调参数获取选中的最新值
  console.log('选中日期范围:', selectedRange,dateRange.value)
}
</script>
```

### 禁用配置示例

```html
<template>
  <view class="container">
    <DatePicker 
      v-model="date"
      v-model:visible="visible"
      :disabled-weekdays="[0, 6]"  // 禁用周六和周日
      :disabled-dates="['2023.05.15', '2023.05.16']"  // 禁用具体日期
      disable-past  // 禁用今天之前的日期
      @confirm="onConfirm" 
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker/index.vue'

const visible = ref(true)
const date = ref(null)

const onConfirm = (selectedDate: string | null) => {
  console.log('选中日期:', selectedDate)
}
</script>
```

### 日期范围限制

```html
<template>
  <DatePicker 
    v-model="date"
    v-model:visible="visible"
    :enabled-range="{ 
      start: '2023.05.01', 
      end: '2023.05.31' 
    }"  // 只允许选择5月的日期
    @confirm="onConfirm" 
  />
</template>
```

## 注意事项

- 日期格式统一使用 `YYYY.(M)M.(D)D`
- 日期范围格式为 `YYYY.(M)M.(D)D-YYYY.(M)M.(D)D`
- 初始值格式必须与组件类型匹配，否则会抛出错误
- 禁用配置可以组合使用，例如同时设置 `disabledDates` 和 `disablePast` 