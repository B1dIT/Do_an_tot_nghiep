
const pool = require('../config/db')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function listUsers(req, res) {
  try {
    const usersResult = await pool.query(
      `SELECT id, full_name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    )

    const totalAdmins = usersResult.rows.filter((u) => u.role === 'admin').length

    const totalCvAnalyzed = 0

    return res.status(200).json({
      users: usersResult.rows,
      total_users: usersResult.rows.length,
      total_admins: totalAdmins,
      total_cv_analyzed: totalCvAnalyzed,
    })
  } catch (error) {
    console.error('[Admin Controller] Lỗi khi lấy danh sách người dùng:', error)
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' })
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Giá trị role không hợp lệ (chỉ chấp nhận "user" hoặc "admin").' })
    }

    
    
    if (Number(id) === req.user.userId && role !== 'admin') {
      return res.status(400).json({ message: 'Không thể tự hạ quyền admin của chính tài khoản đang đăng nhập.' })
    }

    const updateResult = await pool.query(
      `UPDATE users SET role = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, full_name, email, role`,
      [role, id]
    )

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' })
    }

    return res.status(200).json({
      message: 'Cập nhật quyền thành công.',
      user: updateResult.rows[0],
    })
  } catch (error) {
    console.error('[Admin Controller] Lỗi khi cập nhật role:', error)
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' })
  }
}

async function createUser(req, res) {
  try {
    const { full_name, email, password, role = 'user' } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!full_name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập họ tên, email và mật khẩu.' })
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Định dạng email không hợp lệ.' })
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Mật khẩu phải có tối thiểu 8 ký tự.' })
    }
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ.' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [String(full_name).trim(), normalizedEmail, passwordHash, role]
    )
    return res.status(201).json({ message: 'Tạo người dùng thành công.', user: result.rows[0] })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email này đã được sử dụng.' })
    }
    console.error('[Admin Controller] Lỗi khi tạo người dùng:', error)
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' })
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params
    const { full_name, email, password, role } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!full_name || !normalizedEmail) {
      return res.status(400).json({ message: 'Họ tên và email không được để trống.' })
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Định dạng email không hợp lệ.' })
    }
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ.' })
    }
    if (password && String(password).length < 8) {
      return res.status(400).json({ message: 'Mật khẩu phải có tối thiểu 8 ký tự.' })
    }
    if (Number(id) === req.user.userId && role === 'user') {
      return res.status(400).json({ message: 'Không thể tự hạ quyền admin của chính tài khoản đang đăng nhập.' })
    }

    const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : null
    const result = await pool.query(
      `UPDATE users
       SET full_name = $1,
           email = $2,
           role = COALESCE($3, role),
           password_hash = COALESCE($4, password_hash),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, full_name, email, role, created_at`,
      [String(full_name).trim(), normalizedEmail, role || null, passwordHash, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' })
    }
    return res.status(200).json({ message: 'Cập nhật người dùng thành công.', user: result.rows[0] })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email này đã được sử dụng.' })
    }
    console.error('[Admin Controller] Lỗi khi cập nhật người dùng:', error)
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' })
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params
    if (Number(id) === req.user.userId) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản admin đang đăng nhập.' })
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' })
    }
    return res.status(200).json({ message: 'Xóa người dùng thành công.' })
  } catch (error) {
    console.error('[Admin Controller] Lỗi khi xóa người dùng:', error)
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' })
  }
}

module.exports = { listUsers, updateUserRole, createUser, updateUser, deleteUser }