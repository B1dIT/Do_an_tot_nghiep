<template>
  <header class="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
    <div class="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <!-- Brand -->
      <router-link to="/" class="flex items-center gap-2.5 transition-opacity hover:opacity-90">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-900/40">
          <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
          </svg>
        </div>
        <div class="leading-tight">
          <p class="text-sm font-semibold tracking-wide text-white">CV Insight AI</p>
          <p class="text-[11px] text-slate-400">Nền tảng phân tích tuyển dụng thông minh</p>
        </div>
      </router-link>

      <!-- Navigation -->
      <nav class="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
          :class="isActive(item.to)
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'"
        >
          <component :is="item.icon" class="h-3.5 w-3.5 shrink-0" />
          <span class="hidden sm:inline">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Right actions -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="hidden items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/40 px-3 py-1.5 md:flex">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </span>
          <span class="font-mono text-[11px] text-emerald-300">Gateway <span class="text-emerald-500">:3000</span></span>
        </div>

        <div class="hidden items-center gap-2 rounded-full border border-blue-800/60 bg-blue-950/40 px-3 py-1.5 lg:flex">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-blue-400"></span>
          </span>
          <span class="font-mono text-[11px] text-blue-300">gRPC <span class="text-blue-500">:50051</span></span>
        </div>

        <span v-if="userFullName" class="hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-300 xl:inline">
          Xin chào, <span class="font-medium text-white">{{ userFullName }}</span>
        </span>

        <router-link
          v-if="currentUserRole === 'admin'"
          to="/admin"
          class="flex items-center gap-1.5 rounded-full border border-indigo-800/60 bg-indigo-950/40 px-3 py-1.5 text-[11px] font-medium text-indigo-300 transition-colors duration-200 hover:bg-indigo-900/50"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="M3 12l9 5 9-5" /><path d="M3 7v10l9 5 9-5V7" />
          </svg>
          Quản trị
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
</template>

<script setup>
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentUserRole =
  window.localStorage.getItem('user_role') || window.sessionStorage.getItem('user_role') || 'user'

const userFullName =
  window.localStorage.getItem('user_full_name') || window.sessionStorage.getItem('user_full_name') || ''

const IconDashboard = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }),
  ])

const IconCV = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z' }),
    h('path', { d: 'M14 2v6h6' }),
    h('path', { d: 'M16 13H8' }),
    h('path', { d: 'M16 17H8' }),
    h('path', { d: 'M10 9H8' }),
  ])

const IconInterview = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }),
  ])

const navItems = computed(() => [
  { to: '/', label: 'Dashboard', icon: IconDashboard },
  { to: '/cv-analysis', label: 'Phân tích CV', icon: IconCV },
  { to: '/jobs', label: 'Tra cứu việc làm', icon: IconInterview },
  { to: '/interview', label: 'Phỏng vấn AI', icon: IconInterview },
  { to: '/profile', label: 'Hồ sơ', icon: IconInterview },
])

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function handleLogout() {
  window.localStorage.removeItem('auth_token')
  window.localStorage.removeItem('user_role')
  window.localStorage.removeItem('user_full_name')
  window.sessionStorage.removeItem('auth_token')
  window.sessionStorage.removeItem('user_role')
  window.sessionStorage.removeItem('user_full_name')
  window.sessionStorage.removeItem('cv_insight_app_state')
  router.push('/login')
}
</script>
