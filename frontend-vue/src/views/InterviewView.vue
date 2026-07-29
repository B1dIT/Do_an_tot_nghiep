<template>
  <div class="flex flex-col gap-6">
    <!-- Page header -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Phỏng vấn ảo bằng AI</h1>
          <p class="mt-1 text-sm text-slate-500">Luyện tập phỏng vấn thực tế với Gemini AI trước khi ứng tuyển</p>
        </div>
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-600/20">
          <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Job selection (when no active interview) -->
    <div v-if="!activeJob" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="mb-1 text-base font-semibold text-slate-900">Chọn vị trí phỏng vấn</h2>
      <p class="mb-5 text-sm text-slate-500">Chọn từ danh sách công việc gợi ý hoặc nhập thông tin thủ công</p>

      <div v-if="recommendedJobs.length > 0" class="mb-6">
        <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Từ kết quả phân tích CV</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="(job, index) in recommendedJobs"
            :key="job.id ?? index"
            type="button"
            @click="selectJob(job)"
            class="rounded-xl border border-slate-200 p-4 text-left transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md"
          >
            <p class="text-sm font-bold text-slate-900">{{ job.title }}</p>
            <p class="mt-0.5 text-xs text-slate-500">{{ displayCompany(job.company) }}</p>
            <span
              v-if="job.match_score"
              class="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600"
            >{{ job.match_score }}% phù hợp</span>
          </button>
        </div>
      </div>

      <div v-else class="mb-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p class="text-sm text-slate-500">Chưa có công việc gợi ý.</p>
        <router-link
          to="/cv-analysis"
          class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Phân tích CV trước
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <div class="border-t border-slate-100 pt-6">
        <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Hoặc nhập thủ công</p>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="manual-job-title" class="text-xs font-semibold text-slate-700">Tên vị trí</label>
            <input
              id="manual-job-title"
              v-model="manualForm.title"
              type="text"
              placeholder="VD: Frontend Developer"
              class="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="manual-company" class="text-xs font-semibold text-slate-700">Công ty</label>
            <input
              id="manual-company"
              v-model="manualForm.company"
              type="text"
              placeholder="VD: FPT Software"
              class="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>
        <div class="mt-4 flex flex-col gap-1.5">
          <label for="manual-jd" class="text-xs font-semibold text-slate-700">Mô tả công việc (JD)</label>
          <textarea
            id="manual-jd"
            v-model="manualForm.jdText"
            rows="3"
            placeholder="Nhập mô tả công việc hoặc yêu cầu tuyển dụng..."
            class="resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          ></textarea>
        </div>
        <button
          type="button"
          :disabled="!manualForm.title.trim()"
          @click="selectManualJob"
          class="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Bắt đầu với vị trí này
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Active interview -->
    <div v-else>
      <div class="mb-4 flex items-center justify-between">
        <button
          type="button"
          @click="backToJobSelection"
          class="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Chọn vị trí khác
        </button>
      </div>

      <AIInterviewRoom
        :job-title="activeJob.title"
        :company="activeJob.company"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AIInterviewRoom from '../components/AIInterviewRoom.vue'
import { displayCompany } from '../utils/companyUtils.js'
import { useAppState } from '../composables/useAppState'

const { state, clearSelectedJobForInterview } = useAppState()

const activeJob = ref(null)
const manualForm = reactive({
  title: '',
  company: 'Công ty chưa xác định',
  jdText: '',
})

const recommendedJobs = computed(() => state.value.recommendedJobs)
const cvText = computed(() => state.value.cvText || state.value.cvFileName || 'Nội dung CV ứng viên')

function selectJob(job) {
  activeJob.value = job
}

function selectManualJob() {
  activeJob.value = {
    title: manualForm.title.trim(),
    company: manualForm.company.trim() || 'Công ty chưa xác định',
    jd_text: manualForm.jdText.trim(),
  }
}

function backToJobSelection() {
  activeJob.value = null
  clearSelectedJobForInterview()
}

onMounted(() => {
  const preselected = state.value.selectedJobForInterview
  if (preselected) {
    activeJob.value = preselected
    clearSelectedJobForInterview()
  }
})
</script>
