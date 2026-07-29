<template>
  <div class="chart-wrapper">
    <Line v-if="hasData" :data="chartData" :options="options" />
    <p v-else class="chart-status">{{ emptyMessage }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps({
  items: { type: Array, default: () => [] },
  emptyMessage: { type: String, default: 'Chưa có dữ liệu xu hướng đăng tin' },
})

const hasData = computed(() => props.items.some((item) => item.value > 0))

const chartData = computed(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [{
    label: 'Tin tuyển dụng mới',
    data: props.items.map((item) => item.value),
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    fill: true,
    tension: 0.35,
    pointRadius: 4,
    pointBackgroundColor: '#6366f1',
  }],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: '#f1f5f9' },
      ticks: { stepSize: 1, font: { size: 11 } },
    },
  },
}
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
