<template>
  
  <aside class="relative hidden w-full flex-col justify-between overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:w-[42%]">

    
    <div class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"></div>

    
    <div class="relative z-10 flex items-center gap-2.5">
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

    
    <div class="relative z-10 max-w-md">
      <h1 class="text-3xl font-bold leading-tight text-white">
        Kết nối CV của bạn với <span class="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">cơ hội việc làm phù hợp nhất</span>
      </h1>
      <p class="mt-4 text-sm leading-relaxed text-slate-400">
        Hệ thống AI phân tích CV và đối chiếu với dữ liệu thị trường tuyển dụng theo thời gian thực, giúp bạn tìm ra công việc phù hợp năng lực chỉ trong vài giây.
      </p>

      <ul class="mt-8 flex flex-col gap-4">
        <li class="flex items-start gap-3">
          <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          <span class="text-sm text-slate-300">Phân tích CV bằng AI, gợi ý công việc phù hợp trong vài giây</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          <span class="text-sm text-slate-300">Thống kê thị trường tuyển dụng theo từng khu vực</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          <span class="text-sm text-slate-300">Cập nhật xu hướng lương ngành IT theo từng năm</span>
        </li>
      </ul>
    </div>

    
    <div class="relative z-10 flex flex-wrap items-center gap-2">
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
  </aside>
</template>

<script setup>


</script>