<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-600/20">
            <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900">Tra cứu việc làm</h1>
            <p class="mt-0.5 text-sm text-slate-500">Tìm kiếm công việc theo ngành nghề và bắt đầu phỏng vấn AI</p>
          </div>
        </div>
      </div>

      <!-- Search bar -->
      <div class="mt-5 flex w-full gap-3">
        <div class="relative flex-1">
          <svg class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref="searchInputRef"
            v-model="keyword"
            type="text"
            placeholder="Nhập tên ngành nghề... VD: Data Analyst, Frontend Developer..."
            class="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            @keydown.enter="handleSearch"
          />
        </div>
        <button
          type="button"
          :disabled="isSearching || !keyword.trim()"
          @click="handleSearch"
          class="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
        >
          <svg v-if="isSearching" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
          </svg>
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          {{ isSearching ? 'Đang tìm...' : 'Tìm kiếm' }}
        </button>
      </div>
    </div>

    <!-- Search stats -->
    <div v-if="hasSearched" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <p class="text-sm text-slate-500">
        <span v-if="searchResults.length > 0">
          Tìm thấy <span class="font-semibold text-slate-800">{{ searchResults.length }}</span> kết quả cho
          <span class="font-semibold text-indigo-600">"{{ lastKeyword }}"</span>
        </span>
        <span v-else>
          Không tìm thấy kết quả nào cho <span class="font-semibold text-slate-600">"{{ lastKeyword }}"</span>
        </span>
      </p>
      <button
        v-if="searchResults.length > 0"
        type="button"
        @click="keyword = ''; searchResults = []; hasSearched = false"
        class="text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
      >
        Xoá kết quả
      </button>
    </div>

    <!-- Results grid -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-3 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
    >
      <div v-if="searchResults.length > 0" class="flex flex-col gap-4">
        <div
          v-for="(job, index) in searchResults"
          :key="job.id ?? index"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
        >
          <!-- Main card -->
          <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <svg class="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base font-bold text-slate-900 leading-snug">{{ job.title }}</h3>
                  <p class="mt-0.5 text-sm font-medium text-slate-500">{{ displayCompany(job.company) }}</p>
                </div>
                <!-- Nút trái tim Lưu / Bỏ lưu job -->
                <button
                  type="button"
                  @click="toggleSaveJob(job)"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                  :class="isJobSaved(job) ? 'bg-red-50' : 'bg-slate-100 hover:bg-slate-200'"
                  :title="isJobSaved(job) ? 'Bỏ lưu' : 'Lưu job'"
                >
                  <svg class="h-5 w-5 transition-all duration-200" viewBox="0 0 24 24"
                    :fill="isJobSaved(job) ? '#ef4444' : 'none'"
                    :stroke="isJobSaved(job) ? '#ef4444' : '#94a3b8'"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </button>
              </div>

              <!-- Badges -->
              <div class="mt-3 flex flex-wrap gap-1.5">
                <span v-if="job.salary" class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {{ job.salary }}
                </span>
                <span v-if="job.location" class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-600">
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {{ job.location }}
                </span>
                <span v-if="job.experience" class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-600">
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                  </svg>
                  {{ job.experience }}
                </span>
              </div>

              <p v-if="job.tags" class="mt-2 text-xs text-slate-400 line-clamp-1">{{ job.tags }}</p>
            </div>

            <!-- Action buttons -->
            <div class="flex shrink-0 flex-col gap-2 sm:items-end">
              <a
                v-if="job.job_url"
                :href="job.job_url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 sm:w-auto"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Xem bài gốc
              </a>
              <button
                type="button"
                @click="goToInterview(job)"
                class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-blue-500 sm:w-auto"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Phỏng vấn AI
              </button>
              <button
                type="button"
                @click="toggleDetail(job.id ?? index)"
                class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 sm:w-auto"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                </svg>
                {{ expandedId === (job.id ?? index) ? 'Thu gọn' : 'Xem chi tiết' }}
              </button>
            </div>
          </div>

          <!-- Expandable detail -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[600px] opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="max-h-[600px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div
              v-if="expandedId === (job.id ?? index)"
              class="border-t border-slate-100 bg-slate-50/80 px-5 py-4"
            >
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" />
                    </svg>
                    Mô tả công việc
                  </p>
                  <p class="text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                    {{ job.description || 'Chưa có mô tả chi tiết.' }}
                  </p>
                </div>
                <div v-if="job.tags" class="sm:border-l sm:border-slate-200 sm:pl-6">
                  <p class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                    </svg>
                    Tags & Kỹ năng
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="tag in job.tags.split(';')"
                      :key="tag"
                      class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm"
                    >{{ tag.trim() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- Empty state -->
    <div
      v-if="hasSearched && searchResults.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
    >
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <svg class="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <h3 class="mt-4 text-base font-semibold text-slate-700">Không tìm thấy kết quả</h3>
      <p class="mt-1 text-sm text-slate-400">Thử thay đổi từ khoá tìm kiếm hoặc chọn ngành nghề khác.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { displayCompany } from '../utils/companyUtils.js'
import { useAppState } from '../composables/useAppState'

const router = useRouter()
const { setSelectedJobForInterview } = useAppState()

const keyword = ref('')
const lastKeyword = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const hasSearched = ref(false)
const expandedId = ref(null)
const searchInputRef = ref(null)

// ============================================================
// Save / Unsave jobs (heart button)
// ============================================================
const savedJobIds = ref(new Set())
const savingJobs = ref(new Set())

function getToken() { return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '' }

async function fetchSavedJobs() {
  try {
    const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/saved-jobs', {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    if (!res.ok) return
    const data = await res.json()
    savedJobIds.value = new Set((data.savedJobs || []).map((j) => j.job_url))
  } catch (_) {}
}

function isJobSaved(job) {
  return savedJobIds.value.has(job.job_url)
}

async function toggleSaveJob(job) {
  const isSaved = isJobSaved(job)
  savingJobs.value = new Set([...savingJobs.value, job.job_url])

  try {
    if (isSaved) {
      // Bỏ lưu: tìm id từ savedJobs call — dùng job_url
      await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/saved-jobs/by-url', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ job_url: job.job_url }),
      })
      savedJobIds.value = new Set([...savedJobIds.value].filter((u) => u !== job.job_url))
    } else {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          job_url: job.job_url,
          salary: job.salary,
          location: job.location,
          description: job.description,
        }),
      })
      if (res.ok) {
        savedJobIds.value = new Set([...savedJobIds.value, job.job_url])
      }
    }
  } catch (_) {} finally {
    savingJobs.value = new Set([...savingJobs.value].filter((u) => u !== job.job_url))
  }
}

async function handleSearch() {
  const kw = keyword.value.trim()
  if (!kw) return

  lastKeyword.value = kw
  isSearching.value = true
  hasSearched.value = true
  expandedId.value = null

  try {
    const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/jobs/search?keyword=' + encodeURIComponent(kw))
    if (!res.ok) throw new Error(`Lỗi ${res.status}`)
    const data = await res.json()
    searchResults.value = data.jobs || []
  } catch (err) {
    console.error('❌ Lỗi tìm kiếm:', err)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function toggleDetail(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function goToInterview(job) {
  setSelectedJobForInterview({
    title: job.title,
    company: job.company,
    jd_text: job.description || '',
  })
  router.push('/interview')
}

onMounted(() => {
  searchInputRef.value?.focus()
  fetchSavedJobs()
})
</script>
