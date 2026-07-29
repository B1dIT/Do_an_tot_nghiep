<template>
  <div class="flex flex-col gap-6 font-sans text-slate-800">
    <!-- ============================================================
         HEADER
    ============================================================ -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-600/20">
            <svg class="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 12l2 2 4-4" /><path d="M12 2a10 10 0 1 0 10 10" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900">Báo cáo phỏng vấn</h1>
            <p class="mt-0.5 text-sm text-slate-500">{{ jobTitle }}{{ company ? ` · ${company}` : '' }}</p>
            <p class="mt-1 font-mono text-[11px] text-slate-400">
              {{ dateLabel }} · {{ conversation.length }} câu hỏi
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="$emit('restart')"
            class="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-100"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Phỏng vấn lại
          </button>
          <button
            type="button"
            @click="handlePrint"
            class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-blue-500"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Tải PDF
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         ROW 1: TỔNG QUAN ĐIỂM SỐ
    ============================================================ -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <!-- Kiến thức chuyên môn -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <svg class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900">Kiến thức chuyên môn</p>
            <p class="text-[11px] text-slate-400">Tổng hợp từ câu trả lời qua DeepSeek</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg class="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" stroke-width="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                :stroke="knowledgeScoreColor"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="knowledgeOffset"
                class="transition-all duration-1000 ease-out"
              />
            </svg>
            <span class="absolute text-2xl font-extrabold" :class="knowledgeScoreTextClass">{{ knowledgeScore }}</span>
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Số câu đã trả lời</span>
              <span class="font-semibold text-slate-800">{{ conversation.length }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Độ dài trung bình</span>
              <span class="font-semibold text-slate-800">{{ avgAnswerLength }} từ</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Đánh giá AI</span>
              <span class="font-semibold" :class="knowledgeLevelClass">{{ knowledgeLevel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tác phong & Kỹ năng mềm -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <svg class="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900">Tác phong & Kỹ năng mềm</p>
            <p class="text-[11px] text-slate-400">Tổng hợp từ phân tích của Gemini Vision</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg class="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" stroke-width="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                :stroke="softScoreColor"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="softOffset"
                class="transition-all duration-1000 ease-out delay-200"
              />
            </svg>
            <span class="absolute text-2xl font-extrabold" :class="softScoreTextClass">{{ softScore }}</span>
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Số lần phân tích</span>
              <span class="font-semibold text-slate-800">{{ geminiResults.length || '—' }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Ánh mắt</span>
              <span class="font-semibold text-slate-800">{{ latestEyeContact || 'Tập trung tốt' }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Biểu cảm</span>
              <span class="font-semibold" :class="emotionLabelClass">{{ latestEmotion || 'Tự tin' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         ROW 2: CHAT TIMELINE
    ============================================================ -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-5 flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <svg class="h-4 w-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 class="text-base font-bold text-slate-900">Lịch sử câu hỏi & trả lời</h2>
      </div>

      <div v-if="conversation.length === 0" class="rounded-xl bg-slate-50 py-8 text-center">
        <p class="text-sm text-slate-400">Chưa có dữ liệu hội thoại.</p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="(item, index) in conversation"
          :key="index"
          class="rounded-xl border border-slate-100 bg-white"
        >
          <!-- Câu hỏi -->
          <div class="flex items-start gap-3 border-b border-slate-50 bg-gradient-to-r from-indigo-50/80 to-blue-50/40 px-4 py-3">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-[11px] font-bold text-indigo-600">
              {{ index + 1 }}
            </span>
            <div class="flex-1">
              <p class="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-500">Câu hỏi</p>
              <p class="text-sm leading-relaxed text-slate-800">{{ item.question }}</p>
            </div>
          </div>
          <!-- Trả lời -->
          <div class="flex items-start gap-3 px-4 py-3">
            <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <svg class="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Trả lời</p>
              <p class="text-sm leading-relaxed text-slate-700">{{ item.answer }}</p>
            </div>
            <!-- Gemini vision score badge -->
            <span
              v-if="item.visionScore !== undefined"
              class="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
              :class="visionBadgeClass(item.visionScore)"
              :title="`Tác phong: ${item.visionEyeContact || ''}`"
            >
              🎯 {{ item.visionScore }}/10
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         ROW 3: ĐÁNH GIÁ CHI TIẾT
    ============================================================ -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <!-- Ưu điểm -->
      <div class="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-6">
        <div class="mb-4 flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <svg class="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-emerald-800">Ưu điểm</h3>
        </div>
        <ul v-if="positivePoints.length" class="flex flex-col gap-2.5">
          <li v-for="(point, i) in positivePoints" :key="i" class="flex items-start gap-2 text-sm text-emerald-900">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{{ point }}</span>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-400 italic">Đang tổng hợp đánh giá...</p>
      </div>

      <!-- Nhược điểm & Cần cải thiện -->
      <div class="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-6">
        <div class="mb-4 flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <svg class="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-amber-800">Nhược điểm & Cần cải thiện</h3>
        </div>
        <ul v-if="negativePoints.length" class="flex flex-col gap-2.5">
          <li v-for="(point, i) in negativePoints" :key="i" class="flex items-start gap-2 text-sm text-amber-900">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 9v4" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="10" />
            </svg>
            <span>{{ point }}</span>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-400 italic">Đang tổng hợp đánh giá...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// ============================================================
// PROPS
// ============================================================
const props = defineProps({
  jobTitle: { type: String, default: 'Chưa xác định' },
  company: { type: String, default: '' },
  conversation: { type: Array, default: () => [] },
  // Mỗi item: { question: string, answer: string, visionScore?: number, visionEyeContact?: string }
  geminiResults: { type: Array, default: () => [] },
  // Mỗi item: { questionIndex, eye_contact, emotion, posture, score }
})

// ============================================================
// EMITS
// ============================================================
defineEmits(['restart'])

// ============================================================
// CONST
// ============================================================
const circumference = 2 * Math.PI * 34 // r = 34

// ============================================================
// COMPUTED: Thời gian
// ============================================================
const dateLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
})

// ============================================================
// COMPUTED: Điểm Kiến thức chuyên môn
// ============================================================
const knowledgeScore = computed(() => {
  if (!props.conversation.length) return 0
  // Tính điểm dựa trên độ dài câu trả lời & số lượng câu hỏi hoàn thành
  const avgLen = props.conversation.reduce((s, c) => s + (c.answer || '').length, 0) / props.conversation.length
  const lengthScore = Math.min(10, Math.round((avgLen / 100) * 10))
  const countScore = Math.min(10, props.conversation.length * 2)
  return Math.round((lengthScore + countScore) / 2)
})

const knowledgeOffset = computed(() =>
  circumference - (circumference * knowledgeScore.value) / 10
)

const knowledgeScoreColor = computed(() => {
  if (knowledgeScore.value >= 8) return '#10b981'
  if (knowledgeScore.value >= 6) return '#3b82f6'
  if (knowledgeScore.value >= 4) return '#f59e0b'
  return '#ef4444'
})

const knowledgeScoreTextClass = computed(() => {
  if (knowledgeScore.value >= 8) return 'text-emerald-600'
  if (knowledgeScore.value >= 6) return 'text-blue-600'
  if (knowledgeScore.value >= 4) return 'text-amber-600'
  return 'text-red-600'
})

const knowledgeLevel = computed(() => {
  if (knowledgeScore.value >= 8) return 'Xuất sắc'
  if (knowledgeScore.value >= 6) return 'Khá tốt'
  if (knowledgeScore.value >= 4) return 'Trung bình'
  return 'Cần cải thiện'
})

const knowledgeLevelClass = computed(() => {
  if (knowledgeScore.value >= 8) return 'text-emerald-600'
  if (knowledgeScore.value >= 6) return 'text-blue-600'
  if (knowledgeScore.value >= 4) return 'text-amber-600'
  return 'text-red-600'
})

const avgAnswerLength = computed(() => {
  if (!props.conversation.length) return 0
  const total = props.conversation.reduce((s, c) => s + (c.answer || '').split(/\s+/).filter(Boolean).length, 0)
  return Math.round(total / props.conversation.length)
})

// ============================================================
// COMPUTED: Điểm Tác phong
// ============================================================
const softScore = computed(() => {
  if (!props.geminiResults.length) return 7  // Mặc định khi chưa có phân tích
  const total = props.geminiResults.reduce((s, r) => s + (r.score || 0), 0)
  return Math.round(total / props.geminiResults.length)
})

const softOffset = computed(() =>
  circumference - (circumference * softScore.value) / 10
)

const softScoreColor = computed(() => {
  if (softScore.value >= 8) return '#10b981'
  if (softScore.value >= 6) return '#3b82f6'
  if (softScore.value >= 4) return '#f59e0b'
  return '#ef4444'
})

const softScoreTextClass = computed(() => {
  if (softScore.value >= 8) return 'text-emerald-600'
  if (softScore.value >= 6) return 'text-blue-600'
  if (softScore.value >= 4) return 'text-amber-600'
  return 'text-red-600'
})

const latestEyeContact = computed(() => {
  const last = props.geminiResults[props.geminiResults.length - 1]
  return last?.eye_contact || null
})

const latestEmotion = computed(() => {
  const last = props.geminiResults[props.geminiResults.length - 1]
  return last?.emotion || null
})

const emotionLabelClass = computed(() => {
  const e = latestEmotion.value?.toLowerCase() || ''
  if (e.includes('tự tin') || e.includes('thoải mái')) return 'text-emerald-600'
  if (e.includes('căng thẳng') || e.includes('lo lắng')) return 'text-amber-600'
  if (e.includes('thờ ơ') || e.includes('mệt')) return 'text-red-600'
  return 'text-slate-600'
})

// ============================================================
// COMPUTED: Đánh giá chi tiết
// ============================================================
const positivePoints = computed(() => {
  const points = []
  if (props.conversation.length >= 3) {
    points.push('Hoàn thành tốt các câu hỏi phỏng vấn, thể hiện sự chuẩn bị kỹ lưỡng.')
  }
  if (avgAnswerLength.value > 15) {
    points.push('Câu trả lời có chiều sâu, giải thích rõ ràng và có ví dụ cụ thể.')
  }
  if (softScore.value >= 6) {
    points.push('Tác phòng tự tin, ánh mắt tập trung vào camera, tư thế ngồi chuyên nghiệp.')
  }
  const emotion = latestEmotion.value?.toLowerCase() || ''
  if (emotion.includes('tự tin')) {
    points.push('Thể hiện sự tự tin trong suốt buổi phỏng vấn.')
  }
  if (!points.length) {
    points.push('Đã tham gia đầy đủ buổi phỏng vấn.')
  }
  return points
})

const negativePoints = computed(() => {
  const points = []
  if (props.conversation.length < 5) {
    points.push('Nên trả lời nhiều câu hỏi hơn để thể hiện toàn diện năng lực.')
  }
  if (avgAnswerLength.value < 10) {
    points.push('Câu trả lời còn ngắn, nên phát triển ý và đưa thêm ví dụ thực tế.')
  }
  if (softScore.value < 6 && softScore.value > 0) {
    points.push('Cần cải thiện tác phong: ánh mắt nên nhìn thẳng vào camera, tư thế ngồi thẳng lưng.')
  }
  const emotion = latestEmotion.value?.toLowerCase() || ''
  if (emotion.includes('căng thẳng')) {
    points.push('Có dấu hiệu căng thẳng, nên tập hít thở sâu và thư giãn trước khi phỏng vấn.')
  }
  if (emotion.includes('thờ ơ') || emotion.includes('mệt')) {
    points.push('Biểu cảm có vẻ thiếu năng lượng, nên thể hiện sự hứng thú và nhiệt tình hơn.')
  }
  if (!points.length && props.conversation.length > 0) {
    points.push('Không có nhược điểm đáng kể. Tiếp tục phát huy!')
  }
  return points
})

// ============================================================
// HELPER: Vision badge class
// ============================================================
function visionBadgeClass(score) {
  if (score >= 8) return 'bg-emerald-50 text-emerald-600'
  if (score >= 6) return 'bg-blue-50 text-blue-600'
  if (score >= 4) return 'bg-amber-50 text-amber-600'
  return 'bg-red-50 text-red-600'
}

// ============================================================
// PRINT / PDF
// ============================================================
function handlePrint() {
  window.print()
}
</script>

<style scoped>
@media print {
  /* Ẩn các nút khi in */
  button {
    display: none !important;
  }
  .shadow-sm, .shadow-md, .shadow-lg {
    box-shadow: none !important;
  }
}
</style>
