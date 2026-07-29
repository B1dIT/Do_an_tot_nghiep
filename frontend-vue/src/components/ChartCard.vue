<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', iconBg]">
          <div :class="iconColor">
            <slot name="icon" />
          </div>
        </div>
        <div>
          <h2 class="text-base font-semibold text-slate-900">{{ title }}</h2>
          <p class="text-xs text-slate-500">{{ subtitle }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <router-link
          v-if="actionTo"
          :to="actionTo"
          class="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
        >
          {{ actionLabel }}
        </router-link>
        <span v-if="badge" class="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-500">{{ badge }}</span>
      </div>
    </div>
    <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  badge: { type: String, default: '' },
  iconBg: { type: String, default: 'bg-slate-50' },
  iconColor: { type: String, default: 'text-slate-600' },
  actionTo: { type: String, default: '' },
  actionLabel: { type: String, default: 'Xem thêm →' },
})
</script>
