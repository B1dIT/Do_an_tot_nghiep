
require('dotenv').config()
const bcrypt = require('bcrypt')
const pool = require('../src/config/db')

const SALT_ROUNDS = 10

async function createOrPromoteAdmin() {
  const [email, password, fullName] = process.argv.slice(2)

  if (!email || !password) {
    console.error('Thiếu tham số. Cách dùng: node scripts/create-admin.js <email> <mat_khau> [ho_ten]')
    process.exit(1)
  }

  try {
    const existingResult = await pool.query('SELECT id, role FROM users WHERE email = $1', [
      email.toLowerCase().trim(),
    ])

    if (existingResult.rows.length > 0) {
      
      await pool.query('UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2', [
        'admin',
        email.toLowerCase().trim(),
      ])
      console.log(`Đã nâng quyền admin cho tài khoản có sẵn: ${email}`)
    } else {
      
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, 'admin')`,
        [fullName || 'Quản trị viên', email.toLowerCase().trim(), passwordHash]
      )
      console.log(`Đã tạo tài khoản admin mới: ${email}`)
    }

    process.exit(0)
  } catch (error) {
    console.error('Lỗi khi tạo/nâng quyền admin:', error.message)
    process.exit(1)
  }
}

createOrPromoteAdmin()