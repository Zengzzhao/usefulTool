<template>
    <!-- echarts的饼图 -->
    <div ref="chartRef" class="chart"></div>
</template>

<script setup lang='ts'>
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue';
import emitter from '@/common/bus';

const chartRef = ref<HTMLElement>()
let chartIns: echarts.ECharts | null = null
// 初始化echarts图表
const initChart = () => {
    if (!chartRef.value) return
    chartIns = echarts.init(chartRef.value)
    const colors = ['rgba(255, 161, 108, 1)', 'rgba(247, 224, 165, 1)', 'rgba(51, 215, 238, 1)'] // 橙色 黄色 蓝色 柱状图初始颜色
    const colors2 = ['rgba(255, 138, 72, 1)', 'rgba(246, 217, 143, 1)', 'rgba(0, 206, 234, 1)'] // 饼图颜色，柱状图激活颜色
    const accidents = ['撞车', '追尾', '抛洒物']
    const data = [205, 230, 60] // 柱状图数据
    const option = {
        // 基础容器配置
        // 关闭动画
        animation: false,
        // 坐标轴配置
        grid: {
            left: '60%',    // 左侧留出空间放置饼图
            bottom: '10%',
            top: '10%'
        },
        xAxis: {
            type: 'value',   // 数值轴
            show: false,     // 不显示X轴
        },
        yAxis: {
            type: 'category', // 类别轴
            inverse: true, // 反向坐标轴
            axisLine: { show: false }, // 隐藏轴线
            axisLabel: {
                show: false    // 隐藏轴标签
            },
            data: accidents // 类别名称
        },
        // 图例
        legend: {
            data: accidents,
            right: '40%',
            top: '18%',
            orient: 'vertical',
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8,
            itemGap: 42,
            textStyle: {
                color: '#B9E8FF',
                fontSize: 10
            },
            inactiveColor: 'rgba(185,232,255,0.4)',
        },
        series: [
            // 饼图
            {
                type: 'pie',                // 饼图类型
                radius: ['48%', '60%'],     // 内半径和外半径(形成环形)
                center: ['25%', '55%'],     // 饼图位置
                avoidLabelOverlap: true,    // 防止标签重叠
                labelLayout: { hideOverlap: true },
                legendHoverLink: false, // 禁用图例悬浮高亮联动
                // 数据配置
                data: [
                    {
                        value: 58,
                        name: accidents[0],
                        itemStyle: {
                            color: colors2[0], // 橙色
                            borderColor: '#000',
                            borderWidth: 3
                        }
                    },
                    {
                        value: 30,
                        name: accidents[1],
                        itemStyle: {
                            color: colors2[1], // 黄色
                            borderColor: '#000',
                            borderWidth: 3
                        }
                    },
                    {
                        value: 12,
                        name: accidents[2],
                        itemStyle: {
                            color: colors2[2], // 蓝色
                            borderColor: '#000',
                            borderWidth: 3
                        }
                    }
                ],
                // 标签配置
                label: {
                    show: true,                 // 显示标签
                    position: 'outside',        // 外部标签
                    formatter: '{c}%',     // 格式: 百分比
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#B9E8FF',
                },
                // 标签引导线配置
                labelLine: {
                    show: true,        // 显示引导线
                    length: 8,           // 第一段引导线长度（从饼图到转折点）
                    length2: 8,          // 第二段引导线长度（从转折点到文字
                    lineStyle: {
                        color: '#B9E8FF',
                    }
                },
                // 高亮效果
                emphasis: {
                    label: { show: true },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                selectedOffset: 8
            },
            // 条形图
            {
                type: 'bar',
                barWidth: 10,             // 条形宽度
                legendHoverLink: false, // 禁用图例悬浮高亮联动
                // 右侧文本标签样式
                label: {
                    show: true,
                    position: ['100%', '50%'], // 标签位置在条形的外部中间
                    offset: [15, -3],          // 位置偏移量
                    formatter: '{c}',        // 显示数值
                    color: '#B9E8FF',           // 文字颜色
                    fontSize: 12,
                },
                // 每个柱条样式
                itemStyle: {
                    // 每个条形单独设置颜色
                    color: function (params: { dataIndex: number }) {
                        return colors[params.dataIndex];
                    },
                },
                // Y轴数据对应条形图位置
                data: [
                    {
                        value: 205,
                        name: accidents[0]
                    },
                    {
                        value: 230,
                        name: accidents[1]
                    },
                    {
                        value: 60,
                        name: accidents[2]
                    }
                ]
            },
            // 用于选中放大的条形图
            {
                type: 'bar',
                barWidth: 16,
                barGap: '-100%',
                z: 10,
                itemStyle: {
                    color: function (params: { dataIndex: number }) {
                        return colors2[params.dataIndex];
                    },
                    shadowBlur: 10,
                    shadowColor: 'rgba(255, 255, 255, 0.8)',
                },
                legendHoverLink: false, // 禁用图例悬浮高亮联动
                // 右侧文本标签样式
                label: {
                    show: true,
                    position: ['100%', '50%'], // 标签位置在条形的外部中间
                    offset: [15, -3],          // 位置偏移量
                    formatter: '{c}',        // 显示数值
                    color: '#B9E8FF',           // 文字颜色
                    fontSize: 12,
                },
                data: [null, null, null]
            }
        ]
    };
    chartIns.setOption(option)

    // 当前选中的事故类型索引
    let activeIndex: null | number = null
    /**
     * 点击某个数据项将其样式激活(高亮+bar放大)
     * @param idx 当前点击的数据项在上面accidents变量中的索引
     */
    const setActive = (idx: number) => {
        // 将之前选中的数据项的扇区设置为未选中(大小变为正常)
        if (activeIndex != null) {
            chartIns?.dispatchAction({ type: 'pieUnSelect', seriesIndex: 0, dataIndex: activeIndex })
        }
        // 将当前选中的饼图的扇区放大
        chartIns?.dispatchAction({ type: 'pieSelect', seriesIndex: 0, dataIndex: idx })
        // 将选中项激活样式(高亮且柱状图放大)
        if (activeIndex === idx) { // 如果点击的是之前已经高亮的扇区/柱条对应图例，取消高亮
            chartIns?.dispatchAction({ type: 'downplay', dataIndex: activeIndex })
            // 将之前柱状图放大的柱条恢复为正常状态下的小柱条
            chartIns?.setOption({ series: [{}, { data }, { data: [null, null, null] }] }, false)
            activeIndex = null
            // 在事件总线上触发accident:selectChange通知home.vue本次取消选中没有选中事件类型
            emitter.emit('accident:selectChange', { value: '' })
        } else { // 点击的是新的扇区/柱条的图例
            // 如果有已经高亮扇区/柱条，先取消之前的高亮
            if (activeIndex !== null) {
                chartIns?.dispatchAction({
                    type: 'downplay',
                    dataIndex: activeIndex
                })
            }
            // 高亮当前点击的扇区
            chartIns?.dispatchAction({
                type: 'highlight',
                dataIndex: idx
            })
            activeIndex = idx
            // 覆盖柱数据只给选中索引赋值，其它为 null
            const bar1Data = accidents.map((_, index) => index === activeIndex ? null : data[index]) // 正常柱条中非选中的为实际值，选中的为null
            const bar2Data = accidents.map((_, index) => index === activeIndex ? data[index] : null) // 放大的激活柱条中选中的为实际值，非选中的为null
            chartIns?.setOption({ series: [{}, { data: bar1Data }, { data: bar2Data }] }, false)
            // 在事件总线上触发accident:selectChange通知home.vue本次选中事件类型
            emitter.emit('accident:selectChange', { value: accidents[activeIndex] })
        }
    }
    // 监听点击事件
    chartIns.on('click', (params) => {
        setActive(params.dataIndex)
    })
    // 监听图例点击事件
    chartIns.on('legendselectchanged', (params: any) => {
        const name = params.name // 点击的图例名
        const idx = accidents.indexOf(name) // 点击图例id索引
        // 阻止默认的点击图例导致饼图对应扇区为未选中而隐藏，将点击的图例对应扇区设置为选中
        if (params.selected[name] === false) {
            chartIns?.dispatchAction({ type: 'legendSelect', name })
        }
        setActive(idx)
    })
}

onMounted(() => {
    initChart()
})
</script>

<style scoped lang=scss>
.chart {
    width: 100%;
    height: 200px;
}
</style>