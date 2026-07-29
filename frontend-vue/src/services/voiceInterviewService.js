/**
 * voiceInterviewService.js
 * =========================
 * Dịch vụ xử lý luồng Voice Interview:
 *   1. Speech-to-Text (webkitSpeechRecognition)
 *   2. Gọi DeepSeek Chat API (deepseek-chat)
 *   3. Text-to-Speech (window.speechSynthesis)
 *
 * Cách dùng:
 *   const service = new VoiceInterviewService({
 *     apiKey: 'sk-...',
 *     onTranscript: (text) => { ... },
 *     onAiResponse: (text) => { ... },
 *     onSpeakingStart: () => { ... },
 *     onSpeakingEnd: () => { ... },
 *     onError: (err) => { ... },
 *   })
 *   service.start(jobTitle, company)
 *   service.stop()
 *   service.toggleListening()
 */

// ============================================================
// CẤU HÌNH
// ============================================================
// Backend Node.js gateway — mọi request AI đều qua đây
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// System Prompt cố định cho Nhà tuyển dụng AI
const SYSTEM_PROMPT = `Bạn là một Nhà tuyển dụng Tech Lead senior.
Hãy phỏng vấn ứng viên từng câu một, ngắn gọn, tự nhiên như đang nói chuyện trực tiếp.
Không viết quá dài.
Hãy bắt đầu bằng lời chào và câu hỏi đầu tiên, sau đó tiếp tục phản hồi dựa trên câu trả lời của ứng viên.

Quy tắc:
- Mỗi lượt chỉ hỏi ĐÚNG MỘT câu hỏi.
- Giọng điệu chuyên nghiệp, thân thiện.
- Không liệt kê, không dùng bullet, nói tự nhiên.
- Khi đã hỏi đủ 5-7 câu (hoặc khi ứng viên nói muốn kết thúc), hãy kết thúc buổi phỏng vấn bằng cách trả lời có chứa dòng "[END_INTERVIEW]"`


// ============================================================
// CLASS VOICE INTERVIEW SERVICE
// ============================================================
export class VoiceInterviewService {
  constructor(options = {}) {
    // Backend API URL — API keys đã được cấu hình ở backend
    this.backendUrl = options.backendUrl || BACKEND_API_URL
    this.model = options.model || 'DeepSeek-V4 Flash'

    // Callbacks
    this.onTranscript = options.onTranscript || (() => {})
    this.onInterimTranscript = options.onInterimTranscript || (() => {})
    this.onAiResponse = options.onAiResponse || (() => {})
    this.onSpeakingStart = options.onSpeakingStart || (() => {})
    this.onSpeakingEnd = options.onSpeakingEnd || (() => {})
    this.onError = options.onError || (() => {})

    // Internal state
    this.isRunning = false
    this.isListening = false
    this.isSpeaking = false
    this.recognition = null
    this.synth = window.speechSynthesis
    this.conversationHistory = []
    this.currentUtterance = null
    this.autoRestartTimeoutId = null

    // Khởi tạo SpeechRecognition
    this._initRecognition()
  }

// Speech Recognition
  _initRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      this.onError(
        new Error('Trình duyệt của bạn không hỗ trợ Web Speech API. Vui lòng dùng Chrome.')
      )
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.recognition.lang = 'vi-VN'
    this.recognition.maxAlternatives = 1

    this.recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      if (final) {
        this.onTranscript(final.trim())
        // Dừng recognition hiện tại rồi gửi đến DeepSeek
        this._pauseRecognition()
        this._sendToDeepSeek(final.trim())
      } else if (interim) {
        this.onInterimTranscript(interim.trim())
      }
    }

    this.recognition.onerror = (event) => {
      console.error('[VoiceService] Recognition error:', event.error)
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Bỏ qua lỗi này, tự động restart nếu đang chạy
        if (this.isRunning && !this.isSpeaking) {
          this._startRecognition()
        }
        return
      }
      this.onError(new Error(`Lỗi nhận dạng giọng nói: ${event.error}`))
    }

    this.recognition.onend = () => {
      // Tự động restart nếu đang chạy và không nói
      if (this.isRunning && !this.isSpeaking && !this._pendingApiCall) {
        this._startRecognition()
      }
    }
  }

  // Speech Recognition Control
  _startRecognition() {
    if (!this.recognition || this.isListening || !this.isRunning) return
    try {
      this.isListening = true
      this.recognition.start()
    } catch (e) {
      // Đôi khi recognition.start() throw nếu đã chạy
      this.isListening = false
    }
  }

  _pauseRecognition() {
    if (!this.recognition || !this.isListening) return
    try {
      this.isListening = false
      this.recognition.stop()
    } catch (e) {
      // Ignore
    }
  }

  _stopRecognition() {
    this._pauseRecognition()
    this.isListening = false
  }

  // DeepSeek API
  async _sendToDeepSeek(userMessage) {
    this._pendingApiCall = true

    // Thêm tin nhắn người dùng vào lịch sử
    this.conversationHistory.push({ role: 'user', content: userMessage })

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.conversationHistory,
    ]

    try {
      // Gọi backend gateway thay vì gọi DeepSeek trực tiếp
      const response = await fetch(`${this.backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.conversationHistory }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(
          `Backend API lỗi ${response.status}: ${errBody.detail || errBody.error || response.statusText}`
        )
      }

      const data = await response.json()
      const aiMessage = data.message || ''

      // Thêm phản hồi AI vào lịch sử
      this.conversationHistory.push({ role: 'assistant', content: aiMessage })

      // Gọi callback
      this.onAiResponse(aiMessage)

      // Đọc to phản hồi
      this._speak(aiMessage)
    } catch (error) {
      console.error('[VoiceService] Backend AI error:', error)
      this.onError(error)
      // Restart listening nếu có lỗi
      if (this.isRunning) {
        setTimeout(() => this._startRecognition(), 500)
      }
    } finally {
      this._pendingApiCall = false
    }
  }

  // Text-to-Speech
  _speak(text) {
    if (!this.synth || !this.isRunning) return

    // Dừng mọi giọng nói trước đó
    this.synth.cancel()

    // Xoá dấu hiệu kết thúc khỏi văn bản đọc
    const cleanText = text.replace(/\[END_INTERVIEW\]/g, '').trim()
    if (!cleanText) {
      this._onSpeakingEnd()
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)
    this.currentUtterance = utterance

    // Chọn giọng nói tiếng Việt nếu có
    const voices = this.synth.getVoices()
    const viVoice =
      voices.find(
        (v) => v.lang.startsWith('vi') && v.name.toLowerCase().includes('female')
      ) ||
      voices.find((v) => v.lang.startsWith('vi')) ||
      voices.find((v) => v.lang.startsWith('en-US'))

    if (viVoice) utterance.voice = viVoice
    utterance.lang = viVoice?.lang || 'vi-VN'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      this.isSpeaking = true
      this.onSpeakingStart()
    }

    utterance.onend = () => {
      this._onSpeakingEnd()
    }

    utterance.onerror = (event) => {
      console.error('[VoiceService] SpeechSynthesis error:', event)
      this._onSpeakingEnd()
    }

    this.synth.speak(utterance)
  }

  _onSpeakingEnd() {
    this.isSpeaking = false
    this.currentUtterance = null
    this.onSpeakingEnd()

    // Kiểm tra nếu có dấu hiệu kết thúc trong lịch sử
    const lastMessage = this.conversationHistory[this.conversationHistory.length - 1]
    if (lastMessage?.content?.includes('[END_INTERVIEW]')) {
      this.isRunning = false
      return
    }

    // Tự động bắt đầu nghe lại sau khi AI nói xong
    if (this.isRunning) {
      clearTimeout(this.autoRestartTimeoutId)
      this.autoRestartTimeoutId = setTimeout(() => {
        this._startRecognition()
      }, 400)
    }
  }

  // ==========================================================
  // PUBLIC API
  // ==========================================================

  /**
   * Bắt đầu phiên phỏng vấn giọng nói.
   */
  start(jobTitle = '', company = '') {
    if (this.isRunning) return

    this.isRunning = true
    this.conversationHistory = []

    console.log('[VoiceService] Starting voice interview session (via backend)')

    const initMessage = `Xin chào, tôi đang ứng tuyển vị trí ${jobTitle}${company ? ` tại ${company}` : ''}. Hãy bắt đầu phỏng vấn tôi.`
    this.conversationHistory.push({ role: 'user', content: initMessage })

    this._sendToDeepSeek(initMessage)
  }

  /**
   * Kết thúc phiên phỏng vấn giọng nói.
   */
  stop() {
    console.log('[VoiceService] Stopping voice interview session')
    this.isRunning = false
    this._stopRecognition()
    if (this.synth) this.synth.cancel()
    clearTimeout(this.autoRestartTimeoutId)
    this.currentUtterance = null
    this.isSpeaking = false
    this._pendingApiCall = false
  }

  /**
   * Bật / Tắt lắng nghe tạm thời.
   * Trả về trạng thái mới.
   */
  toggleListening() {
    if (this.isSpeaking) return this.isListening // Không cho tắt khi AI đang nói

    if (this.isListening) {
      this._pauseRecognition()
    } else if (this.isRunning) {
      this._startRecognition()
    }
    return this.isListening
  }

  /**
   * Kiểm tra trạng thái
   */
  getState() {
    return {
      isRunning: this.isRunning,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      messageCount: this.conversationHistory.length,
    }
  }
}

export default VoiceInterviewService
