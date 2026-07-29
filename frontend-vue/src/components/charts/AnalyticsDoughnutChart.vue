<template>
  <div class="chart-wrapper">
    <Doughnut v-if="hasData" :data="chartData" :options="options" />
    <p v-else class="chart-status">{{ emptyMessage }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  items: { type: Array, default: () => [] },
  colors: {
    type: Array,
    default: () => ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
  },
  emptyMessage: { type: String, default: 'Chưa có dữ liệu' },
})

const hasData = computed(() => props.items.some((item) => item.value > 0))

const chartData = computed(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [{
    data: props.items.map((item) => item.value),
    backgroundColor: props.items.map((_, index) => props.colors[index % props.colors.length]),
    borderWidth: 0,
  }],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 10, font: { size: 11 }, padding: 14 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((sum, value) => sum + value, 0)
          const percent = total ? Math.round((ctx.parsed / total) * 100) : 0
          return ` ${ctx.label}: ${ctx.parsed} (${percent}%)`
        },
      },
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
