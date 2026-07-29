<template>
  <!-- ============================================================
       ROOT WRAPPER
       Component tự chứa toàn bộ 3 bước (Setup -> Chat -> Report)
       bằng state nội bộ "currentStep". Có thể nhúng trực tiếp vào
       trang, hoặc bọc trong Modal/Dialog tuỳ cách bạn dùng.
  ============================================================= -->
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-4 font-sans text-slate-800">

    <!-- ============================================================
         TOAST THÔNG BÁO LỖI
    ============================================================= -->
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
          <p class="text-sm font-semibold text-slate-900">Đã xảy ra lỗi</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ toast.message }}</p>
        </div>
        <button type="button" @click="toast.visible = false" class="shrink-0 text-slate-400 hover:text-slate-600">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- ============================================================
         BƯỚC 1: CẤU HÌNH PHỎNG VẤN (SETUP)
    ============================================================= -->
    <div v-if="currentStep === 1" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-600/20">
          <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">Phỏng vấn ảo bằng AI</h2>
          <p class="text-sm text-slate-500">Luyện tập phỏng vấn thực tế trước khi ứng tuyển thật</p>
        </div>
      </div>

      <!-- Thông tin Job đang chọn -->
      <div class="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Vị trí ứng tuyển</p>
        <p class="mt-1 text-base font-bold text-slate-900">{{ jobTitle }}</p>
        <p class="text-sm font-medium text-slate-600">{{ company }}</p>
      </div>

      <!-- Form cấu hình -->
      <div class="flex flex-col gap-5">

        <!-- Ngôn ngữ -->
        <div class="flex flex-col gap-1.5">
          <label for="interview-language" class="text-xs font-semibold text-slate-700">Ngôn ngữ phỏng vấn</label>
          <select
            id="interview-language"
            v-model="setupForm.language"
            class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">Tiếng Anh</option>
          </select>
        </div>

        <!-- Mức độ / Level -->
        <div class="flex flex-col gap-1.5">
          <label for="interview-difficulty" class="text-xs font-semibold text-slate-700">Mức độ (Level)</label>
          <select
            id="interview-difficulty"
            v-model="setupForm.difficulty"
            class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <option value="intern">Intern</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
        </div>

        <!-- Số lượng câu hỏi -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label for="interview-num-questions" class="text-xs font-semibold text-slate-700">Số lượng câu hỏi</label>
            <span class="rounded-full bg-indigo-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-indigo-600">{{ setupForm.numQuestions }} câu</span>
          </div>
          <input
            id="interview-num-questions"
            v-model.number="setupForm.numQuestions"
            type="range"
            min="3"
            max="10"
            step="1"
            class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
          />
          <div class="flex justify-between text-[11px] text-slate-400">
            <span>3 câu</span>
            <span>10 câu</span>
          </div>
        </div>
      </div>

      <!-- Nút bắt đầu -->
      <button
        type="button"
        :disabled="isLoading"
        @click="startInterview"
        class="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg hover:shadow-indigo-600/30 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        <svg v-if="isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
        </svg>
        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
        {{ isLoading ? 'Đang khởi tạo phiên phỏng vấn...' : 'Bắt đầu phỏng vấn' }}
      </button>
    </div>

    <!-- ============================================================
         BƯỚC 2: PHÒNG PHỎNG VẤN CHAT (INTERVIEW ROOM)
    ============================================================= -->
    <div v-else-if="currentStep === 2" class="flex h-[640px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <!-- Header: tiến trình câu hỏi + nút kết thúc -->
      <div class="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
            <svg class="h-4.5 w-4.5 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900">Phỏng vấn: {{ jobTitle }}</p>
            <p class="font-mono text-[11px] font-medium text-indigo-500">Câu hỏi {{ questionCount }} / {{ totalQuestions }}</p>
          </div>
        </div>

        <button
          type="button"
          :disabled="isEnding"
          @click="handleEndEarly"
          class="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg v-if="isEnding" class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
          </svg>
          <svg v-else class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
          {{ isEnding ? 'Đang kết thúc...' : 'Kết thúc sớm' }}
        </button>
      </div>

      <!-- Thanh tiến trình dạng bar -->
      <div class="h-1 w-full shrink-0 bg-slate-100">
        <div
          class="h-1 bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <!-- Khung Chat -->
      <div ref="chatBodyRef" class="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['flex items-end gap-2.5', message.role === 'user' ? 'flex-row-reverse' : 'flex-row']"
        >
          <!-- Avatar -->
          <div
            :class="[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              message.role === 'user' ? 'bg-slate-700' : 'bg-gradient-to-br from-indigo-500 to-blue-600'
            ]"
          >
            <svg v-if="message.role === 'user'" class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <svg v-else class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
            </svg>
          </div>

          <!-- Bong bóng chat -->
          <div
            :class="[
              'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
              message.role === 'user'
                ? 'rounded-br-sm bg-gradient-to-br from-indigo-600 to-blue-600 text-white'
                : 'rounded-bl-sm border border-slate-200 bg-slate-50 text-slate-700'
            ]"
          >
            <p class="whitespace-pre-wrap">{{ message.content }}</p>
          </div>
        </div>

        <!-- Chỉ báo AI đang soạn tin nhắn -->
        <div v-if="isSending" class="flex items-end gap-2.5">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600">
            <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" />
            </svg>
          </div>
          <div class="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-3">
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></span>
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></span>
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
          </div>
        </div>
      </div>

      <!-- Khung nhập tin nhắn -->
      <div class="shrink-0 border-t border-slate-200 bg-white p-4">
        <div class="flex items-end gap-3">
          <textarea
            ref="textareaRef"
            v-model="userMessage"
            :disabled="isSending || isEnding"
            rows="2"
            placeholder="Nhập câu trả lời của bạn... (Enter để gửi, Shift+Enter để xuống dòng)"
            class="flex-1 resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
            @keydown="handleTextareaKeydown"
          ></textarea>

          <button
            type="button"
            :disabled="!userMessage.trim() || isSending || isEnding"
            @click="sendMessage"
            class="flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            <svg v-if="isSending" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
            </svg>
            <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 3 3 9-3 9 19-9Z" /><path d="M6 12h16" />
            </svg>
            <span class="hidden sm:inline">Gửi câu trả lời</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         BƯỚC 3: BÁO CÁO ĐÁNH GIÁ KẾT QUẢ (EVALUATION DASHBOARD)
    ============================================================= -->
    <div v-else-if="currentStep === 3 && reportData" class="flex flex-col gap-6">

      <!-- Card điểm số tổng quan -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">

          <!-- Vòng tròn điểm số -->
          <div class="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg class="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" stroke-width="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                :stroke="scoreStrokeColor"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="circleCircumference"
                :stroke-dashoffset="circleDashOffset"
                class="transition-all duration-700 ease-out"
              />
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="text-3xl font-extrabold" :class="scoreTextColor">{{ reportData.overall_score }}</span>
              <span class="text-[11px] font-medium text-slate-400">/ 100 điểm</span>
            </div>
          </div>

          <!-- Tóm tắt -->
          <div class="flex-1">
            <p class="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.3 4.2 2.5 5.4.6.6 1 1.4 1.1 2.2M14.4 16.6c.1-.8.5-1.6 1.1-2.2C16.7 13.2 18 11.5 18 9a7 7 0 0 0-7-7Z" />
              </svg>
              Nhận xét tổng quan từ AI
            </p>
            <p class="text-sm leading-relaxed text-slate-700">{{ reportData.summary }}</p>
          </div>
        </div>
      </div>

      <!-- 2 Cột: Điểm mạnh / Điểm cần cải thiện -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">

        <!-- Điểm mạnh -->
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div class="mb-3 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <svg class="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-emerald-800">Điểm mạnh</h3>
          </div>
          <ul class="flex flex-col gap-2.5">
            <li v-for="(strength, index) in reportData.strengths" :key="index" class="flex items-start gap-2 text-sm text-emerald-900">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{{ strength }}</span>
            </li>
          </ul>
        </div>

        <!-- Điểm cần cải thiện -->
        <div class="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div class="mb-3 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <svg class="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-amber-800">Điểm cần cải thiện</h3>
          </div>
          <ul class="flex flex-col gap-2.5">
            <li v-for="(improvement, index) in reportData.improvements" :key="index" class="flex items-start gap-2 text-sm text-amber-900">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9v4" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="10" />
              </svg>
              <span>{{ improvement }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Chi tiết từng câu hỏi -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-base font-bold text-slate-900">Chi tiết từng câu hỏi</h3>
        <div class="flex flex-col gap-4">
          <div
            v-for="(item, index) in reportData.detailed_feedback"
            :key="index"
            class="rounded-xl border border-slate-200 p-4"
          >
            <div class="mb-3 flex items-start justify-between gap-3">
              <div class="flex items-start gap-2">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[11px] font-semibold text-slate-500">{{ index + 1 }}</span>
                <p class="text-sm font-semibold text-slate-900">{{ item.question }}</p>
              </div>
              <span
                class="shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold"
                :class="getFeedbackScoreBadgeClass(item.score)"
              >{{ item.score }}/10</span>
            </div>

            <!-- Câu trả lời của ứng viên -->
            <div class="mb-2.5 rounded-lg bg-slate-50 p-3">
              <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Câu trả lời của bạn</p>
              <p class="text-xs leading-relaxed text-slate-600">{{ item.user_answer }}</p>
            </div>

            <!-- Gợi ý đáp án chuẩn -->
            <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
              <p class="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
                Gợi ý đáp án chuẩn từ AI
              </p>
              <p class="text-xs leading-relaxed text-slate-700">{{ item.suggested_answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Nút hành động -->
      <div class="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          @click="restartInterview"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg hover:shadow-indigo-600/30"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
          Phỏng vấn lại
        </button>
        <button
          type="button"
          @click="emit('close')"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:bg-slate-50"
        >
          Quay lại danh sách Job
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// IMPORTS
// ============================================================
import { ref, reactive, computed, nextTick, watch } from 'vue'
import axios from 'axios'

// ============================================================
// PROPS & EMITS
// ============================================================
const props = defineProps({
  jobTitle: { type: String, default: 'Vị trí chưa xác định' },
  company: { type: String, default: 'Công ty chưa xác định' },
  jdText: { type: String, default: '' },
  cvText: { type: String, default: '' },
})

const emit = defineEmits(['close'])

// ============================================================
// AXIOS INSTANCE
// Tự động đính kèm JWT token (Bearer Auth) vào mọi request,
// đọc từ localStorage hoặc sessionStorage (tuỳ nơi LoginView.vue
// đã lưu lúc đăng nhập).
// ============================================================
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('auth_token') || window.sessionStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============================================================
// STATE: ĐIỀU HƯỚNG BƯỚC (STEP)
// 1 = Setup | 2 = Interview Room | 3 = Report Dashboard
// ============================================================
const currentStep = ref(1)

// ============================================================
// STATE: BƯỚC 1 - CẤU HÌNH PHỎNG VẤN
// ============================================================
const setupForm = reactive({
  language: 'vi',       // 'vi' | 'en'
  difficulty: 'junior',  // 'intern' | 'junior' | 'mid' | 'senior'
  numQuestions: 5,       // 3 - 10
})

const isLoading = ref(false) // Loading khi gọi /api/interview/start

// ============================================================
// STATE: BƯỚC 2 - PHÒNG PHỎNG VẤN CHAT
// ============================================================
const sessionId = ref(null)
const messages = ref([])          // [{ id, role: 'ai' | 'user', content }]
const userMessage = ref('')
const isSending = ref(false)      // Loading khi gọi /api/interview/chat
const isEnding = ref(false)       // Loading khi gọi /api/interview/end
const questionCount = ref(0)      // Số thứ tự câu hỏi hiện tại
const totalQuestions = ref(5)     // Snapshot số câu hỏi đã chọn ở Bước 1
const chatBodyRef = ref(null)     // Ref tới khung chat để tự động scroll
const textareaRef = ref(null)

// ============================================================
// STATE: BƯỚC 3 - BÁO CÁO KẾT QUẢ
// ============================================================
const reportData = ref(null) // { overall_score, summary, strengths, improvements, detailed_feedback }

// ============================================================
// STATE: TOAST THÔNG BÁO LỖI
// ============================================================
const toast = reactive({ visible: false, message: '' })
let toastTimeoutId = null

function showErrorToast(message) {
  toast.message = message
  toast.visible = true
  clearTimeout(toastTimeoutId)
  toastTimeoutId = setTimeout(() => {
    toast.visible = false
  }, 4500)
}

function extractErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage
}

// ============================================================
// COMPUTED: THANH TIẾN TRÌNH (%) TRONG PHÒNG CHAT
// ============================================================
const progressPercent = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.min(100, Math.round((questionCount.value / totalQuestions.value) * 100))
})

// ============================================================
// COMPUTED: VÒNG TRÒN ĐIỂM SỐ (BƯỚC 3)
// ============================================================
const circleCircumference = 2 * Math.PI * 52 // r = 52 (khớp với thuộc tính "r" trong SVG)

const circleDashOffset = computed(() => {
  const score = reportData.value?.overall_score ?? 0
  return circleCircumference - (circleCircumference * score) / 100
})

const scoreStrokeColor = computed(() => {
  const score = reportData.value?.overall_score ?? 0
  if (score >= 80) return '#10b981' // emerald-500
  if (score >= 60) return '#3b82f6' // blue-500
  if (score >= 40) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
})

const scoreTextColor = computed(() => {
  const score = reportData.value?.overall_score ?? 0
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
})

function getFeedbackScoreBadgeClass(score) {
  if (score >= 8) return 'bg-emerald-50 text-emerald-600'
  if (score >= 6) return 'bg-blue-50 text-blue-600'
  if (score >= 4) return 'bg-amber-50 text-amber-600'
  return 'bg-red-50 text-red-600'
}

// ============================================================
// HÀM TIỆN ÍCH: Sinh ID duy nhất cho mỗi tin nhắn
// ============================================================
function generateMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ============================================================
// HÀM TIỆN ÍCH: Tự động cuộn khung chat xuống cuối
// ============================================================
async function scrollChatToBottom() {
  await nextTick()
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

// ============================================================
// BƯỚC 1 -> BƯỚC 2: BẮT ĐẦU PHỎNG VẤN
// POST /api/interview/start
// ============================================================
async function startInterview() {
  isLoading.value = true

  try {
    const { data } = await apiClient.post('/api/interview/start', {
      cv_text: props.cvText,
      job_title: props.jobTitle,
      company: props.company,
      jd_text: props.jdText,
      language: setupForm.language,
      num_questions: setupForm.numQuestions,
      difficulty: setupForm.difficulty,
    })

    sessionId.value = data.session_id
    totalQuestions.value = setupForm.numQuestions
    questionCount.value = 1
    messages.value = [{ id: generateMessageId(), role: 'ai', content: data.initial_message }]

    currentStep.value = 2
    await scrollChatToBottom()
  } catch (error) {
    console.error('Lỗi khi bắt đầu phỏng vấn:', error)
    showErrorToast(extractErrorMessage(error, 'Không thể bắt đầu phỏng vấn. Vui lòng kiểm tra kết nối và thử lại.'))
  } finally {
    isLoading.value = false
  }
}

// ============================================================
// BƯỚC 2: GỬI CÂU TRẢ LỜI TRONG PHÒNG CHAT
// POST /api/interview/chat
// ============================================================
async function sendMessage() {
  const trimmedMessage = userMessage.value.trim()
  if (!trimmedMessage || isSending.value || isEnding.value) return

  // Hiển thị ngay tin nhắn của người dùng lên khung chat (Optimistic UI)
  messages.value.push({ id: generateMessageId(), role: 'user', content: trimmedMessage })
  userMessage.value = ''
  await scrollChatToBottom()

  isSending.value = true

  try {
    const { data } = await apiClient.post('/api/interview/chat', {
      session_id: sessionId.value,
      user_message: trimmedMessage,
    })

    messages.value.push({ id: generateMessageId(), role: 'ai', content: data.ai_message })
    await scrollChatToBottom()

    if (data.is_finished) {
      // Phỏng vấn đã hoàn tất toàn bộ câu hỏi -> tự động lấy báo cáo
      await endInterview()
    } else {
      questionCount.value += 1
    }
  } catch (error) {
    console.error('Lỗi khi gửi câu trả lời:', error)
    showErrorToast(extractErrorMessage(error, 'Gửi câu trả lời thất bại. Vui lòng thử lại.'))
  } finally {
    isSending.value = false
  }
}

// ============================================================
// XỬ LÝ PHÍM TẮT: Enter để gửi, Shift+Enter để xuống dòng
// ============================================================
function handleTextareaKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// ============================================================
// BƯỚC 2 -> BƯỚC 3: KẾT THÚC PHỎNG VẤN & LẤY BÁO CÁO
// POST /api/interview/end
// Được gọi tự động khi is_finished === true, hoặc khi người dùng
// bấm "Kết thúc sớm".
// ============================================================
async function endInterview() {
  if (!sessionId.value) return

  isEnding.value = true

  try {
    const { data } = await apiClient.post('/api/interview/end', {
      session_id: sessionId.value,
    })

    reportData.value = data
    currentStep.value = 3
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo kết quả:', error)
    showErrorToast(extractErrorMessage(error, 'Không thể tải báo cáo kết quả. Vui lòng thử lại.'))
  } finally {
    isEnding.value = false
  }
}

function handleEndEarly() {
  endInterview()
}

// ============================================================
// BƯỚC 3 -> BƯỚC 1: PHỎNG VẤN LẠI (RESET TOÀN BỘ STATE)
// ============================================================
function restartInterview() {
  currentStep.value = 1
  sessionId.value = null
  messages.value = []
  questionCount.value = 0
  userMessage.value = ''
  reportData.value = null
}

// ============================================================
// TỰ ĐỘNG CUỘN XUỐNG CUỐI MỖI KHI DANH SÁCH TIN NHẮN THAY ĐỔI
// (Lớp bảo hiểm bổ sung bên cạnh việc gọi scrollChatToBottom thủ công
// ở trên, phòng trường hợp có nguồn cập nhật messages khác trong
// tương lai).
// ============================================================
watch(
  () => messages.value.length,
  () => {
    scrollChatToBottom()
  }
)
</script>