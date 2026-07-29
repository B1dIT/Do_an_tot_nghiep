<template>
  
  <div class="min-h-screen w-full bg-slate-100 font-sans text-slate-800 antialiased">

    
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
            <p class="text-[11px] text-slate-400">Bảng điều khiển quản trị viên</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          
          <div class="flex items-center gap-1.5 rounded-full border border-indigo-800/60 bg-indigo-950/40 px-3 py-1.5">
            <svg class="h-3.5 w-3.5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="M3 12l9 5 9-5" /><path d="M3 7v10l9 5 9-5V7" />
            </svg>
            <span class="font-mono text-[11px] text-indigo-300">Admin: {{ currentUserFullName }}</span>
          </div>

          
          <router-link
            to="/"
            class="flex items-center gap-1.5 rounded-full border border-indigo-700 bg-indigo-950/40 px-3 py-1.5 text-[11px] font-medium text-indigo-300 transition-colors duration-200 hover:border-indigo-500 hover:bg-indigo-900/50 hover:text-white"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" />
            </svg>
            Phân tích CV
          </router-link>

          
          <button
            type="button"
            @click="handleLogout"
            class="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-colors duration-200 hover:border-red-800 hover:bg-red-950/40 hover:text-red-300"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>

    
    <main class="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">

      
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-medium text-slate-500">Tổng số người dùng</p>
          <p class="mt-1.5 font-mono text-2xl font-bold text-slate-900">{{ summary.totalUsers }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-medium text-slate-500">CV đã phân tích</p>
          <p class="mt-1.5 font-mono text-2xl font-bold text-slate-900">{{ summary.totalCvAnalyzed }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-medium text-slate-500">Quản trị viên</p>
          <p class="mt-1.5 font-mono text-2xl font-bold text-slate-900">{{ summary.totalAdmins }}</p>
        </div>
      </div>

      
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Quản lý người dùng</h2>
            <p class="mt-0.5 text-sm text-slate-500">Danh sách tài khoản đã đăng ký trong hệ thống</p>
          </div>
          <button
            type="button"
            @click="openCreateForm"
            class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <span class="text-base leading-none">+</span>
            Thêm người dùng
          </button>
        </div>

        <form
          v-if="showUserForm"
          @submit.prevent="submitUserForm"
          class="mb-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-900">{{ editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng' }}</h3>
            <button type="button" @click="closeUserForm" class="text-xs font-medium text-slate-500 hover:text-slate-800">Đóng</button>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label class="text-xs font-semibold text-slate-600">
              Họ tên
              <input v-model.trim="userForm.full_name" required type="text" class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-500" />
            </label>
            <label class="text-xs font-semibold text-slate-600">
              Email
              <input v-model.trim="userForm.email" required type="email" class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-500" />
            </label>
            <label class="text-xs font-semibold text-slate-600">
              Mật khẩu <span v-if="editingUser" class="font-normal text-slate-400">(để trống nếu giữ nguyên)</span>
              <input v-model="userForm.password" :required="!editingUser" minlength="8" type="password" class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-500" />
            </label>
            <label class="text-xs font-semibold text-slate-600">
              Vai trò
              <select v-model="userForm.role" class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-500">
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>
          <p v-if="formError" class="mt-3 text-xs font-medium text-red-500">{{ formError }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" @click="closeUserForm" class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white">Hủy</button>
            <button type="submit" :disabled="isSaving" class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300">
              {{ isSaving ? 'Đang lưu...' : 'Lưu người dùng' }}
            </button>
          </div>
        </form>

        
        <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <svg class="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
          </svg>
          <p class="text-sm text-slate-500">Đang tải danh sách người dùng từ Node.js Gateway...</p>
        </div>

        
        <div
          v-else-if="errorMessage"
          class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/50 py-12 text-center"
        >
          <svg class="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p class="max-w-sm text-sm text-red-500">{{ errorMessage }}</p>
        </div>

        
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[640px] table-auto border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th class="py-2.5 pr-4">Họ tên</th>
                <th class="py-2.5 pr-4">Email</th>
                <th class="py-2.5 pr-4">Vai trò</th>
                <th class="py-2.5 pr-4">Ngày tạo</th>
                <th class="py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="userItem in userList"
                :key="userItem.id"
                class="border-b border-slate-100 transition-colors hover:bg-slate-50"
              >
                <td class="py-3 pr-4 font-medium text-slate-800">{{ userItem.full_name }}</td>
                <td class="py-3 pr-4 text-slate-600">{{ userItem.email }}</td>
                <td class="py-3 pr-4">
                  <span
                    :class="[
                      'rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold',
                      userItem.role === 'admin'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-slate-100 text-slate-600'
                    ]"
                  >{{ userItem.role }}</span>
                </td>
                <td class="py-3 pr-4 text-xs text-slate-400">{{ formatDate(userItem.created_at) }}</td>
                <td class="py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button type="button" @click="openEditForm(userItem)" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Sửa</button>
                    <button type="button" @click="deleteUser(userItem)" class="text-xs font-semibold text-red-500 hover:text-red-700">Xóa</button>
                  </div>
                </td>
              </tr>

              
              <tr v-if="userList.length === 0">
                <td colspan="5" class="py-10 text-center text-sm text-slate-400">
                  Chưa có người dùng nào trong hệ thống.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// ============================================================
// IMPORTS
// ============================================================
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ============================================================
// STATE MANAGEMENT
// ============================================================
const userList = ref([])          
const isLoading = ref(true)       
const errorMessage = ref('')      
const showUserForm = ref(false)
const editingUser = ref(null)
const isSaving = ref(false)
const formError = ref('')
const userForm = reactive({
  full_name: '',
  email: '',
  password: '',
  role: 'user',
})

const summary = reactive({
  totalUsers: 0,
  totalCvAnalyzed: 0,
  totalAdmins: 0,
})

const currentUserFullName =
  window.localStorage.getItem('user_full_name') ||
  window.sessionStorage.getItem('user_full_name') ||
  'Quản trị viên'

// ============================================================

// ============================================================
function formatDate(isoDateString) {
  if (!isoDateString) return '—'
  return new Date(isoDateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function resetUserForm() {
  userForm.full_name = ''
  userForm.email = ''
  userForm.password = ''
  userForm.role = 'user'
  formError.value = ''
}

function openCreateForm() {
  editingUser.value = null
  resetUserForm()
  showUserForm.value = true
}

function openEditForm(userItem) {
  editingUser.value = userItem
  userForm.full_name = userItem.full_name || ''
  userForm.email = userItem.email || ''
  userForm.password = ''
  userForm.role = userItem.role || 'user'
  formError.value = ''
  showUserForm.value = true
}

function closeUserForm() {
  showUserForm.value = false
  editingUser.value = null
  resetUserForm()
}

function getAuthHeaders() {
  const token =
    window.localStorage.getItem('auth_token') || window.sessionStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const responseText = await response.text()

  if (!contentType.includes('application/json')) {
    throw new Error(
      response.status === 404
        ? 'API quản lý user chưa được nạp. Hãy khởi động lại Node.js Gateway.'
        : `Gateway trả về dữ liệu không hợp lệ (HTTP ${response.status}).`
    )
  }

  try {
    return responseText ? JSON.parse(responseText) : {}
  } catch {
    throw new Error('Gateway trả về JSON không hợp lệ.')
  }
}

async function submitUserForm() {
  isSaving.value = true
  formError.value = ''
  const isEditing = Boolean(editingUser.value)
  const payload = {
    full_name: userForm.full_name,
    email: userForm.email,
    role: userForm.role,
  }
  if (userForm.password) payload.password = userForm.password

  try {
    const response = await fetch(
      isEditing
        ? `http://localhost:3000/api/admin/users/${editingUser.value.id}`
        : 'http://localhost:3000/api/admin/users',
      {
        method: isEditing ? 'PATCH' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    )
    const data = await readApiResponse(response)
    if (!response.ok) throw new Error(data.message || 'Không thể lưu người dùng.')

    closeUserForm()
    await fetchUserList()
  } catch (error) {
    formError.value = error.message
  } finally {
    isSaving.value = false
  }
}

async function deleteUser(userItem) {
  if (!window.confirm(`Bạn có chắc muốn xóa tài khoản ${userItem.email}?`)) return

  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${userItem.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    const data = await readApiResponse(response)
    if (!response.ok) throw new Error(data.message || 'Không thể xóa người dùng.')
    await fetchUserList()
  } catch (error) {
    errorMessage.value = error.message
  }
}

// ============================================================





// ============================================================
async function fetchUserList() {
  isLoading.value = true
  errorMessage.value = ''

  const token =
    window.localStorage.getItem('auth_token') || window.sessionStorage.getItem('auth_token')

  try {
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 403) {
      throw new Error('Bạn không có quyền truy cập danh sách người dùng.')
    }

    if (!response.ok) {
      throw new Error(`Node.js Gateway phản hồi lỗi: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    userList.value = Array.isArray(data.users) ? data.users : []

    summary.totalUsers = userList.value.length
    summary.totalAdmins = userList.value.filter((u) => u.role === 'admin').length
    summary.totalCvAnalyzed = data.total_cv_analyzed ?? 0
  } catch (error) {
    console.error('Lỗi khi tải danh sách người dùng:', error)
    errorMessage.value =
      error.message === 'Failed to fetch'
        ? 'Không thể kết nối đến Node.js Gateway (Cổng 3000). Endpoint GET /api/admin/users có thể chưa được tạo.'
        : error.message
  } finally {
    isLoading.value = false
  }
}

// ============================================================

// ============================================================
function handleLogout() {
  window.localStorage.removeItem('auth_token')
  window.localStorage.removeItem('user_role')
  window.localStorage.removeItem('user_full_name')
  window.sessionStorage.removeItem('auth_token')
  window.sessionStorage.removeItem('user_role')
  window.sessionStorage.removeItem('user_full_name')
  router.push('/login')
}

onMounted(() => {
  fetchUserList()
})
</script>