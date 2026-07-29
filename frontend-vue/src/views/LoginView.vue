<template>
  
  <div class="flex min-h-screen w-full bg-white">

    
    <AuthBrandPanel />

    
    <div class="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10">
      <div class="w-full max-w-sm">

        
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Đăng nhập</h2>
          <p class="mt-1.5 text-sm text-slate-500">Chào mừng bạn quay trở lại CV Insight AI</p>
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

        
        <div
          v-if="successMessage"
          class="mb-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs font-medium text-emerald-600"
        >
          <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        
        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">

          
          <div class="flex flex-col gap-1.5">
            <label for="login-email" class="text-xs font-semibold text-slate-700">Email</label>
            <input
              id="login-email"
              v-model="formData.email"
              type="email"
              required
              autocomplete="email"
              placeholder="ban@vidu.com"
              class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label for="login-password" class="text-xs font-semibold text-slate-700">Mật khẩu</label>
              <a href="#" class="text-xs font-medium text-indigo-600 hover:text-indigo-700">Quên mật khẩu?</a>
            </div>
            <div class="relative">
              <input
                id="login-password"
                v-model="formData.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
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
          </div>

          
          <label class="flex items-center gap-2 pt-1">
            <input
              v-model="formData.rememberMe"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-xs font-medium text-slate-600">Ghi nhớ đăng nhập</span>
          </label>

          
          <button
            type="submit"
            :disabled="isLoading"
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg hover:shadow-indigo-600/30 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            <svg v-if="isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
            </svg>
            {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>

        
        <p class="mt-6 text-center text-sm text-slate-500">
          Chưa có tài khoản?
          <router-link to="/register" class="font-semibold text-indigo-600 hover:text-indigo-700">Đăng ký ngay</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>

import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthBrandPanel from '../components/AuthBrandPanel.vue'

const router = useRouter()
const route = useRoute()

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const isLoading = ref(false)          
const isPasswordVisible = ref(false)  
const errorMessage = ref('')          



const successMessage = ref(
  route.query.registered === 'true'
    ? 'Tạo tài khoản thành công. Vui lòng đăng nhập để tiếp tục.'
    : ''
)

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Email hoặc mật khẩu không chính xác.')
    }

    
    const storage = formData.rememberMe ? window.localStorage : window.sessionStorage
    storage.setItem('auth_token', data.token || 'demo-token')
    storage.setItem('user_role', data.user?.role || 'user')
    storage.setItem('user_full_name', data.user?.full_name || '')

    
    if (data.user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error)
    errorMessage.value =
      error.message === 'Failed to fetch'
        ? 'Không thể kết nối đến Node.js Gateway (Cổng 3000). Vui lòng kiểm tra lại kết nối hệ thống.'
        : error.message
  } finally {
    isLoading.value = false
  }
}
</script>