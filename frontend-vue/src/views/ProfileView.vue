<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-600/20">
          <svg class="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-900">Hồ sơ của tôi</h1>
          <p class="mt-0.5 text-sm text-slate-500">Quản lý thông tin cá nhân, lịch sử phỏng vấn và công việc đã lưu</p>
        </div>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <button v-for="tab in tabs" :key="tab.key" type="button" @click="activeTab = tab.key"
        class="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
        :class="activeTab === tab.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'">
        <span class="hidden sm:inline">{{ tab.label }}</span>
        <span class="sm:hidden">{{ tab.short }}</span>
      </button>
    </div>

    <!-- TAB: Profile -->
    <div v-if="activeTab === 'profile'" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div v-if="isLoadingProfile" class="flex items-center justify-center py-12">
        <svg class="h-6 w-6 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
        </svg>
      </div>
      <div v-else class="grid gap-5 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Họ tên</label>
          <input v-model="profileForm.full_name" type="text" class="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Email</label>
          <input :value="profileForm.email" disabled type="email" class="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-400" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Số điện thoại</label>
          <input v-model="profileForm.phone" type="text" placeholder="VD: 0901234567" class="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" />
        </div>
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="text-xs font-semibold text-slate-700">Kỹ năng</label>
          <textarea v-model="profileForm.skills" rows="2" placeholder="VD: Python, SQL, Machine Learning..." class="resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"></textarea>
        </div>
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="text-xs font-semibold text-slate-700">Kinh nghiệm</label>
          <textarea v-model="profileForm.experience" rows="3" placeholder="VD: 3 năm Data Analyst tại FPT..." class="resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"></textarea>
        </div>
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="text-xs font-semibold text-slate-700">CV (PDF)</label>
          <div class="flex items-center gap-3">
            <input ref="cvInputRef" type="file" accept=".pdf" @change="handleCvUpload" class="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100" />
            <span v-if="profileForm.cv_file_name" class="text-xs text-emerald-600">✅ {{ profileForm.cv_file_name }}</span>
          </div>
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button type="button" @click="fetchProfile" class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Huỷ</button>
        <button type="button" :disabled="isSaving" @click="saveProfile"
          class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300">
          <svg v-if="isSaving" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path></svg>
          {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </div>
    </div>

    <!-- TAB: Lịch sử phỏng vấn -->
    <div v-if="activeTab === 'history'" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div v-if="isLoadingHistory" class="flex items-center justify-center py-12">
        <svg class="h-6 w-6 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path></svg>
      </div>
      <div v-else-if="interviews.length === 0" class="py-12 text-center">
        <p class="text-sm text-slate-400">Chưa có buổi phỏng vấn nào.</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div v-for="iv in interviews" :key="iv.id" class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">{{ iv.job_title }}</p>
            <p class="text-xs text-slate-500">{{ iv.company }} · {{ iv.overall_score ? iv.overall_score + '/100 điểm' : 'Chưa có điểm' }}</p>
            <p class="mt-1 text-[11px] text-slate-400">{{ new Date(iv.created_at).toLocaleDateString('vi-VN') }}</p>
          </div>
          <button type="button" @click="deleteInterview(iv.id)"
            class="flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Xoá
          </button>
        </div>
      </div>
    </div>

    <!-- TAB: Job đã lưu -->
    <div v-if="activeTab === 'saved'" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div v-if="isLoadingSaved" class="flex items-center justify-center py-12">
        <svg class="h-6 w-6 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path></svg>
      </div>
      <div v-else-if="savedJobs.length === 0" class="py-12 text-center">
        <p class="text-sm text-slate-400">Chưa lưu công việc nào.</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div v-for="sj in savedJobs" :key="sj.id" class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div class="min-w-0 flex-1">
            <a :href="sj.job_url" target="_blank" class="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">{{ sj.job_title }}</a>
            <p class="text-xs text-slate-500">{{ sj.company }}<span v-if="sj.salary"> · {{ sj.salary }}</span></p>
          </div>
          <button type="button" @click="unsaveJob(sj.id)"
            class="flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Bỏ lưu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const tabs = [
  { key: 'profile', label: 'Hồ sơ cá nhân', short: 'Hồ sơ' },
  { key: 'history', label: 'Lịch sử phỏng vấn', short: 'Phỏng vấn' },
  { key: 'saved', label: 'Công việc đã lưu', short: 'Đã lưu' },
]
const activeTab = ref('profile')

// Profile
const isLoadingProfile = ref(true)
const isSaving = ref(false)
const profileForm = reactive({ full_name: '', email: '', phone: '', skills: '', experience: '', cv_file_name: '' })
const cvInputRef = ref(null)

function getToken() { return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '' }
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` } }

async function fetchProfile() {
  isLoadingProfile.value = true
  try {
    const res = await fetch(`${API}/api/profile`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Lỗi ' + res.status)
    const data = await res.json()
    if (data.profile) {
      profileForm.full_name = data.profile.user_name || data.profile.full_name || ''
      profileForm.email = data.profile.user_email || data.profile.email || ''
      profileForm.phone = data.profile.phone || ''
      profileForm.skills = data.profile.skills || ''
      profileForm.experience = data.profile.experience || ''
      profileForm.cv_file_name = data.profile.cv_file_name || ''
    }
  } catch (err) {
    console.error('❌ Lỗi tải profile:', err)
  } finally { isLoadingProfile.value = false }
}

async function saveProfile() {
  isSaving.value = true
  try {
    const res = await fetch(`${API}/api/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ phone: profileForm.phone, skills: profileForm.skills, experience: profileForm.experience }),
    })
    if (!res.ok) throw new Error('Lỗi ' + res.status)
    alert('✅ Cập nhật hồ sơ thành công!')
  } catch (err) {
    console.error('❌ Lỗi lưu profile:', err)
    alert('❌ Không thể lưu hồ sơ.')
  } finally { isSaving.value = false }
}

async function handleCvUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('cv', file)
  try {
    const res = await fetch(`${API}/api/profile/cv`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    })
    if (!res.ok) throw new Error('Lỗi ' + res.status)
    const data = await res.json()
    profileForm.cv_file_name = data.file_name
    alert('✅ Tải CV thành công!')
  } catch (err) {
    console.error('❌ Lỗi upload CV:', err)
    alert('❌ Không thể tải CV.')
  }
}

// Interview history
const isLoadingHistory = ref(false)
const interviews = ref([])

async function fetchInterviews() {
  isLoadingHistory.value = true
  try {
    const res = await fetch(`${API}/api/interviews`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Lỗi ' + res.status)
    const data = await res.json()
    interviews.value = data.interviews || []
  } catch (err) { console.error('❌ Lỗi tải lịch sử:', err)
  } finally { isLoadingHistory.value = false }
}

async function deleteInterview(id) {
  if (!confirm('Xoá bản ghi phỏng vấn này?')) return
  try {
    const res = await fetch(`${API}/api/interviews/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (!res.ok) throw new Error('Lỗi ' + res.status)
    interviews.value = interviews.value.filter((i) => i.id !== id)
  } catch (err) { console.error('❌ Lỗi xoá:', err) }
}

// Saved jobs
const isLoadingSaved = ref(false)
const savedJobs = ref([])

async function fetchSavedJobs() {
  isLoadingSaved.value = true
  try {
    const res = await fetch(`${API}/api/saved-jobs`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Lỗi ' + res.status)
    const data = await res.json()
    savedJobs.value = data.savedJobs || []
  } catch (err) { console.error('❌ Lỗi tải job đã lưu:', err)
  } finally { isLoadingSaved.value = false }
}

async function unsaveJob(id) {
  if (!confirm('Bỏ lưu công việc này?')) return
  try {
    const res = await fetch(`${API}/api/saved-jobs/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (!res.ok) throw new Error('Lỗi ' + res.status)
    savedJobs.value = savedJobs.value.filter((j) => j.id !== id)
  } catch (err) { console.error('❌ Lỗi bỏ lưu:', err) }
}

onMounted(() => {
  fetchProfile()
  fetchInterviews()
  fetchSavedJobs()
})
</script>
