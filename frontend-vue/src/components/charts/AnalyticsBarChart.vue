<template>
  <div class="chart-wrapper">
    <Bar v-if="hasData" :data="chartData" :options="options" />
    <p v-else class="chart-status">{{ emptyMessage }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  items: { type: Array, default: () => [] },
  color: { type: String, default: '#6366f1' },
  horizontal: { type: Boolean, default: true },
  emptyMessage: { type: String, default: 'Chưa có dữ liệu' },
})

const hasData = computed(() => props.items.some((item) => item.value > 0))

const chartData = computed(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [{
    label: 'Số lượng',
    data: props.items.map((item) => item.value),
    backgroundColor: props.color,
    borderRadius: 6,
    maxBarThickness: props.horizontal ? 28 : 40,
  }],
}))

const options = computed(() => ({
  indexAxis: props.horizontal ? 'y' : 'x',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.parsed[props.horizontal ? 'x' : 'y']} tin tuyển dụng`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: '#f1f5f9' },
      ticks: { font: { size: 11 } },
    },
    y: {
      grid: { display: props.horizontal ? false : true, color: '#f1f5f9' },
      ticks: { font: { size: 11 } },
    },
  },
}))
</script>

<style scoped>
.chart-wrapper {
  height: 100%;
  min-height: 14rem;
}

.chart-status {
  display: flex;
  height: 100%;
  min-height: 14rem;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.75rem;
  text-align: center;
  padding: 1rem;
}
</style>
