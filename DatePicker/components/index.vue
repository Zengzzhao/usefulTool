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
                            'disabled': !day.isCurrentMonth
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
import { ref, computed } from 'vue';
import { WEEK_DAYS } from '@/common/constant';
interface Props {
    visible?: boolean,
    modelValue?: string | null,
    type?: 'single' | 'range',
    format?: string
}
const props = withDefaults(defineProps<Props>(), {
    visible: true,
    type: 'single',
    format: 'YYYY.MM.DD'
})
interface Day {
    date: number,
    isCurrentMonth: boolean,
    fullDate: Date
}
// 自定义事件
const emits=defineEmits<{
    (e:'update:visible',value:boolean):void,
    (e:'update:modelValue',value:string):void,
    (e:'confirm',value:string|null):void,
    (e:'cancel'):void
}>()
// 响应式数据
const currentDate = ref(new Date()) // 当前日历上要显示的时间中的一个作为参考
const currentYear = computed(() => currentDate.value.getFullYear()) // 当前日历上要显示的年份
const currentMonth = computed(() => currentDate.value.getMonth() + 1) // 当前日历上要显示的月份
const displayTitle = computed(() => `${currentYear.value}-${currentMonth.value}`) // 日历标题：显示当前的月份
const selectedDate = ref<Date | null>(null) // 单选日期类型时选中的日期时间
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
}
// 返回指导格式的日期字符串
const formatDate=(date:Date,format:string=props.format||'YYYY.MM.DD')=>{
    const year=date.getFullYear()
    const month=String(date.getMonth()+1).padStart(2,'0')
    const day=String(date.getDate()).padStart(2,'0')
    return format
        .replace('YYYY',String(year))
        .replace('MM',month)
        .replace('M',String(String(date.getMonth()+1)))
        .replace('DD',day)
        .replace('D',String(date.getDate()))
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
    }
}
// 点击了取消按钮
const cancel=()=>{
    emits('cancel')
    emits('update:visible',false)
}
// 点击了确认按钮
const confirm=()=>{
    let result=null
    if(props.type=='single' && selectedDate.value){
        result=formatDate(selectedDate.value)
    }
    emits('confirm',result)
    emits('update:visible',false)
}
</script>

<style scoped lang="scss">
@use "./index.scss";
</style>