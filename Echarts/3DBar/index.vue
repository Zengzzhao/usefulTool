<template>
    <div>
        <div ref="chartRef" class="chart"></div>
    </div>
</template>

<script setup lang='ts'>
import * as echarts from 'echarts'
import { ref, onMounted } from 'vue'

const chartRef = ref<HTMLElement>() // 放置echarts图表的dom元素实例
// 获取echarts构建3d柱图的配置
function getEcharts3DBar(data: number[]) {
    const colorArr = ["#009FB6", "#00CEEA", "#5DECFF"] // 柱左侧颜色,柱右侧颜色,柱顶部颜色
    // 柱条渐变颜色
    const color = {
        type: "linear",
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
            {
                offset: 0,
                color: colorArr[0],
            },
            {
                offset: 0.5,
                color: colorArr[0],
            },
            {
                offset: 0.5,
                color: colorArr[1],
            },
            {
                offset: 1,
                color: colorArr[1],
            },
        ],
    };
    const barWidth = 30;
    return {
        // 坐标系
        grid: {
            // 距离上下左右的范围
            left: "3%", //图表距边框的距离
            right: "3%",
            top: "15%",
            bottom: "5%",
            // 是否包含坐标轴的刻度标签
            containLabel: true,
        },
        // x轴
        xAxis: {
            data: ['路段1', '路段2', '路段3', '路段4', '路段5', '路段6'],
            // 坐标轴刻度
            axisTick: {
                // 隐藏坐标轴刻度
                show: false,
            },
        },
        // y轴
        yAxis: {
            // 坐标轴刻度
            axisTick: {
                // 隐藏坐标轴刻度
                show: false,
            },
            // 坐标轴轴线相关设置
            axisLine: {
                // 隐藏坐标轴轴线
                show: true,
            },
            // 坐标轴刻度标签的相关设置
            axisLabel: {
                // 隐藏坐标轴标签
                show: false,
            },
            // 坐标轴在 grid 区域中的分隔线
            splitLine: {
                lineStyle: {
                    color: 'rgba(185, 232, 255, 0.4)',
                    type: 'dashed'
                }
            }
        },
        // 系列
        series: [
            // 柱条
            {
                z: 1,
                type: "bar",
                barWidth: barWidth,
                data: data,
                itemStyle: {
                    normal: {
                        color: color,
                    },
                },
            },
            // 底部象形柱图，组成底部3d效果
            {
                z: 2,
                type: "pictorialBar",
                data: data,
                // 图形类型为菱形
                symbol: "diamond",
                // 图形纵向向下偏移自身大小50%
                symbolOffset: ["0%", "50%"],
                // 图形大小（宽，高）
                symbolSize: [barWidth, 10],
                // 
                itemStyle: {
                    color: color,
                }
            },
            // 顶部象形柱图，组成顶部3d效果
            {
                z: 3,
                type: "pictorialBar",
                // 图形位置在柱条顶部
                symbolPosition: "end",
                data: data,
                symbol: "diamond",
                // 图形纵向向上偏移自身大小50%
                symbolOffset: ["0%", "-50%"],
                symbolSize: [barWidth, 10],
                itemStyle: {
                    color: colorArr[2],
                }
            },
        ],
    };
}
onMounted(() => {
    if (!chartRef.value) return
    const chart = echarts.init(chartRef.value);
    chart.setOption(getEcharts3DBar([5, 36, 10, 20, 15, 15]));
})

</script>

<style scoped>
.chart {
    width: 100%;
    height: 200px;
}
</style>