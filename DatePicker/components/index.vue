<template>
    <view class="calendar_container" @tap.top v-if="visible">
        <!-- 标题区域 -->
        <view class="title_section">
            <!-- 上一个月箭头 -->
            <view class="nav_button" @tap="prevMonth">
                <view class="arrow_left"></view>
            </view>
            <!-- 标题内容 -->
            <view class="title_content">
                <view class="current_month">{{ displayTitle }}</view>
            </view>
            <!-- 下一个月箭头 -->
            <view class="nav_button" @tap="nextMonth">
                <view class="arrow_right"></view>
            </view>
        </view>
        <!-- 内容区域 -->
        <view class="content_section">
            <!-- 星期标题 -->
            <view class="week_header">
                <view class="week_item" v-for="day in WEEK_DAYS" :key="day">{{ day }}</view>
            </view>
            <!-- 日期网格 -->
            <view class="month_grid">
                <view class="date_row" v-for="(row, rowIndex) in 6" :key="rowIndex">
                    <view class="date_item"
                        v-for="(day, colIndex) in calendarDays.slice(rowIndex * 7, (rowIndex + 1) * 7)" :key="colIndex"
                        @tap="selectDate(day)" :class="{
                            'selected': isSelected(day.fullDate),
                            'today': isToday(day.fullDate),
                            'in_range': isInRange(day.fullDate),
                            'disabled': !day.isCurrentMonth || isDisabled(day.fullDate)
                        }">
                        <text class="date_text" v-if="day.isCurrentMonth">{{ day.date }}</text>
                    </view>
                </view>
            </view>
        </view>
        <!-- 底部按钮 -->
        <view class="footer_section">
            <view class="cancel_button" @tap="cancel">
                <text class="button_text">取消</text>
            </view>
            <view class="confirm_button" @tap="confirm">
                <text class="button_text confirm_text">确认</text>
            </view>
        </view>
    </view>
</template>

<script setup lang='ts'>
import { ref, computed, onMounted } from 'vue';
import { WEEK_DAYS } from '@/common/constant';
interface DateRange {
    start: Date | string | null,
    end: Date | string | null
}
interface Props {
    visible?: boolean, // 控制日期选择器是否可见
    modelValue?: string | null, // 传递初始日期值( 单日期类型：xxxx-(x)x-(x)x，时间段类型必须使用-分隔时间传递：xxxx.(x)x.(x)x-xxxx.(x)x.(x)x )
    type?: 'single' | 'range', // 日期选择器类型
    // 可选日期控制
    enabledRange?: DateRange, // 可选的日期范围
    disabledRanges?: DateRange[] // 禁用的日期范围数组
    disabledDates?: (Date | string)[] // 禁用具体日期
    disabledWeekdays?: number[] // 禁用星期几 0-6 (0是周日)
    // 快捷设置
    disablePast?: boolean, // 禁用今天之前的日期
    disableFuture?: boolean // 禁用今天之后的日期
}
const props = withDefaults(defineProps<Props>(), {
    visible: true,
    type: 'single',
})
interface Day {
    date: number,
    isCurrentMonth: boolean,
    fullDate: Date
}
// 自定义事件
const emits = defineEmits<{
    (e: 'update:visible', value: boolean): void,
    (e: 'update:modelValue', value: string): void,
    (e: 'confirm', value: string | null): void,
    (e: 'cancel'): void
}>()
// 响应式数据
const currentDate = ref(new Date()) // 当前日历上要显示的时间中的一个作为参考
const currentYear = computed(() => currentDate.value.getFullYear()) // 当前日历上要显示的年份
const currentMonth = computed(() => currentDate.value.getMonth() + 1) // 当前日历上要显示的月份
const displayTitle = computed(() => `${currentYear.value}-${currentMonth.value}`) // 日历标题：显示当前的月份
const selectedDate = ref<Date | null>(null) // 单选日期类型时选中的日期时间
const selectedStartDate = ref<Date | null>(null) // 时间段类型时选择的开始时间
const selectedEndDate = ref<Date | null>(null) // 时间段类型时选择的结束时间
// 今天的静态数据
const today = new Date()
// 日历上的时间数据
const calendarDays = computed(() => {
    // 时间数据
    const days: Day[] = []
    const year = currentYear.value
    const month = currentMonth.value
    // 当月第一天
    const firstDay = new Date(year, month - 1, 1)
    // 当月最后一天（下一个月第0天就是当月最后一天）
    const lastDay = new Date(year, month, 0)
    // 当月第一天是星期几
    const firstDayWeek = firstDay.getDay()
    // 当月天数
    const daysInMonth = lastDay.getDate()

    // 填充上个月月末数据信息
    // 上个月最后一天（当月第0天就是上月最后一天）
    const preMonthLastDayDate = new Date(year, month - 1, 0)
    // 上月最后一天的是几号
    const preMonthLastDay = preMonthLastDayDate.getDate()
    // 填充信息
    for (let i = firstDayWeek - 1; i >= 0; i--) {
        days.push({
            date: preMonthLastDay - i,
            isCurrentMonth: false,
            fullDate: new Date(year, month - 2, preMonthLastDay - i)
        })
    }

    // 填充当月数据信息
    for (let date = 1; date <= daysInMonth; date++) {
        days.push({
            date,
            isCurrentMonth: true,
            fullDate: new Date(year, month - 1, date)
        })
    }

    // 填充下个月开头数据信息
    const remainDays = 42 - days.length
    for (let date = 1; date <= remainDays; date++) {
        days.push({
            date,
            isCurrentMonth: false,
            fullDate: new Date(year, month, date)
        })
    }
    return days
})
// 判断是否是同一天
const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate()
}
// 判断是否是今天
const isToday = (date: Date) => {
    return isSameDay(date, today)
}
// 判断是否是选中的日期
const isSelected = (date: Date) => {
    if (props.type == 'single' && selectedDate.value) {
        return isSameDay(date, selectedDate.value)
    }
    if (props.type == 'range') {
        return (selectedStartDate.value && isSameDay(date, selectedStartDate.value)) || (selectedEndDate.value && isSameDay(date, selectedEndDate.value))
    }
}
// 时间段类型时，判断日期是否在选择的范围内
const isInRange = (date: Date) => {
    if (props.type == 'range' && selectedStartDate.value && selectedEndDate.value) {
        return date > selectedStartDate.value && date < selectedEndDate.value
    }
    return false
}

// 返回指定格式的日期字符串
const formatDate = (date: Date, format: string = 'YYYY.MM.DD') => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('M', String(String(date.getMonth() + 1)))
        .replace('DD', day)
        .replace('D', String(date.getDate()))
}

// 事件处理方法
// 点击上一个月
const prevMonth = () => {
    // 将currentDate日历上要显示的参照时间改为上个月的1号
    currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
}
// 点击下一个月
const nextMonth = () => {
    // 将currentDate日历上要显示的参照时间改为下个月的1号
    currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
}
// 点击了某个日期
const selectDate = (day: Day) => {
    if (!day.isCurrentMonth) return
    const selectedFullDate = day.fullDate
    if (props.type == 'single') {
        selectedDate.value = selectedFullDate
        emits('update:modelValue', formatDate(selectedDate.value))
    } else if (props.type == 'range') {
        if (!selectedStartDate.value || (selectedStartDate.value && selectedEndDate.value)) {
            // 开始时间没有选 或者 开始时间和结束时间都选了此时是重新选一个新时间段
            selectedStartDate.value = selectedFullDate
            selectedEndDate.value = null
        } else if (selectedStartDate.value && !selectedEndDate.value) {
            // 选择结束日期
            if (selectedFullDate == selectedStartDate.value) {
                // 选的结束时间与开始时间相同

            } else if (selectedFullDate < selectedStartDate.value) {
                // 选的结束时间比开始时间早
                selectedEndDate.value = selectedStartDate.value
                selectedStartDate.value = selectedFullDate
            } else {
                // 选的结束时间比开始时间晚
                selectedEndDate.value = selectedFullDate
            }
        }
        if (selectedStartDate.value && selectedEndDate.value) {
            const start = formatDate(selectedStartDate.value)
            const end = formatDate(selectedEndDate.value)
            const rangeDate = `${start}-${end}`
            emits('update:modelValue', rangeDate)
        }
    }
}
// 点击了取消按钮
const cancel = () => {
    emits('cancel')
    emits('update:visible', false)
}
// 点击了确认按钮
const confirm = () => {
    let result = null
    if (props.type == 'single' && selectedDate.value) {
        result = formatDate(selectedDate.value)
    } else if (props.type == 'range' && selectedStartDate.value && selectedEndDate.value) {
        result = `${formatDate(selectedStartDate.value)}-${formatDate(selectedEndDate.value)}`
    }
    emits('confirm', result)
    emits('update:visible', false)
}

// 日期禁用相关逻辑
// 判断date日期是否在range日期范围内，在为true，不在为false
const isDateInRange = (date: Date, range: DateRange) => {
    const { start, end } = range
    // 处理快捷设置，禁用今天之前的日期/今天之后的日期
    // 如果start为null，表示没有下限；如果end为null，表示没有上限
    if (start === null) return date <= new Date(end!)
    if (end === null) return date >= new Date(start)
    // 处理普通的传递了start和end的range范围
    return date >= new Date(start) && date <= new Date(end)
}
// 是否在传递的属性中所指定的可选日期范围内
const isDateInEnableRange = (date: Date): boolean => {
    if (!props.enabledRange) {
        // 属性中没有传递enabledRange可选日期范围
        return true
    } else {
        // 属性中传递了enabledRange可选日期范围
        return isDateInRange(date, props.enabledRange)
    }
}
// 是否在传递的属性中所指定的禁用日期范围内
// 禁用日期范围、便捷设置中禁用今天之前的日期、便捷设置中禁用今天之后的日期 三者共同组成的禁用日期范围
const disabledDateRange = computed(() => {
    const { disabledRanges = [], disablePast, disableFuture } = props
    const ranges = []
    ranges.push(...disabledRanges)
    // 便捷设置，禁用今天之前的日期
    if (disablePast) {
        ranges.push({
            start: null,
            end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59)
        })
    }
    // 便捷设置，禁用今天之后的日期
    if (disableFuture) {
        ranges.push({
            start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
            end: null
        })
    }
    return ranges
})
const isDateInDisableRange = (date: Date) => {
    return disabledDateRange.value.some((range) => isDateInRange(date, range))
}
// 是否在传递的属性中所指定的禁用的具体日期中
// 将属性中传递的disabledDates转为Date类型
const disabledDates = computed(() => {
    if (!props.disabledDates) {
        return []
    } else {
        return props.disabledDates.map(date => typeof date == 'string' ? new Date(date) : date)
    }
})
const isDateInDisableDate = (date: Date) => {
    return disabledDates.value.some(disabledDate => isSameDay(date, disabledDate))
}
// 是否在传递的属性中所指定的禁用的星期几内
const isDateInDisabledWeekdays = (date: Date) => {
    if (!props.disabledWeekdays) {
        // 属性中没有传递disabledWeekdays禁用星期几
        return false
    } else {
        // 属性中传递disabledWeekdays禁用星期几
        return props.disabledWeekdays.includes(date.getDay())
    }
}
// 所有禁用日期汇总
const isDisabled = (date: Date) => {
    return !isDateInEnableRange(date) || isDateInDisableRange(date) || isDateInDisableDate(date) || isDateInDisabledWeekdays(date)
}

// 若一开始通过v-model绑定了初始值则进行初始化
const init = () => {
    if (props.modelValue) {
        if (props.type == 'single' && props.modelValue.split('-').length == 1) {
            selectedDate.value = new Date(props.modelValue)
        } else if (props.type == 'range' && props.modelValue.split('-').length == 2) {
            const [start, end] = props.modelValue.split('-')
            if (start == end) {
                // 选择的时间段是同一天
                selectedStartDate.value = new Date(start)
            } else {
                // 选择的时间段不是同一天
                selectedStartDate.value = new Date(start)
                selectedEndDate.value = new Date(end)
            }
        } else {
            throw Error('日期选择器类型与传递的日期默认值不匹配')
        }
    }
}
onMounted(() => {
    init()
})
</script>

<style scoped lang="scss">
@use "./index.scss";
</style>