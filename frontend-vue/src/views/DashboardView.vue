<template>
  <div class="flex flex-col gap-6">
    <!-- Page header -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Dashboard Tuyển dụng</h1>
          <p class="mt-1 text-sm text-slate-500">
            Phân tích thị trường việc làm từ dữ liệu TopCV — keyword, kinh nghiệm, lương, ngành nghề
          </p>
        </div>
        <div class="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
          </span>
          <span class="text-xs font-medium text-indigo-700">
            {{ isLoadingStats ? 'Đang tải...' : `${overview.totalJobs} tin trong DB` }}
          </span>
        </div>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="mb-3 flex items-center justify-between">
          <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', card.iconBg]">
            <component :is="card.icon" :class="['h-5 w-5', card.iconColor]" />
          </div>
          <span v-if="card.badge" :class="['rounded-full px-2 py-0.5 text-[10px] font-semibold', card.badgeClass]">
            {{ card.badge }}
          </span>
        </div>
        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">{{ card.label }}</p>
        <p v-if="isLoadingStats && card.loading" class="mt-1 font-mono text-2xl font-bold text-slate-300">...</p>
        <p v-else class="mt-1 font-mono text-2xl font-bold text-slate-900">{{ card.value }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ card.subtitle }}</p>
      </div>
    </div>

    <!-- ============================================================
         THANH TASK BAR — TRA CỨU VIỆC LÀM
    ============================================================ -->
    <router-link
      to="/jobs"
      class="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
    >
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-600/20 transition-transform group-hover:scale-105">
          <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-sm font-bold text-slate-900 group-hover:text-indigo-600">Tra cứu việc làm &amp; Phỏng vấn</h2>
          <p class="text-xs text-slate-500">Nhập tên ngành nghề để tìm job và bắt đầu phỏng vấn AI</p>
        </div>
        <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          Tìm kiếm...
        </div>
        <svg class="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </router-link>

    <!-- Row 1: Regions + Keywords -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Nhu cầu tuyển dụng 3 Miền"
        subtitle="Phân bổ theo address_list & detail_location"
        badge="Doughnut"
        icon-bg="bg-blue-50"
        icon-color="text-blue-600"
      >
        <template #icon>
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20" />
          </svg>
        </template>
        <RegionalDemandChart />
        <div class="mt-4 grid grid-cols-3 gap-3">
          <div v-for="region in dashboardData.regions" :key="region.label" class="rounded-lg bg-slate-50 px-3 py-2">
            <p class="truncate text-xs font-medium text-slate-600">{{ region.label }}</p>
            <p class="font-mono text-sm font-bold text-slate-900">{{ region.value }}</p>
          </div>
        </div>
      </ChartCard>

      <ChartCard
        title="Phân bổ theo Keyword tìm kiếm"
        subtitle="Trường keyword trong jobs_data (VD: Data Analyst, Backend...)"
        badge="Horizontal Bar"
        icon-bg="bg-indigo-50"
        icon-color="text-indigo-600"
      >
        <template #icon>
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 9h16" /><path d="M4 15h16" /><path d="M10 3 8 21" /><path d="M16 3l-2 18" />
          </svg>
        </template>
        <div class="h-80">
          <AnalyticsBarChart
            :items="dashboardData.keywords"
            color="#6366f1"
            empty-message="Chưa có dữ liệu keyword từ database"
          />
        </div>
      </ChartCard>
    </div>

    <!-- Row 2: Experience + Salary type -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Yêu cầu kinh nghiệm (exp_list)"
        subtitle="Phân loại theo số năm kinh nghiệm yêu cầu"
        badge="Bar Chart"
        icon-bg="bg-violet-50"
        icon-color="text-violet-600"
      >
        <template #icon>
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
          </svg>
        </template>
        <div class="h-72">
          <AnalyticsBarChart
            :items="dashboardData.experience"
            color="#8b5cf6"
            :horizontal="false"
            empty-message="Chưa có dữ liệu kinh nghiệm"
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Loại hình lương (salary_list)"
        subtitle="Thỏa thuận vs mức lương cụ thể (USD, triệu...)"
        badge="Doughnut"
        icon-bg="bg-amber-50"
        icon-color="text-amber-600"
      >
        <template #icon>
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </template>
        <div class="h-72">
          <AnalyticsDoughnutChart
            :items="dashboardData.salaryTypes"
            :colors="['#94a3b8', '#10b981']"
            empty-message="Chưa có dữ liệu lương"
          />
        </div>
        <p class="mt-3 text-center text-xs text-slate-500">
          {{ overview.negotiablePercent }}% tin tuyển dụng ghi "Thỏa thuận"
        </p>
      </ChartCard>
    </div>

    <!-- Row 3: Top companies + Industries -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Top công ty đang tuyển dụng"
        subtitle="Xếp hạng theo số lượng tin đăng (company)"
        badge="Horizontal Bar"
        icon-bg="bg-emerald-50"
        icon-color="text-emerald-600"
      >
        <template #icon>
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
          </svg>
        </template>
        <div class="h-80">
          <AnalyticsBarChart
            :items="dashboardData.topCompanies"
            color="#10b981"
            empty-message="Chưa có dữ liệu công ty"
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Ngành nghề từ Tags"
        subtitle="Trích xuất từ trường tags (IT, Fintech, Y tế, E-commerce...)"
        badge="Horizontal Bar"
        icon-bg="bg-sky-50"
        icon-color="text-sky-600"
      >
        <template #icon>
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </template>
        <div class="h-80">
          <AnalyticsBarChart
            :items="dashboardData.industries"
            color="#0ea5e9"
            empty-message="Chưa có dữ liệu ngành nghề từ tags"
          />
        </div>
      </ChartCard>
    </div>

    <!-- Row 4: Posting trend + Salary trend -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Xu hướng đăng tin theo thời gian"
        subtitle="Nhóm theo created_at — tháng đăng tin mới"
        badge="Line Chart"
        icon-bg="bg-rose-50"
        icon-color="text-rose-600"
      >
        <template #icon>
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </template>
        <div class="h-72">
          <PostingTrendChart :items="dashboardData.postingTrend" />
        </div>
      </ChartCard>

      <ChartCard
        title="Điểm phù hợp CV của bạn"
        subtitle="Kết quả AI match từ lần phân tích gần nhất"
        badge="Doughnut"
        icon-bg="bg-indigo-50"
        icon-color="text-indigo-600"
        :action-to="'/cv-analysis'"
        action-label="Phân tích CV →"
      >
        <template #icon>
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" />
          </svg>
        </template>
        <div class="h-72">
          <MatchScoreChart :jobs="recommendedJobs" />
        </div>
      </ChartCard>
    </div>

    <!-- Row 5: Salary bar (full width) -->
    <ChartCard
      title="Xu hướng lương ngành IT năm 2026"
      subtitle="So sánh lương tối thiểu / tối đa theo keyword (triệu VND)"
      badge="Bar Chart"
      icon-bg="bg-indigo-50"
      icon-color="text-indigo-600"
    >
      <template #icon>
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="7" y="12" width="3" height="6" rx="0.5" />
          <rect x="12.5" y="8" width="3" height="10" rx="0.5" />
          <rect x="18" y="5" width="3" height="13" rx="0.5" />
        </svg>
      </template>
      <div class="h-80">
        <SalaryChart />
      </div>
    </ChartCard>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <router-link
        to="/cv-analysis"
        class="group flex items-center gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/30 transition-transform group-hover:scale-105">
          <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-slate-900">Phân tích CV ngay</p>
          <p class="text-sm text-slate-500">Upload PDF và nhận gợi ý công việc AI</p>
        </div>
      </router-link>

      <router-link
        to="/interview"
        class="group flex items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/30 transition-transform group-hover:scale-105">
          <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-slate-900">Luyện phỏng vấn AI</p>
          <p class="text-sm text-slate-500">Mô phỏng phỏng vấn và nhận báo cáo đánh giá</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, h, onMounted, ref } from 'vue'
import RegionalDemandChart from '../components/RegionalDemandChart.vue'
import SalaryChart from '../components/SalaryChart.vue'
import MatchScoreChart from '../components/MatchScoreChart.vue'
import ChartCard from '../components/ChartCard.vue'
import AnalyticsBarChart from '../components/charts/AnalyticsBarChart.vue'
import AnalyticsDoughnutChart from '../components/charts/AnalyticsDoughnutChart.vue'
import PostingTrendChart from '../components/charts/PostingTrendChart.vue'
import { displayCompany } from '../utils/companyUtils.js'
import { useAppState } from '../composables/useAppState'

const { state } = useAppState()
const isLoadingStats = ref(true)
const salaryKeywords = ref(0)

// ============================================================
// STATE: Dashboard charts data
// ============================================================
const dashboardData = ref({
  overview: {},
  keywords: [],
  experience: [],
  salaryTypes: [],
  topCompanies: [],
  industries: [],
  postingTrend: [],
  regions: [],
})

const overview = computed(() => ({
  totalJobs: 0,
  uniqueCompanies: 0,
  uniqueKeywords: 0,
  avgExperienceYears: null,
  negotiablePercent: 0,
  ...dashboardData.value.overview,
}))

const recommendedJobs = computed(() => state.value.recommendedJobs)

const averageMatchScore = computed(() => {
  const scores = recommendedJobs.value
    .map((job) => Number(job.match_score))
    .filter((score) => Number.isFinite(score) && score > 0)
  if (!scores.length) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
})

const IconJobs = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '7', width: '18', height: '13', rx: '2' }),
    h('path', { d: 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
  ])

const IconCompany = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M3 21h18' }), h('path', { d: 'M5 21V7l8-4v18' }),
  ])

const IconKeyword = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M4 9h16' }), h('path', { d: 'M10 3 8 21' }),
  ])

const IconExp = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 20V10' }), h('path', { d: 'M18 20V4' }),
  ])

const IconMatch = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    h('path', { d: 'M22 4 12 14.01l-3-3' }),
  ])

const IconSalary = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }),
  ])

const statCards = computed(() => [
  {
    label: 'Tổng tin tuyển dụng',
    value: overview.value.totalJobs.toLocaleString('vi-VN'),
    subtitle: 'Toàn bộ jobs_data',
    icon: IconJobs,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    loading: true,
    badge: 'Market',
    badgeClass: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Công ty đang tuyển',
    value: overview.value.uniqueCompanies || '—',
    subtitle: 'Số công ty unique',
    icon: IconCompany,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    loading: true,
    badge: 'TopCV',
    badgeClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Nhóm keyword',
    value: overview.value.uniqueKeywords || '—',
    subtitle: 'Vị trí tìm kiếm phổ biến',
    icon: IconKeyword,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    loading: true,
    badge: 'Search',
    badgeClass: 'bg-indigo-50 text-indigo-600',
  },
  {
    label: 'KN trung bình YC',
    value: overview.value.avgExperienceYears ? `${overview.value.avgExperienceYears} năm` : '—',
    subtitle: 'Từ exp_list / detail_experience',
    icon: IconExp,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    loading: true,
    badge: 'Exp',
    badgeClass: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'Jobs gợi ý bạn',
    value: recommendedJobs.value.length || '—',
    subtitle: state.value.lastAnalysisAt ? 'Đã phân tích CV' : 'Chưa phân tích',
    icon: IconMatch,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    loading: false,
    badge: recommendedJobs.value.length ? 'AI' : null,
    badgeClass: 'bg-sky-50 text-sky-600',
  },
  {
    label: 'Điểm phù hợp TB',
    value: averageMatchScore.value ? `${averageMatchScore.value}%` : '—',
    subtitle: `${overview.value.negotiablePercent}% tin "Thỏa thuận" lương`,
    icon: IconSalary,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    loading: true,
    badge: '2026',
    badgeClass: 'bg-amber-50 text-amber-600',
  },
])

onMounted(async () => {
  isLoadingStats.value = true
  try {
    const [dashboardRes, salaryRes] = await Promise.all([
      fetch('http://localhost:3000/api/analytics/dashboard'),
      fetch('http://localhost:3000/api/analytics/salary'),
    ])

    if (dashboardRes.ok) {
      dashboardData.value = await dashboardRes.json()
    }

    if (salaryRes.ok) {
      const salary = await salaryRes.json()
      salaryKeywords.value = salary.length
    }
  } catch (error) {
    console.error('Không thể tải thống kê dashboard:', error)
  } finally {
    isLoadingStats.value = false
  }
})
</script>

<style scoped>
.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, 'Courier New', monospace;
}
</style>
