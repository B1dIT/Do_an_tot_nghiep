<template>
  <!-- Báo cáo phỏng vấn (hiện sau khi kết thúc) -->
  <InterviewReport
    v-if="showReport"
    :job-title="jobTitle"
    :company="company"
    :conversation="conversationPairs"
    :gemini-results="analysisHistory"
    @restart="handleRestart"
  />

  <!-- Giao diện phỏng vấn -->
  <div v-else class="flex flex-col gap-4 font-sans text-slate-800">
    <!-- Toast thông báo lỗi -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-[-10px] opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-[-10px] opacity-0"
    >
      <div
        v-if="toast.visible"
        class="fixed right-5 top-5 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 shadow-lg"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
          <svg class="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-900">{{ toast.title }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ toast.message }}</p>
        </div>
        <button type="button" @click="toast.visible = false" class="shrink-0 text-slate-400 hover:text-slate-600">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Header: thông tin phiên phỏng vấn -->
    <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-600/20">
          <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-900">Phỏng vấn: {{ jobTitle }}</h2>
          <p class="text-xs text-slate-500">{{ company }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
          :class="isSessionActive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-slate-100 text-slate-400'"
        >
          <span class="relative flex h-2 w-2">
            <span
              v-if="isSessionActive"
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              :class="isSessionActive ? 'bg-emerald-500' : 'bg-slate-300'"
              class="relative inline-flex h-2 w-2 rounded-full"
            ></span>
          </span>
          {{ isSessionActive ? 'Đang phỏng vấn' : 'Chưa bắt đầu' }}
        </span>
        <!-- Badge trạng thái Voice -->
        <span
          v-if="isSessionActive"
          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
          :class="voiceStateBadgeClass"
        >
          {{ voiceStateLabel }}
        </span>
      </div>
    </div>

    <!-- Khu vực chính: 2 cột (AI + Webcam) -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Cột trái: Màn hình AI -->
      <div
        class="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm"
        style="aspect-ratio: 4 / 3"
      >
        <!-- Hiệu ứng nền gradient động -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-blue-950/40"></div>
        <div
          class="absolute -inset-32 opacity-30"
          :class="isAiSpeaking ? 'animate-pulse' : ''"
          style="background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)"
        ></div>

        <!-- Nội dung trung tâm -->
        <div class="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
          <!-- Avatar AI -->
          <div
            class="relative mb-4"
            :class="isAiSpeaking ? 'animate-bounce-slow' : ''"
          >
            <div
              class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 shadow-2xl ring-4 ring-white/10"
              :class="isAiSpeaking ? 'ring-indigo-400/50 scale-105' : ''"
            >
              <svg class="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
              </svg>
            </div>
            <!-- Vòng tròn sóng âm khi AI đang nói -->
            <div v-if="isAiSpeaking" class="absolute -inset-4">
              <span
                v-for="i in 3"
                :key="i"
                class="absolute inset-0 rounded-full border-2 border-indigo-400/40"
                :style="{
                  animation: `ripple 1.5s ease-out ${i * 0.4}s infinite`,
                }"
              ></span>
            </div>
          </div>

          <!-- Tên AI -->
          <h3 class="text-lg font-bold text-white">Nhà tuyển dụng AI</h3>
          <p class="mt-0.5 text-xs text-slate-400">{{ jobTitle }} · {{ company }}</p>

          <!-- Voice Wave (hiệu ứng sóng âm) -->
          <div v-if="isAiSpeaking" class="mt-6 flex items-end gap-0.5">
            <span
              v-for="i in 5"
              :key="i"
              class="w-1 rounded-full bg-indigo-400"
              :style="{
                height: `${12 + Math.random() * 28}px`,
                animation: `soundWave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
              }"
            ></span>
          </div>
          <!-- Trạng thái listening -->
          <div v-else-if="isVoiceListening" class="mt-6 flex items-center gap-2">
            <span class="relative flex h-3 w-3">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
            <span class="text-xs text-emerald-400">Đang lắng nghe...</span>
          </div>
          <p v-else class="mt-6 text-xs text-slate-500">
            {{ isSessionActive ? 'Đang xử lý...' : 'Nhấn "Bắt đầu phỏng vấn" để bắt đầu' }}
          </p>

          <!-- Transcript tạm thời (interim) -->
          <p v-if="interimTranscript" class="mt-3 max-w-full truncate text-center text-[11px] text-slate-500 italic">
            "{{ interimTranscript }}"
          </p>
        </div>

        <!-- ID phiên (góc dưới) -->
        <div class="relative z-10 flex items-center justify-between border-t border-white/10 px-5 py-2.5">
          <span class="font-mono text-[10px] text-slate-500">
            {{ sessionId ? `Session: ${sessionId.slice(0, 12)}...` : 'DeepSeek Voice' }}
          </span>
          <span class="font-mono text-[10px] text-slate-500">
            Câu hỏi {{ questionCount }}/{{ totalQuestions }}
          </span>
        </div>
      </div>

      <!-- Cột phải: Webcam -->
      <div
        class="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm"
        style="aspect-ratio: 4 / 3"
      >
        <!-- Video Webcam -->
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="h-full w-full object-cover"
          :class="{ 'opacity-0': !isCameraReady }"
        ></video>

        <!-- Placeholder khi chưa có quyền camera -->
        <div
          v-if="!isCameraReady && !cameraError"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <svg class="h-8 w-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 7l-7 5 7 5V7Z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-400">Đang xin quyền Camera...</p>
        </div>

        <!-- Lỗi Camera -->
        <div
          v-if="cameraError"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-900/50">
            <svg class="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
              <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p class="text-sm font-medium text-white">Không thể truy cập Camera</p>
          <p class="text-xs text-slate-400">{{ cameraError }}</p>
          <button
            type="button"
            @click="requestMediaPermissions"
            class="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Thử lại
          </button>
        </div>

        <!-- Overlay khi Camera bị tắt -->
        <div
          v-if="isCameraReady && !isCameraOn"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80"
        >
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
            <svg class="h-7 w-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" /><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1-2h8l1 2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2Z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-400">Camera đã tắt</p>
        </div>

        <!-- Trạng thái Micro dưới góc -->
        <div class="absolute bottom-3 left-3 z-10 flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
            :class="isMicOn
              ? 'bg-emerald-900/60 text-emerald-300'
              : 'bg-red-900/60 text-red-300'"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span
                v-if="isMicOn"
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span
                :class="isMicOn ? 'bg-emerald-400' : 'bg-red-400'"
                class="relative inline-flex h-1.5 w-1.5 rounded-full"
              ></span>
            </span>
            {{ isMicOn ? 'Mic On' : 'Mic Off' }}
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
            :class="isCameraOn
              ? 'bg-emerald-900/60 text-emerald-300'
              : 'bg-red-900/60 text-red-300'"
          >
            {{ isCameraOn ? 'Cam On' : 'Cam Off' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Thanh điều khiển -->
    <div class="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <!-- Nút Mic -->
      <button
        type="button"
        :disabled="!isCameraReady"
        @click="toggleMic"
        class="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200"
        :class="isMicOn
          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          : 'bg-red-50 text-red-500 hover:bg-red-100'"
        :title="isMicOn ? 'Tắt Mic' : 'Bật Mic'"
      >
        <svg v-if="isMicOn" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
          <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>

      <!-- Nút Camera -->
      <button
        type="button"
        :disabled="!isCameraReady"
        @click="toggleCamera"
        class="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200"
        :class="isCameraOn
          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          : 'bg-red-50 text-red-500 hover:bg-red-100'"
        :title="isCameraOn ? 'Tắt Camera' : 'Bật Camera'"
      >
        <svg v-if="isCameraOn" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 7l-7 5 7 5V7Z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1-2h8l1 2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2Z" />
        </svg>
      </button>

      <!-- Divider -->
      <div class="mx-2 h-8 w-px bg-slate-200"></div>

      <!-- Nút Bắt đầu / Kết thúc -->
      <button
        type="button"
        :disabled="isLoading"
        @click="isSessionActive ? handleEndInterview() : handleStartInterview()"
        class="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none"
        :class="isSessionActive
          ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-600/20 hover:from-red-500 hover:to-rose-500 hover:shadow-lg hover:shadow-red-600/30 focus:ring-red-300'
          : 'bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg hover:shadow-indigo-600/30 focus:ring-indigo-300'"
      >
        <svg v-if="isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
        </svg>
        <svg v-else-if="isSessionActive" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
        {{ isLoading ? 'Đang xử lý...' : isSessionActive ? 'Kết thúc phỏng vấn' : 'Bắt đầu phỏng vấn' }}
      </button>
    </div>

    <!-- Kết quả phân tích tác phong (Gemini Vision) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="latestFrameResult"
        class="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm"
      >
        <div class="flex items-center justify-between border-b border-indigo-100 px-5 py-2.5">
          <div class="flex items-center gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
              <svg class="h-3.5 w-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" />
              </svg>
            </div>
            <span class="text-xs font-semibold text-indigo-700">Phân tích tác phong (Gemini Vision)</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="isAnalyzing"
              class="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-600"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              Đang phân tích...
            </span>
            <button
              type="button"
              @click="latestFrameResult = null"
              class="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            >
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          <!-- Điểm số -->
          <div class="rounded-xl bg-white/70 p-3 text-center">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Điểm</p>
            <p class="mt-1 font-mono text-2xl font-bold" :class="scoreColorClass">{{ latestFrameResult.score }}</p>
          </div>
          <!-- Ánh mắt -->
          <div class="rounded-xl bg-white/70 p-3">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ánh mắt</p>
            <p class="mt-1 text-xs font-medium text-slate-700">{{ latestFrameResult.eye_contact }}</p>
          </div>
          <!-- Biểu cảm -->
          <div class="rounded-xl bg-white/70 p-3">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Biểu cảm</p>
            <p class="mt-1 text-xs font-medium text-slate-700">{{ latestFrameResult.emotion }}</p>
          </div>
          <!-- Tư thế -->
          <div class="rounded-xl bg-white/70 p-3">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tư thế</p>
            <p class="mt-1 text-xs font-medium text-slate-700">{{ latestFrameResult.posture }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div> <!-- END interview UI -->
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { VoiceInterviewService } from '../services/voiceInterviewService.js'
import { analyzeFrame, captureWebcamFrame } from '../services/geminiVisionService.js'
import InterviewReport from './InterviewReport.vue'

// Props
const props = defineProps({
  jobTitle: { type: String, default: 'Chưa xác định' },
  company: { type: String, default: '' },
  geminiApiKey: { type: String, default: '' },
  sessionId: { type: String, default: null },
  totalQuestions: { type: Number, default: 5 },
})

// Emits
const emit = defineEmits(['start', 'end', 'update:mic', 'update:camera'])

// Refs
const videoRef = ref(null)
const mediaStream = ref(null)
let voiceService = null

// Media & Controls
const isCameraReady = ref(false)
const cameraError = ref('')
const isCameraOn = ref(true)
const isMicOn = ref(true)
const isLoading = ref(false)
const isSessionActive = ref(false)

// Interview tracking
const questionCount = ref(0)

// Voice Interview
const isAiSpeaking = ref(false)
const isVoiceListening = ref(false)
const interimTranscript = ref('')
const lastTranscript = ref('')
const lastAiResponse = ref('')

// Interview Report
const showReport = ref(false)
const conversationPairs = ref([])
const pendingTranscript = ref('')

// Gemini Vision Analysis
const latestFrameResult = ref(null)
const isAnalyzing = ref(false)
const analysisHistory = ref([])

// Score color for analysis panel
const scoreColorClass = computed(() => {
  const score = latestFrameResult.value?.score ?? 0
  if (score >= 8) return 'text-emerald-600'
  if (score >= 6) return 'text-blue-600'
  if (score >= 4) return 'text-amber-600'
  return 'text-red-600'
})

// Voice state badge
const voiceStateLabel = computed(() => {
  if (isAiSpeaking.value) return 'AI đang nói'
  if (isVoiceListening.value) return 'Đang nghe'
  return 'Chờ...'
})

const voiceStateBadgeClass = computed(() => {
  if (isAiSpeaking.value) return 'bg-indigo-900/60 text-indigo-300'
  if (isVoiceListening.value) return 'bg-emerald-900/60 text-emerald-300 animate-pulse'
  return 'bg-slate-700 text-slate-400'
})

// Toast
const toast = ref({ visible: false, title: '', message: '' })
let toastTimeoutId = null

function showToast(title, message) {
  toast.value = { visible: true, title, message }
  clearTimeout(toastTimeoutId)
  toastTimeoutId = setTimeout(() => {
    toast.value.visible = false
  }, 4500)
}

// Initialize Voice Interview Service
function initVoiceService() {
  voiceService = new VoiceInterviewService({
    onTranscript: (text) => {
      lastTranscript.value = text
      pendingTranscript.value = text  // Lưu để ghép với AI response
      interimTranscript.value = ''
      questionCount.value += 1
      console.log('[Voice] Transcript:', text)
      // Kích hoạt phân tích tác phong sau mỗi câu trả lời
      captureAndAnalyze()
    },
    onInterimTranscript: (text) => {
      interimTranscript.value = text
    },
    onAiResponse: (text) => {
      lastAiResponse.value = text
      // Ghép transcript (câu trả lời) với AI response (câu hỏi)
      if (pendingTranscript.value) {
        const lastVision = analysisHistory.value[analysisHistory.value.length - 1]
        conversationPairs.value.push({
          question: text.replace('[END_INTERVIEW]', '').trim(),
          answer: pendingTranscript.value,
          visionScore: lastVision?.score,
          visionEyeContact: lastVision?.eye_contact,
        })
        pendingTranscript.value = ''
      }
      console.log('[Voice] AI Response:', text.slice(0, 80) + '...')
    },
    onSpeakingStart: () => {
      isAiSpeaking.value = true
      isVoiceListening.value = false
    },
    onSpeakingEnd: () => {
      isAiSpeaking.value = false
    },
    onError: (error) => {
      console.error('[Voice] ❌', error)
      showToast('Voice Interview Error', error.message || 'An unexpected error occurred.')
    },
  })
}

// Webcam: request permissions & init video stream
async function requestMediaPermissions() {
  cameraError.value = ''
  isCameraReady.value = false

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
      audio: true,
    })

    mediaStream.value = stream
    isMicOn.value = true
    isCameraOn.value = true

    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }

    isCameraReady.value = true
  } catch (err) {
    console.error('Media access error:', err)
    handleMediaError(err)
  }
}

function handleMediaError(err) {
  const name = err.name || ''
  const message = err.message || ''

  if (name === 'NotAllowedError' || message.includes('permission') || message.includes('denied')) {
    cameraError.value = 'Bạn đã từ chối quyền truy cập. Vui lòng vào Cài đặt trình duyệt để cấp quyền Camera/Mic.'
  } else if (name === 'NotFoundError' || message.includes('not found')) {
    cameraError.value = 'Không tìm thấy thiết bị Camera hoặc Microphone trên máy tính của bạn.'
  } else if (name === 'NotReadableError' || message.includes('in use')) {
    cameraError.value = 'Camera/Mic đang được ứng dụng khác sử dụng. Vui lòng đóng ứng dụng đó và thử lại.'
  } else if (name === 'OverconstrainedError') {
    cameraError.value = 'Thiết bị không hỗ trợ cấu hình yêu cầu.'
  } else {
    cameraError.value = `Lỗi không xác định: ${message}`
  }
}

// Gemini Vision: capture & analyze posture
async function captureAndAnalyze() {
  const apiKey = props.geminiApiKey || ''
  if (!apiKey) return

  const frame = captureWebcamFrame(videoRef.value)
  if (!frame) return

  isAnalyzing.value = true
  try {
    const result = await analyzeFrame(frame, apiKey)
    if (result) {
      latestFrameResult.value = result
      analysisHistory.value.push({
        questionIndex: questionCount.value,
        timestamp: new Date().toISOString(),
        ...result,
      })
      console.log('[GeminiVision] Result:', result)
    }
  } catch (error) {
    console.error('[GeminiVision] Analysis error:', error)
  } finally {
    isAnalyzing.value = false
  }
}

// Mic: toggle on/off
function toggleMic() {
  if (!mediaStream.value) return
  isMicOn.value = !isMicOn.value
  mediaStream.value.getAudioTracks().forEach((track) => {
    track.enabled = isMicOn.value
  })
  emit('update:mic', isMicOn.value)
}

// Camera: toggle on/off
function toggleCamera() {
  if (!mediaStream.value) return
  isCameraOn.value = !isCameraOn.value
  mediaStream.value.getVideoTracks().forEach((track) => {
    track.enabled = isCameraOn.value
  })
  emit('update:camera', isCameraOn.value)
}

// Start interview (Voice)
function handleStartInterview() {
  if (!isCameraReady.value) {
    showToast('Chưa sẵn sàng', 'Vui lòng đợi Camera khởi tạo trước khi bắt đầu phỏng vấn.')
    return
  }

  if (!voiceService) initVoiceService()

  isLoading.value = true
  isSessionActive.value = true

  // Bắt đầu voice session — API keys ở backend
  voiceService.start(props.jobTitle, props.company)

  setTimeout(() => {
    isLoading.value = false
    emit('start')
  }, 300)
}

// ============================================================
// ĐIỀU KHIỂN: Kết thúc phỏng vấn → hiện báo cáo
// ============================================================
function handleEndInterview() {
  isLoading.value = true

  if (voiceService) {
    voiceService.stop()
  }

  isAiSpeaking.value = false
  isVoiceListening.value = false
  interimTranscript.value = ''

  // Lưu kết quả phỏng vấn vào backend
  saveInterviewResult()

  setTimeout(() => {
    isSessionActive.value = false
    isLoading.value = false
    showReport.value = true
    stopMediaTracks()
    emit('end')
  }, 300)
}

// Save interview result to database
async function saveInterviewResult() {
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
  if (!token || !conversationPairs.value.length) return

  // Tính điểm tổng quan
  const visionScores = analysisHistory.value.map((a) => a.score).filter(Boolean)
  const avgVision = visionScores.length
    ? Math.round(visionScores.reduce((s, v) => s + v, 0) / visionScores.length * 10)
    : 0
  const knowledgeScore = Math.min(100, conversationPairs.value.length * 20)

  try {
    await fetch('http://localhost:3000/api/interviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        job_title: props.jobTitle,
        company: props.company,
        overall_score: Math.round((avgVision + knowledgeScore) / 2),
        summary: `Hoàn thành ${conversationPairs.value.length} câu hỏi phỏng vấn vị trí ${props.jobTitle}.`,
        strengths: 'Tham gia đầy đủ buổi phỏng vấn, phản hồi qua giọng nói.',
        improvements: 'Tiếp tục luyện tập để cải thiện kỹ năng.',
        conversation: conversationPairs.value,
        gemini_analysis: analysisHistory.value,
      }),
    })
    console.log('[Save] Interview result saved to DB')
  } catch (err) {
    console.error('[Save] Failed to save interview:', err)
  }
}

// Restart interview
function handleRestart() {
  showReport.value = false
  conversationPairs.value = []
  analysisHistory.value = []
  latestFrameResult.value = null
  pendingTranscript.value = ''
  lastTranscript.value = ''
  lastAiResponse.value = ''
  questionCount.value = 0
  // Yêu cầu lại quyền media
  requestMediaPermissions()
}

function stopMediaTracks() {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop())
    mediaStream.value = null
  }
  isCameraReady.value = false
}

onMounted(() => {
  requestMediaPermissions()
  initVoiceService()
})

onBeforeUnmount(() => {
  if (voiceService) voiceService.stop()
  stopMediaTracks()
})
</script>

<style scoped>
/* === HIỆU ỨNG SÓNG ÂM (RIPPLE) QUANH AVATAR === */
@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

/* === HIỆU ỨNG VOICE WAVE (SÓNG ÂM DẠNG CỘT) === */
@keyframes soundWave {
  0% {
    transform: scaleY(0.4);
  }
  100% {
    transform: scaleY(1);
  }
}

/* === BOUNCE CHẬM CHO AVATAR KHI AI NÓI === */
.animate-bounce-slow {
  animation: bounceSlow 2s ease-in-out infinite;
}

@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style>
