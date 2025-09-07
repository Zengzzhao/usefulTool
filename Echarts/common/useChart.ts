import { ref, onMounted, onUnmounted, watch } from 'vue';
// 按需引入echarts
import * as echarts from 'echarts/core';
import { BarChart,PieChart,RadarChart, LineChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    ToolboxComponent,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
// 注册必须的组件
echarts.use([
    LegendComponent,
    ToolboxComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    BarChart,
    PieChart,
    RadarChart,
    LineChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

export function useEcharts(options: any) {
    const chartRef = ref<HTMLDivElement | null>(null);
    let chart: echarts.ECharts | null = null;
    const initChart = () => {
        if (chartRef.value) {
            chart = echarts.init(chartRef.value);
            chart.setOption(options.value);
        }
    }
    // 监听options变化
    watch(() => options.value, (newVal) => {
        if (chart) {
            chart.setOption(newVal);
        }
    }, { deep: true });

    const resizeChart = () => {
        if (chart) {
            chart.resize();
        }
    };
    onMounted(() => {
        initChart();
        window.addEventListener('resize', resizeChart);
    });
    onUnmounted(() => {
        if (chart) {
            chart.dispose();
            chart = null;
        }
        window.removeEventListener('resize', resizeChart);
    });
    
    return {
        chartRef,
        chartInstance: chart
    }
}