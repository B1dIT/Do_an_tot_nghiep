<template>
  <Doughnut v-if="chartData.labels.length > 0" :data="chartData" :options="options" />
  <p v-else class="chart-status">{{ statusMessage }}</p>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  jobs: {
    type: Array,
    default: () => [],
  },
})

const statusMessage = ref('Chưa có dữ liệu phân tích CV')

const chartData = computed(() => {
  const scores = props.jobs
    .map((job) => ({
      label: job.title?.slice(0, 20) || 'Job',
      score: Number(job.match_score) || 0,
    }))
    .filter((item) => item.score > 0)

  if (!scores.length) {
    return { labels: [], datasets: [] }
  }

  return {
    labels: scores.map((item) => item.label),
    datasets: [{
      data: scores.map((item) => item.score),
      backgroundColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
      borderWidth: 0,
    }],
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}% phù hợp`,
      },
    },
  },
}

onMounted(() => {
  if (props.jobs.length === 0) {
    statusMessage.value = 'Phân tích CV để xem biểu đồ điểm phù hợp'
  }
})
</script>

<style scoped>
.chart-status {
  display: flex;
  height: 100%;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.75rem;
  text-align: center;
  padding: 1rem;
}
</style>
