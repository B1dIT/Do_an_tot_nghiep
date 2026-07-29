
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const SALT_ROUNDS = 10 

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function register(req, res) {
  try {
    const { full_name, email, password } = req.body

    
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Định dạng email không hợp lệ.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu phải có tối thiểu 8 ký tự.' })
    }

    
    const existingUserResult = await pool.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase().trim(),
    ])

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ message: 'Email này đã được đăng ký. Vui lòng đăng nhập.' })
    }

    
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    
    
    
    
    
    
    const insertResult = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, full_name, email, role, created_at`,
      [full_name.trim(), email.toLowerCase().trim(), passwordHash]
    )

    const newUser = insertResult.rows[0]

    
    return res.status(201).json({
      message: 'Tạo tài khoản thành công.',
      user: newUser,
    })
  } catch (error) {
    console.error('[Auth Controller] Lỗi khi đăng ký:', error)
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' })
    }

    
    const userResult = await pool.query(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (userResult.rows.length === 0) {
      
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' })
    }

    const user = userResult.rows[0]

    
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' })
    }

    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret-key-thay-doi-trong-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return res.status(200).json({
      message: 'Đăng nhập thành công.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('[Auth Controller] Lỗi khi đăng nhập:', error)
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' })
  }
}

module.exports = { register, login }