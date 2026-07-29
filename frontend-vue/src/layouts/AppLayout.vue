<template>
  <div class="min-h-screen w-full bg-slate-100 font-sans text-slate-800 antialiased">
    <AppNavbar />
    <main class="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
    <footer class="mx-auto max-w-screen-2xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
      Đồ án tốt nghiệp &middot; Kiến trúc Microservices: Vue 3 &middot; Node.js Express Gateway &middot; Python gRPC &middot; PostgreSQL
    </footer>
  </div>
</template>

<script setup>
import AppNavbar from '../components/AppNavbar.vue'
</script>
