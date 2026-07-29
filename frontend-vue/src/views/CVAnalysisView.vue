<template>
  <div class="flex flex-col gap-6">
    <!-- Page header -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Phân tích CV & Gợi ý công việc</h1>
          <p class="mt-1 text-sm text-slate-500">Tải lên CV định dạng PDF để AI đối chiếu và đề xuất vị trí phù hợp nhất</p>
        </div>
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-600/20">
          <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6" />
          </svg>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <!-- Upload section -->
      <section class="w-full lg:w-[42%] lg:shrink-0">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Tải lên CV</h2>
              <p class="mt-0.5 text-sm text-slate-500">Hỗ trợ file PDF, tối đa 10MB</p>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <svg class="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
            </div>
          </div>

          <label
            for="cv-file-input"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            :class="[
              'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 ease-out',
              isDragActive
                ? 'scale-[1.01] border-indigo-500 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 shadow-inner'
                : selectedFile
                  ? 'border-indigo-300 bg-indigo-50/60'
                  : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40'
            ]"
          >
            <input
              id="cv-file-input"
              type="file"
              accept="application/pdf"
              class="sr-only"
              @change="handleFileChange"
            />

            <template v-if="!selectedFile">
              <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:-translate-y-0.5">
                <svg class="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M17 8l-5-5-5 5" />
                  <path d="M12 3v12" />
                </svg>
              </div>
              <p class="text-sm font-medium text-slate-700">Kéo thả file CV vào đây, hoặc <span class="text-indigo-600">chọn file</span></p>
              <p class="mt-1 text-xs text-slate-400">Chỉ hỗ trợ định dạng .PDF</p>
            </template>

            <template v-else>
              <div class="flex w-full max-w-xs items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-indigo-200">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                  <svg class="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1 text-left">
                  <p class="truncate text-sm font-medium text-slate-800">{{ selectedFile.name }}</p>
                  <p class="text-xs text-slate-400">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button
                  type="button"
                  @click.prevent="clearSelectedFile"
                  class="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500"
                  title="Xóa file"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <p class="mt-3 text-xs font-medium text-indigo-600">Nhấn để chọn file khác</p>
            </template>
          </label>

          <p v-if="errorMessage" class="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-500">
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errorMessage }}
          </p>

          <button
            type="button"
            :disabled="!selectedFile || isLoading"
            @click="uploadCV"
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg hover:shadow-indigo-600/30 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            <svg v-if="isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
            </svg>
            <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
            </svg>
            {{ isLoading ? 'Đang phân tích...' : 'Bắt đầu phân tích bằng AI' }}
          </button>
        </div>
      </section>

      <!-- Job recommendations -->
      <section class="w-full flex-1">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold text-slate-900">Công việc gợi ý</h2>
            <span
              v-if="jobs.length > 0"
              class="rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-xs font-medium text-indigo-600"
            >{{ jobs.length }} kết quả</span>
          </div>

          <div v-if="jobs.length > 0" class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Đề xuất phù hợp</p>
              <p class="mt-1 font-mono text-lg font-bold text-slate-900">{{ jobs.length }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Điểm phù hợp TB</p>
              <p class="mt-1 font-mono text-lg font-bold text-emerald-600">
                {{ averageMatchScore ? `${averageMatchScore}%` : 'Chưa có' }}
              </p>
            </div>
            <div class="col-span-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 sm:col-span-1">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Phân tích lần cuối</p>
              <p class="mt-1 text-sm font-medium text-slate-700">{{ lastAnalysisLabel }}</p>
            </div>
          </div>

          <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <svg class="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
            </svg>
            <p class="text-sm text-slate-500">Node.js Gateway đang gọi Python gRPC Server để xử lý CV...</p>
          </div>

          <div v-else-if="jobs.length === 0" class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <svg class="h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <p class="max-w-[260px] text-sm text-slate-400">Kết quả gợi ý công việc sẽ hiển thị tại đây sau khi phân tích CV</p>
          </div>

          <div v-else class="flex flex-col gap-4">
            <article
              v-for="(job, index) in jobs"
              :key="job.id ?? index"
              class="rounded-xl border border-slate-200 p-4 shadow-md transition-shadow duration-200 hover:shadow-lg"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-sm font-bold text-slate-900">{{ job.title }}</h3>
                <p class="mt-0.5 text-xs font-medium text-slate-500">{{ displayCompany(job.company) }}</p>
                </div>
                <span
                  v-if="job.match_score"
                  class="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-600"
                >{{ job.match_score }}% phù hợp</span>
              </div>

              <div class="mt-3 rounded-lg bg-slate-50 p-3">
                <p class="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.3 4.2 2.5 5.4.6.6 1 1.4 1.1 2.2M14.4 16.6c.1-.8.5-1.6 1.1-2.2C16.7 13.2 18 11.5 18 9a7 7 0 0 0-7-7Z" />
                  </svg>
                  Lý do gợi ý từ AI
                </p>
                <p class="text-xs leading-relaxed text-slate-600">{{ job.reason || job.match_reason || 'Không có mô tả lý do phù hợp.' }}</p>
              </div>

              <div class="mt-3 flex items-center gap-2">
                <a
                  v-if="job.job_url"
                  :href="job.job_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition-colors duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Xem chi tiết ↗
                </a>
                <button
                  type="button"
                  @click="goToInterview(job)"
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Phỏng vấn AI
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { displayCompany } from '../utils/companyUtils.js'
import { useAppState } from '../composables/useAppState'

const router = useRouter()
const { state, setRecommendedJobs, setCvInfo, setSelectedJobForInterview } = useAppState()

const selectedFile = ref(null)
const isLoading = ref(false)
const isDragActive = ref(false)
const errorMessage = ref('')

const jobs = computed(() => state.value.recommendedJobs)

const averageMatchScore = computed(() => {
  const scores = jobs.value
    .map((job) => Number(job.match_score))
    .filter((score) => Number.isFinite(score) && score > 0)

  if (scores.length === 0) return null
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
})

const lastAnalysisLabel = computed(() => {
  if (!state.value.lastAnalysisAt) return 'Chưa phân tích'
  return new Date(state.value.lastAnalysisAt).toLocaleString('vi-VN')
})

function formatFileSize(bytes) {
  if (bytes === 0) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

function validateAndSetFile(file) {
  if (!file) return

  if (file.type !== 'application/pdf') {
    errorMessage.value = 'Chỉ chấp nhận file định dạng PDF. Vui lòng chọn lại.'
    return
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024
  if (file.size > MAX_SIZE_BYTES) {
    errorMessage.value = 'Dung lượng file vượt quá giới hạn cho phép (10MB).'
    return
  }

  errorMessage.value = ''
  selectedFile.value = file
}

function handleFileChange(event) {
  const file = event.target.files && event.target.files[0]
  validateAndSetFile(file)
}

function handleDragOver() {
  isDragActive.value = true
}

function handleDragLeave() {
  isDragActive.value = false
}

function handleDrop(event) {
  isDragActive.value = false
  const file = event.dataTransfer.files && event.dataTransfer.files[0]
  validateAndSetFile(file)
}

function clearSelectedFile() {
  selectedFile.value = null
  errorMessage.value = ''
}

async function uploadCV() {
  if (!selectedFile.value) {
    errorMessage.value = 'Vui lòng chọn file CV trước khi phân tích.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const formData = new FormData()
  formData.append('cv', selectedFile.value)

  try {
    const response = await fetch('http://localhost:3000/api/uploads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('auth_token') || window.sessionStorage.getItem('auth_token') || ''}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || `Gateway phản hồi lỗi: ${response.status}`)
    }

    const recommendedJobs = Array.isArray(data.recommended_jobs) ? data.recommended_jobs : []
    setRecommendedJobs(recommendedJobs)
    setCvInfo({
      fileName: selectedFile.value.name,
      text: `File CV: ${selectedFile.value.name}`,
    })

    if (recommendedJobs.length === 0) {
      errorMessage.value = 'Không tìm thấy công việc phù hợp. Vui lòng thử lại với CV khác.'
    }
  } catch (error) {
    console.error('Lỗi khi tải lên và phân tích CV:', error)
    errorMessage.value = error.message || 'Không thể kết nối đến Node.js Gateway (Cổng 3000). Vui lòng kiểm tra lại kết nối hệ thống.'
  } finally {
    isLoading.value = false
  }
}

function goToInterview(job) {
  setSelectedJobForInterview(job)
  setCvInfo({
    fileName: selectedFile.value?.name || state.value.cvFileName,
    text: selectedFile.value ? `File CV: ${selectedFile.value.name}` : state.value.cvText,
  })
  router.push('/interview')
}
</script>

<style scoped>
.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, 'Courier New', monospace;
}
</style>
