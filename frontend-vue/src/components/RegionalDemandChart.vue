<template>
  <div class="chart-wrapper">
    <Doughnut v-if="chartData.labels.length > 0" :data="chartData" :options="options" />
    <p v-else class="chart-status">{{ statusMessage }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartData = ref({ labels: [], datasets: [] })
const statusMessage = ref('Đang tải dữ liệu khu vực...')
const options = { responsive: true, maintainAspectRatio: false }

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/analytics/regions')
    if (!response.ok) throw new Error(`Không thể tải dữ liệu khu vực: ${response.status}`)
    const data = await response.json()
    const visibleData = data.filter((item) => item.value > 0)

    chartData.value = {
      labels: visibleData.map((item) => item.label),
      datasets: [{
        data: visibleData.map((item) => item.value),
        backgroundColor: ['#6366f1', '#60a5fa', '#7dd3fc'],
        borderWidth: 0
      }]
    }
    statusMessage.value = visibleData.length ? '' : 'Chưa có dữ liệu khu vực.'
  } catch (error) {
    console.error(error)
    statusMessage.value = 'Không thể tải dữ liệu khu vực từ Node.js Gateway.'
  }
})
</script>

<style scoped>
.chart-wrapper {
  height: 100%;
}

.chart-status {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.75rem;
}
</style>