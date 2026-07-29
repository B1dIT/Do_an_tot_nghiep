<template>
  <div class="chart-wrapper">
    <Bar v-if="chartData.labels.length > 0" :key="chartKey" :data="chartData" :options="options" />
    <p v-else class="chart-status">{{ statusMessage }}</p>
    <div v-if="chartData.labels.length > 0" class="chart-legend">
      <button
        v-for="(dataset, index) in chartData.datasets"
        :key="dataset.label"
        type="button"
        class="legend-button"
        :class="{ 'legend-button-muted': dataset.hidden }"
        @click="toggleDataset(index)"
      >
        <span class="legend-color" :style="{ backgroundColor: dataset.backgroundColor }"></span>
        {{ dataset.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = ref({ labels: [], datasets: [] })
const chartKey = ref(0)
const statusMessage = ref('Đang tải dữ liệu lương...')
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  layout: {
    padding: { top: 8, right: 8, bottom: 4, left: 8 },
  },
}

function toggleDataset(index) {
  if (!chartData.value.datasets[index]) return

  chartData.value = {
    ...chartData.value,
    datasets: chartData.value.datasets.map((dataset, datasetIndex) => ({
      ...dataset,
      hidden: datasetIndex === index ? !dataset.hidden : dataset.hidden,
    })),
  }
  chartKey.value += 1
}

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/analytics/salary')
    if (!res.ok) throw new Error(`Không thể tải dữ liệu lương: ${res.status}`)
    const data = await res.json()
    chartData.value = {
      labels: data.map(item => item.keyword),
      datasets: [
        { label: 'Lương Tối Thiểu', backgroundColor: '#3498db', data: data.map(item => item.min_val) },
        { label: 'Lương Tối Đa', backgroundColor: '#e74c3c', data: data.map(item => item.max_val) }
      ]
    }
    statusMessage.value = data.length ? '' : 'Chưa có dữ liệu lương có thể hiển thị.'
  } catch (e) {
    console.error(e)
    statusMessage.value = 'Không thể tải dữ liệu lương từ Node.js Gateway.'
  }
})
</script>

<style scoped>
.chart-wrapper {
  height: 100%;
  min-height: 0;
  position: relative;
}

.chart-status {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.75rem;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem 1rem;
  padding-top: 0.25rem;
}

.legend-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.35rem;
}

.legend-button:hover {
  color: #1e293b;
}

.legend-button-muted {
  color: #94a3b8;
  text-decoration: line-through;
}

.legend-color {
  height: 0.625rem;
  width: 0.625rem;
  border-radius: 9999px;
}
</style>