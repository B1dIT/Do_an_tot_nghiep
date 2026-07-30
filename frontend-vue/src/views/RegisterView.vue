<template>
  
  <div class="flex min-h-screen w-full bg-white">

    
    <AuthBrandPanel />

    
    <div class="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10">
      <div class="w-full max-w-sm">

        
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Tạo tài khoản</h2>
          <p class="mt-1.5 text-sm text-slate-500">Bắt đầu hành trình tìm kiếm việc làm phù hợp cùng AI</p>
        </div>

        
        <div
          v-if="errorMessage"
          class="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-600"
        >
          <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        
        <form class="flex flex-col gap-4" @submit.prevent="handleRegister">

          
          <div class="flex flex-col gap-1.5">
            <label for="register-fullname" class="text-xs font-semibold text-slate-700">Họ và tên</label>
            <input
              id="register-fullname"
              v-model="formData.fullName"
              type="text"
              required
              autocomplete="name"
              placeholder="Nguyễn Văn A"
              class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          
          <div class="flex flex-col gap-1.5">
            <label for="register-email" class="text-xs font-semibold text-slate-700">Email</label>
            <input
              id="register-email"
              v-model="formData.email"
              type="email"
              required
              autocomplete="email"
              placeholder="ban@vidu.com"
              class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          
          <div class="flex flex-col gap-1.5">
            <label for="register-password" class="text-xs font-semibold text-slate-700">Mật khẩu</label>
            <div class="relative">
              <input
                id="register-password"
                v-model="formData.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                required
                minlength="8"
                autocomplete="new-password"
                placeholder="Tối thiểu 8 ký tự"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
              <button
                type="button"
                @click="isPasswordVisible = !isPasswordVisible"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                :title="isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                <svg v-if="isPasswordVisible" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a17 17 0 0 1-2.3 3.3M6.5 6.5A17.4 17.4 0 0 0 2 11s3.5 7 10 7a9 9 0 0 0 4-.9M14.1 14.1a3 3 0 1 1-4.2-4.2" />
                  <path d="M2 2l20 20" />
                </svg>
              </button>
            </div>
            
            <div v-if="formData.password" class="mt-1 flex items-center gap-1.5">
              <span
                v-for="level in 4"
                :key="level"
                :class="[
                  'h-1 flex-1 rounded-full transition-colors duration-200',
                  level <= passwordStrength ? passwordStrengthColor : 'bg-slate-200'
                ]"
              ></span>
            </div>
            <p v-if="formData.password" class="text-[11px] font-medium" :class="passwordStrengthTextColor">
              {{ passwordStrengthLabel }}
            </p>
          </div>

          
          <div class="flex flex-col gap-1.5">
            <label for="register-confirm-password" class="text-xs font-semibold text-slate-700">Xác nhận mật khẩu</label>
            <input
              id="register-confirm-password"
              v-model="formData.confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4"
              :class="isConfirmPasswordMismatched
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'"
            />
            <p v-if="isConfirmPasswordMismatched" class="text-[11px] font-medium text-red-500">
              Mật khẩu xác nhận không khớp.
            </p>
          </div>

          
          <label class="flex items-start gap-2 pt-1">
            <input
              v-model="formData.agreedToTerms"
              type="checkbox"
              required
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-xs font-medium leading-relaxed text-slate-600">
              Tôi đồng ý với <a href="#" class="text-indigo-600 hover:text-indigo-700">Điều khoản dịch vụ</a> và <a href="#" class="text-indigo-600 hover:text-indigo-700">Chính sách bảo mật</a>
            </span>
          </label>

          
          <button
            type="submit"
            :disabled="isLoading || isConfirmPasswordMismatched"
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg hover:shadow-indigo-600/30 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            <svg v-if="isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
            </svg>
            {{ isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản' }}
          </button>
        </form>

        
        <p class="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?
          <router-link to="/login" class="font-semibold text-indigo-600 hover:text-indigo-700">Đăng nhập</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>

import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthBrandPanel from '../components/AuthBrandPanel.vue'

const router = useRouter()

const formData = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false,
})

const isLoading = ref(false)          
const isPasswordVisible = ref(false)  
const errorMessage = ref('')          


const isConfirmPasswordMismatched = computed(() => {
  return formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password
})

const passwordStrength = computed(() => {
  const value = formData.password
  let score = 0
  if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value)) score += 1
  if (/[0-9]/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  return score
})

const passwordStrengthLabel = computed(() => {
  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá mạnh', 'Rất mạnh']
  return labels[passwordStrength.value]
})

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-red-400'
  if (passwordStrength.value === 2) return 'bg-amber-400'
  if (passwordStrength.value === 3) return 'bg-blue-400'
  return 'bg-emerald-500'
})

const passwordStrengthTextColor = computed(() => {
  if (passwordStrength.value <= 1) return 'text-red-500'
  if (passwordStrength.value === 2) return 'text-amber-500'
  if (passwordStrength.value === 3) return 'text-blue-500'
  return 'text-emerald-600'
})


async function handleRegister() {
  errorMessage.value = ''

  if (isConfirmPasswordMismatched.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập.'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Không thể tạo tài khoản. Vui lòng thử lại.')
    }

    
    router.push({ path: '/login', query: { registered: 'true' } })
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error)
    errorMessage.value =
      error.message === 'Failed to fetch'
        ? 'Không thể kết nối đến Node.js Gateway (Cổng 3000). Vui lòng kiểm tra lại kết nối hệ thống.'
        : error.message
  } finally {
    isLoading.value = false
  }
}
</script>