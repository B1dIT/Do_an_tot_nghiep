/**
 * companyUtils.js
 * ===============
 * Tiện ích xử lý hiển thị tên công ty.
 */

const FALLBACK_NAME = 'Doanh nghiệp Hàng đầu'

const BAD_VALUES = new Set([
  '', 'na', 'n/a', 'null', 'none',
  'ẩn danh', 'công ty ẩn danh', 'khách hàng',
  'không rõ', 'chưa xác định', 'đang cập nhật',
])

/**
 * Trả về tên công ty đã được chuẩn hoá để hiển thị.
 * Nếu tên bị lỗi/thiếu → trả về tên mặc định.
 */
export function displayCompany(name) {
  if (!name) return FALLBACK_NAME
  const normalized = name.trim().toLowerCase()
  return BAD_VALUES.has(normalized) ? FALLBACK_NAME : name
}
