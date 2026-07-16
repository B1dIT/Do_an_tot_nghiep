<template>
  <div style="height: 350px;">
    <Bar v-if="chartData.labels.length > 0" :data="chartData" :options="options" />
    <p v-else>Đang tải dữ liệu biểu đồ từ Python...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = ref({ labels: [], datasets: [] })
const options = { responsive: true, maintainAspectRatio: false }

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/analytics/salary')
    const data = await res.json()
    chartData.value = {
      labels: data.map(item => item.keyword),
      datasets: [
        { label: 'Lương Tối Thiểu', backgroundColor: '#3498db', data: data.map(item => item.min_val) },
        { label: 'Lương Tối Đa', backgroundColor: '#e74c3c', data: data.map(item => item.max_val) }
      ]
    }
  } catch (e) { console.error(e) }
})
</script>