<template>
  
  <div class="min-h-screen w-screen bg-slate-100 antialiased">
    <router-view />
  </div>
</template>

<script setup>

import { onMounted } from 'vue'

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

  // ============================================================
  
  
  
  
  
  // ============================================================
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


body {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, 'Courier New', monospace;
}


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