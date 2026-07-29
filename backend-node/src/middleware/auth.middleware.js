
const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decodedPayload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-key-thay-doi-trong-production'
    )
    req.user = decodedPayload // { userId, email, role }
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' })
  }
}


function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập tài nguyên này.' })
  }
  next()
}

module.exports = { verifyToken, requireAdmin }