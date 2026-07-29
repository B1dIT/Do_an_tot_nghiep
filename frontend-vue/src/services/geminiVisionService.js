/**
 * geminiVisionService.js
 * =======================
 * Dịch vụ phân tích tác phong ứng viên qua ảnh chụp từ Webcam
 * sử dụng Gemini Flash API (gemini-2.5-flash).
 *
 * Cách dùng:
 *   const result = await analyzeFrame(base64Image, apiKey)
 *   // { eye_contact, emotion, posture, score }
 */

const GEMINI_MODEL = 'gemini-3.6-flash'

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

/**
 * Gửi ảnh Base64 đến Gemini Flash API để phân tích tác phong.
 * @param {string} base64Image - Ảnh dạng Base64 (không có header data:image/...)
 * @param {string} apiKey - Google AI API key
 * @returns {Promise<{eye_contact: string, emotion: string, posture: string, score: number}>}
 */
export async function analyzeFrame(base64Image, apiKey) {
  if (!apiKey) {
    console.warn('[GeminiVision] Thiếu API key, bỏ qua phân tích.')
    return null
  }

  if (!base64Image) {
    console.warn('[GeminiVision] Ảnh Base64 rỗng, bỏ qua.')
    return null
  }

  console.log(`[GeminiVision] 📸 Image Base64 length: ${base64Image.length} bytes`)

  const prompt = `Phân tích tác phong của ứng viên trong ảnh chụp phỏng vấn này.
Đánh giá chi tiết các tiêu chí sau, mỗi tiêu chí cho điểm từ 1 - 100:
- eye_contact: Ánh mắt có nhìn thẳng vào camera/màn hình không?
- smile_score: Biểu cảm khuôn mặt (tự nhiên / căng thẳng / thờ ơ)?
- posture_score: Tư thế ngồi và trang phục (chỉn chu / lịch sự chưa)?
- confidence_score: Mức độ tự tin toàn diện qua ánh mắt + biểu cảm + tư thế.

Trả về KẾT QUẢ DUY NHẤT dưới dạng JSON, không thêm bất kỳ text hay markdown nào khác:
{ "eye_contact": string, "smile_score": number, "posture_score": number, "confidence_score": number }
Chỉ trả về JSON object thuần tuý.`

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 256,
      response_mime_type: 'application/json',
    },
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      throw new Error(`Gemini API error ${response.status}: ${errBody}`)
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return parseGeminiResponse(rawText)
  } catch (error) {
    console.error('[GeminiVision] API error:', error)
    return null
  }
}

/**
 * Chụp 1 frame từ thẻ <video> và chuyển thành Base64 (JPEG).
 * @param {HTMLVideoElement} videoEl - Thẻ video đang phát webcam
 * @param {number} quality - Chất lượng JPEG (0-1), mặc định 0.6
 * @returns {string|null} Chuỗi Base64 (không header)
 */
export function captureWebcamFrame(videoEl, quality = 0.6) {
  if (!videoEl || !videoEl.videoWidth) {
    return null
  }

  try {
    const canvas = document.createElement('canvas')
    canvas.width = videoEl.videoWidth
    canvas.height = videoEl.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)

    const base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1]
    return base64
  } catch (error) {
    return null
  }
}

/**
 * Parse JSON từ response text của Gemini
 * Hỗ trợ map từ schema cũ (score, emotion) sang schema mới (smile_score, confidence_score)
 */
function parseGeminiResponse(text) {
  if (!text) {
    return null
  }

  let jsonStr = text.trim()
  const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
  }

  jsonStr = jsonStr
    .replace(/'/g, '"')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*\]/g, ']')

  try {
    const result = JSON.parse(jsonStr)

    const eyeContact = result.eye_contact || 'Unknown'

    const cs = typeof result.confidence_score === 'number' ? result.confidence_score : null
    const ss = typeof result.smile_score === 'number' ? result.smile_score : null
    const ps = typeof result.posture_score === 'number' ? result.posture_score : null
    const oldScore = typeof result.score === 'number' ? result.score : null

    let finalScore
    if (cs !== null) {
      finalScore = Math.round(cs / 10)
    } else {
      const vals = [ss, ps, oldScore].filter((v) => v !== null)
      finalScore = vals.length
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length / 10)
        : 0
    }

    let emotion = result.emotion || 'Unknown'
    if (ss !== null && !result.emotion) {
      if (ss >= 70) emotion = 'Confident, relaxed'
      else if (ss >= 40) emotion = 'Neutral'
      else emotion = 'Nervous / Distant'
    }

    return {
      eye_contact: eyeContact,
      emotion: emotion,
      posture: result.posture || `Posture: ${ps !== null ? ps + '/100' : 'Unknown'}`,
      score: finalScore,
    }
  } catch (e) {
    return null
  }
}

export default { analyzeFrame, captureWebcamFrame }
