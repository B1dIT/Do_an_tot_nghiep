<template>
  
  <div class="min-h-screen w-screen bg-slate-100 font-sans text-slate-800 antialiased">

   
    <header class="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div class="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

        
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-900/40">
            <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
            </svg>
          </div>
          <div class="leading-tight">
            <p class="text-sm font-semibold tracking-wide text-white">CV Insight AI</p>
            <p class="text-[11px] text-slate-400">Nền tảng phân tích tuyển dụng thông minh</p>
          </div>
        </div>

        
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/40 px-3 py-1.5">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </span>
            <span class="font-mono text-[11px] text-emerald-300">Node.js Gateway: Connected <span class="text-emerald-500">:3000</span></span>
          </div>

          <div class="flex items-center gap-2 rounded-full border border-blue-800/60 bg-blue-950/40 px-3 py-1.5">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-blue-400"></span>
            </span>
            <span class="font-mono text-[11px] text-blue-300">Python gRPC Server: Active <span class="text-blue-500">:50051</span></span>
          </div>
        </div>
      </div>
    </header>

    
    <main class="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start">

       
        <section class="flex w-full flex-col gap-6 lg:w-[40%] lg:shrink-0 lg:basis-[40%]">

          
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-slate-900">Phân tích CV bằng AI</h2>
                <p class="mt-0.5 text-sm text-slate-500">Tải lên CV định dạng PDF để nhận gợi ý công việc phù hợp</p>
              </div>
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <svg class="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <path d="M14 2v6h6" />
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
                <p class="mt-1 text-xs text-slate-400">Chỉ hỗ trợ định dạng .PDF, dung lượng tối đa 10MB</p>
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

          
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-base font-semibold text-slate-900">Công việc gợi ý</h2>
              <span
                v-if="jobs.length > 0"
                class="rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-xs font-medium text-indigo-600"
              >{{ jobs.length }} kết quả</span>
            </div>

            
            <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <svg class="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
              </svg>
              <p class="text-sm text-slate-500">Node.js Gateway đang gọi đến Python gRPC Server để xử lý CV...</p>
            </div>

            
            <div v-else-if="jobs.length === 0" class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <svg class="h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <p class="max-w-[220px] text-sm text-slate-400">Kết quả gợi ý công việc sẽ hiển thị tại đây sau khi phân tích CV</p>
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
                    <p class="mt-0.5 text-xs font-medium text-slate-500">{{ job.company }}</p>
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
                      <path d="M9.5 22h5" /><path d="M10 19h4" />
                    </svg>
                    Lý do gợi ý từ AI
                  </p>
                  <p class="text-xs leading-relaxed text-slate-600">{{ job.reason }}</p>
                </div>

                
                <button
                  type="button"
                  class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Xem chi tiết công việc ↗
                </button>
              </article>
            </div>
          </div>
        </section>

        <!-- ============================================================
             CỘT PHẢI: Dashboard Thống kê Thị trường
             Tỉ lệ chính xác trên Desktop: 60% chiều rộng (basis-[60%])
             Trên Mobile: full-width, xếp dọc bên dưới cột trái
        ============================================================= -->
        <section class="flex w-full flex-col gap-6 lg:w-[60%] lg:shrink-0 lg:basis-[60%]">

          
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <svg class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-base font-semibold text-slate-900">Bản đồ số cầu tuyển dụng 3 Miền</h2>
                  <p class="text-xs text-slate-500">Phân bổ nhu cầu tuyển dụng: Hà Nội &middot; Đà Nẵng &middot; TP.HCM</p>
                </div>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-500">Doughnut Chart</span>
            </div>

            
            <div
              id="regional-demand-chart"
              class="flex h-72 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60"
            >
              <div class="flex flex-col items-center gap-2 text-slate-300">
                <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v10l7 4" />
                </svg>
                <p class="text-xs font-medium text-slate-400">Khu vực render Doughnut Chart (Hà Nội / Đà Nẵng / HCM)</p>
              </div>
            </div>

            
            <div class="mt-4 grid grid-cols-3 gap-3">
              <div class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500"></span>
                <span class="text-xs font-medium text-slate-600">Hà Nội</span>
              </div>
              <div class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400"></span>
                <span class="text-xs font-medium text-slate-600">Đà Nẵng</span>
              </div>
              <div class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-300"></span>
                <span class="text-xs font-medium text-slate-600">TP.HCM</span>
              </div>
            </div>
          </div>

          
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <svg class="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v18h18" />
                    <rect x="7" y="12" width="3" height="6" rx="0.5" />
                    <rect x="12.5" y="8" width="3" height="10" rx="0.5" />
                    <rect x="18" y="5" width="3" height="13" rx="0.5" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-base font-semibold text-slate-900">Xu hướng lương ngành IT năm 2026</h2>
                  <p class="text-xs text-slate-500">So sánh mức lương tối thiểu / tối đa theo vị trí</p>
                </div>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-500">Bar Chart</span>
            </div>

            
            <div
              id="salary-trend-chart"
              class="flex h-72 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60"
            >
              <div class="flex flex-col items-center gap-2 text-slate-300">
                <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18" />
                  <rect x="7" y="12" width="3" height="6" />
                  <rect x="12.5" y="8" width="3" height="10" />
                  <rect x="18" y="5" width="3" height="13" />
                </svg>
                <p class="text-xs font-medium text-slate-400">Khu vực render Bar Chart (Lương tối thiểu / tối đa)</p>
              </div>
            </div>

            
            <div class="mt-4 flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300"></span>
                <span class="text-xs font-medium text-slate-600">Lương tối thiểu</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600"></span>
                <span class="text-xs font-medium text-slate-600">Lương tối đa</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- ============================================================
         FOOTER
    ============================================================= -->
    <footer class="mx-auto max-w-screen-2xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
      Đồ án tốt nghiệp &middot; Kiến trúc Microservices: Vue 3 &middot; Node.js Express Gateway &middot; Python gRPC &middot; PostgreSQL
    </footer>
  </div>
</template>

<script setup>
// ============================================================
// IMPORTS
// ============================================================
import { ref, onMounted } from 'vue'

const selectedFile = ref(null)
const isLoading = ref(false)
const jobs = ref([])
const isDragActive = ref(false)
const errorMessage = ref('')

// Utility: format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

// Validate file type and size
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
  jobs.value = []
}

// handle file input change
function handleFileChange(event) {
  const file = event.target.files && event.target.files[0]
  validateAndSetFile(file)
}

// drag and drop handlers
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

// clear selected file
function clearSelectedFile() {
  selectedFile.value = null
  jobs.value = []
  errorMessage.value = ''
}

// Main: upload CV to Node.js gateway
async function uploadCV() {
  if (!selectedFile.value) {
    errorMessage.value = 'Vui lòng chọn file CV trước khi phân tích.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  jobs.value = []

  // package file into FormData
  const formData = new FormData()
  formData.append('cv', selectedFile.value)

  try {
    const response = await fetch('http://localhost:3000/api/upload-cv', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Node.js Gateway phản hồi lỗi: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    jobs.value = Array.isArray(data.recommended_jobs) ? data.recommended_jobs : []

    if (jobs.value.length === 0) {
      errorMessage.value = 'Không tìm thấy công việc phù hợp. Vui lòng thử lại với CV khác.'
    }
  } catch (error) {
    console.error('Lỗi khi tải lên và phân tích CV:', error)
    errorMessage.value = 'Không thể kết nối đến Node.js Gateway (Cổng 3000). Vui lòng kiểm tra lại kết nối hệ thống.'
  } finally {
    isLoading.value = false
  }
}

// Load Tailwind CDN dynamically
onMounted(() => {
  if (!document.getElementById('tailwind-cdn-script')) {
    const script = document.createElement('script')
    script.id = 'tailwind-cdn-script'
    script.src = 'https://cdn.tailwindcss.com'
    document.head.appendChild(script)
  }

  if (!document.getElementById('google-fonts-inter')) {
    const fontLink = document.createElement('link')
    fontLink.id = 'google-fonts-inter'
    fontLink.rel = 'stylesheet'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'
    document.head.appendChild(fontLink)
  }

  // ensure full-width layout via JS overrides
  const rootAppElement = document.getElementById('app')
  if (rootAppElement) {
    rootAppElement.style.maxWidth = 'none'
    rootAppElement.style.width = '100vw'
    rootAppElement.style.margin = '0'
    rootAppElement.style.padding = '0'
    rootAppElement.style.textAlign = 'left'
  }
  document.documentElement.style.width = '100%'
  document.body.style.width = '100%'
  document.body.style.margin = '0'
  document.body.style.display = 'block'
  document.body.style.backgroundColor = '#f1f5f9'
})
</script>

<style>
/* ============================================================
   GLOBAL RESET (KHÔNG SCOPED)
   Vite mặc định tạo sẵn CSS trong src/style.css làm co hẹp và
   căn giữa #app (thường là "#app { max-width: 1280px; margin: 0 auto }"
   và "body { display: flex; place-items: center }"). Khối reset này
   ghi đè để Dashboard luôn tràn hết chiều rộng màn hình (full-width),
   không bị lệch/thu nhỏ bất kể CSS mặc định của Vite còn tồn tại hay không.

   Ngoài ra: khai báo "color-scheme: light" để tránh trường hợp trình
   duyệt tự động phủ nền ĐEN mặc định (UA background) lên vùng chưa
   được CSS phủ tới khi hệ điều hành đang bật Dark Mode.
============================================================= */
html {
  width: 100vw;
  color-scheme: light;
}

html,
body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: block;
  background-color: #f1f5f9;
  overflow-x: hidden;
}

#app {
  max-width: none !important;
  width: 100vw !important;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  text-align: left !important;
  display: block !important;
}
</style>

<style scoped>
/* ============================================================
   TYPOGRAPHY: Thiết lập font chữ chính cho toàn trang
   - font-sans: Inter (nội dung chính, dễ đọc, chuẩn SaaS)
   - font-mono: JetBrains Mono (trạng thái hệ thống, số liệu kỹ thuật)
============================================================= */
:deep(body) {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, 'Courier New', monospace;
}

/* ============================================================
   THANH CUỘN TÙY CHỈNH: Đồng bộ với tông màu Slate/Indigo
============================================================= */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(203 213 225);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgb(148 163 184);
}
</style>