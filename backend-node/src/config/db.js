const { Pool } = require('pg')
require('dotenv').config()


const connectionString = process.env.DATABASE_URL

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, 
      },
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'topcv_jobs',
    })

pool
  .connect()
  .then((client) => {
    console.log('[PostgreSQL] Kết nối thành công đến database!')
    client.release()
  })
  .catch((error) => {
    console.error('[PostgreSQL] Lỗi kết nối database:', error.message)
  })

module.exports = pool