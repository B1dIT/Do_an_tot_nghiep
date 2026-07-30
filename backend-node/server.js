// backend-node/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const multer = require('multer');
const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const pool = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/Admin.routes'); 
const { verifyToken } = require('./src/middleware/auth.middleware');
const app = express();

// ============================================================
// CORS — configurable via FRONTEND_URL env var
// ============================================================
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        // Allow all localhost origins in development
        if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
}));
app.use(express.json());
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
            return callback(new Error('Chỉ chấp nhận file CV định dạng PDF.'));
        }
        callback(null, true);
    }
});
const PROTO_PATH = path.join(__dirname, '..', 'ai-service', 'protos', 'recommend.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true });
const ai_proto = grpc.loadPackageDefinition(packageDefinition).ai_service;
const grpcClient = new ai_proto.AIService(
    process.env.PYTHON_GRPC_URL || 'localhost:50051',
    grpc.credentials.createInsecure()
);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================
// DEEPSEEK AI CLIENT (OpenAI-compatible SDK)
// ============================================================
function createDeepSeekClient() {
    const rawBaseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1').trim().replace(/\/+$/, '');
    // Chuẩn hoá: nếu URL kết thúc bằng /v1 hoặc /v1/ → cắt bỏ để tránh trùng path
    const cleanBaseUrl = rawBaseUrl.replace(/\/v1\/?$/, '');
    const apiUrl = cleanBaseUrl + '/v1';

    console.log('[DeepSeek] 🔧 Khởi tạo client:');
    console.log(`   Raw DEEPSEEK_BASE_URL : ${rawBaseUrl}`);
    console.log(`   Clean baseURL         : ${apiUrl}`);
    console.log(`   API Key               : ${process.env.DEEPSEEK_API_KEY ? '✅ Đã cấu hình' : '❌ Thiếu key'}`);

    return new OpenAI({
        baseURL: apiUrl,
        apiKey: process.env.DEEPSEEK_API_KEY || '',
    });
}

let deepseekClient;
try {
    deepseekClient = createDeepSeekClient();
} catch (err) {
    console.error('❌ Không thể khởi tạo DeepSeek client:', err.message);
}

// ============================================================
// API: AI CHAT COMPLETIONS (DeepSeek proxy)
// Frontend gọi endpoint này thay vì gọi DeepSeek trực tiếp
// ============================================================
const AI_SYSTEM_PROMPT = `Bạn là một Nhà tuyển dụng Tech Lead senior.
Hãy phỏng vấn ứng viên từng câu một, ngắn gọn, tự nhiên như đang nói chuyện trực tiếp.
Không viết quá dài.
Hãy bắt đầu bằng lời chào và câu hỏi đầu tiên, sau đó tiếp tục phản hồi dựa trên câu trả lời của ứng viên.

Quy tắc:
- Mỗi lượt chỉ hỏi ĐÚNG MỘT câu hỏi.
- Giọng điệu chuyên nghiệp, thân thiện.
- Không liệt kê, không dùng bullet, nói tự nhiên.
- Khi đã hỏi đủ 5-7 câu (hoặc khi ứng viên nói muốn kết thúc), hãy kết thúc buổi phỏng vấn bằng cách trả lời có chứa dòng "[END_INTERVIEW]"`;

const AI_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

app.post('/api/ai/chat', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Thiếu hoặc sai định dạng messages.' });
    }

    if (!deepseekClient) {
        return res.status(500).json({ error: 'DeepSeek client chưa được khởi tạo. Kiểm tra DEEPSEEK_API_KEY và DEEPSEEK_BASE_URL.' });
    }

    const fullMessages = [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        ...messages,
    ];

    console.log(`\n[DeepSeek] 🤖 Gửi request tới ${deepseekClient.baseURL}`);
    console.log(`   Model  : ${AI_MODEL}`);
    console.log(`   Messages: ${messages.length} tin (user: ${messages.filter(m => m.role === 'user').length})`);

    try {
        const completion = await deepseekClient.chat.completions.create({
            model: AI_MODEL,
            messages: fullMessages,
            max_tokens: 512,
            temperature: 0.7,
        });

        const reply = completion.choices?.[0]?.message?.content || '';
        console.log(`   ✅ Response: ${reply.slice(0, 80)}...`);

        res.json({ message: reply });
    } catch (error) {
        console.error('[DeepSeek] ❌ Lỗi API:', error.message);

        // Trả về JSON rõ ràng cho frontend
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            error: 'DeepSeek API lỗi',
            detail: error.message,
            hint: 'Kiểm tra DEEPSEEK_BASE_URL và DEEPSEEK_API_KEY trong backend-node/.env',
        });
    }
});

// --- API PHỎNG VẤN (gRPC) ---

app.post('/api/interview/start', verifyToken, async (req, res) => {
    const { cv_text, job_title, company, jd_text, language, num_questions, difficulty } = req.body;
    
    grpcClient.StartInterview({
        cv_text, job_title, company, jd_text, language, 
        num_questions: parseInt(num_questions) || 5, 
        difficulty: difficulty || 'Junior'
    }, (error, response) => {
        if (error) {
            console.error("❌ gRPC StartInterview error:", error);
            return res.status(500).json({ error: "Lỗi khi bắt đầu phỏng vấn" });
        }
        res.json(response);
    });
});

app.post('/api/interview/chat', verifyToken, async (req, res) => {
    const { session_id, user_message } = req.body;
    
    grpcClient.ChatInterview({ session_id, user_message }, (error, response) => {
        if (error) {
            console.error("❌ gRPC ChatInterview error:", error);
            return res.status(500).json({ error: "Lỗi khi gửi tin nhắn" });
        }
        res.json(response);
    });
});

app.post('/api/interview/end', verifyToken, async (req, res) => {
    const { session_id } = req.body;
    
    grpcClient.EndInterview({ session_id }, (error, response) => {
        if (error) {
            console.error("❌ gRPC EndInterview error:", error);
            return res.status(500).json({ error: "Lỗi khi kết thúc phỏng vấn" });
        }
        res.json(response);
    });
});


app.get('/api/analytics/salary', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT keyword, salary_list, detail_salary, salary_min, salary_max
            FROM jobs_data
            WHERE salary_min IS NOT NULL
               OR salary_max IS NOT NULL
               OR COALESCE(NULLIF(detail_salary, ''), NULLIF(salary_list, '')) IS NOT NULL
        `);

        const grouped = new Map();
        for (const job of result.rows) {
            const salaryText = job.detail_salary || job.salary_list;
            const salary = job.salary_min !== null || job.salary_max !== null
                ? {
                    min: job.salary_min === null ? null : Number(job.salary_min),
                    max: job.salary_max === null ? null : Number(job.salary_max)
                }
                : parseSalary(salaryText);
            if (!salary) continue;

            const keyword = job.keyword || 'Khác';
            const current = grouped.get(keyword) || { keyword, min_val: [], max_val: [] };
            if (salary.min !== null) current.min_val.push(salary.min);
            if (salary.max !== null) current.max_val.push(salary.max);
            grouped.set(keyword, current);
        }

        const salaryData = [...grouped.values()]
            .map((item) => ({
                keyword: item.keyword,
                min_val: item.min_val.length ? Math.round(Math.min(...item.min_val) * 10) / 10 : 0,
                max_val: item.max_val.length ? Math.round(Math.max(...item.max_val) * 10) / 10 : 0
            }))
            .filter((item) => item.min_val > 0 || item.max_val > 0)
            .sort((left, right) => right.max_val - left.max_val)
            .slice(0, 10);

        res.json(salaryData);
    } catch (error) {
        console.error('❌ Không thể lấy dữ liệu lương:', error.message);
        res.status(500).json({ error: 'Không thể tải dữ liệu lương từ database.' });
    }
});

function parseSalary(value) {
    const text = String(value || '').toLowerCase().trim();
    if (!text || /thỏa thuận|thương lượng|cạnh tranh|sign in|đăng nhập/.test(text)) return null;

    const numbers = [...text.matchAll(/\d+(?:[.,]\d+)?/g)]
        .map((match) => Number(match[0].replace(',', '.')))
        .filter((number) => Number.isFinite(number));
    if (!numbers.length) return null;

    const isUsd = /usd|\$/.test(text);
    const isMillion = /triệu|\btr\b/.test(text);
    const values = numbers.map((number) => {
        if (isUsd) return number * 0.0255;
        if (isMillion) return number;
        return number >= 100000 ? number / 1000000 : number;
    });

    return {
        min: values.length > 1 ? values[0] : values[0],
        max: values.length > 1 ? values[1] : values[0]
    };
}

app.post('/api/uploads', verifyToken, upload.single('cv'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng chọn file CV!' });
    }

    let tempJsonPath;
    try {
        console.log('📂 Đã nhận file CV; không ghi tên file để tránh lưu thông tin nhận dạng.');
        const pdfBuffer = await fs.readFile(req.file.path);
        const parsedPdf = await pdfParse(pdfBuffer);
        const anonymizedText = anonymizeCvText(parsedPdf.text);

        if (!anonymizedText) {
            return res.status(422).json({ error: 'Không đọc được nội dung văn bản từ file PDF.' });
        }

        tempJsonPath = path.join(
            __dirname,
            'uploads',
            `temp_cv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.json`
        );
        await fs.writeFile(
            tempJsonPath,
            JSON.stringify({ cv_text: anonymizedText }, null, 2),
            'utf8'
        );

        const tempData = JSON.parse(await fs.readFile(tempJsonPath, 'utf8'));
        console.log("⏳ Đang bắn dữ liệu CV đã ẩn danh qua gRPC sang Python...");
        const response = await analyzeCvWithGrpc(tempData.cv_text);

        const recommendedJobs = (response.recommended_jobs || []).map((job) => ({
            ...job,
            reason: job.match_reason,
            match_score: extractMatchScore(job.match_reason)
        }));
        res.json({ recommended_jobs: recommendedJobs });
    } catch (error) {
        console.error('❌ Không thể đọc hoặc phân tích file CV:', error);
        res.status(error.code === 14 ? 502 : 400).json({
            error: error.message || 'File CV không hợp lệ.'
        });
    } finally {
        await fs.unlink(req.file.path).catch(() => {});
        if (tempJsonPath) {
            await fs.unlink(tempJsonPath).catch(() => {});
        }
    }
});

function analyzeCvWithGrpc(cvText) {
    return new Promise((resolve, reject) => {
        grpcClient.AnalyzeCV({ cv_text: cvText }, (error, response) => {
            if (error) {
                console.error("❌ Lỗi gRPC phía Python:", error);
                reject(error);
                return;
            }
            resolve(response);
        });
    });
}

function anonymizeCvText(value) {
    return String(value || '')
        // Email addresses.
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
        // Facebook and LinkedIn profile URLs.
        .replace(/(?:https?:\/\/|www\.)?(?:m\.)?(?:facebook\.com|fb\.com|linkedin\.com)\/[^\s)]+/gi, '[REDACTED_SOCIAL_LINK]')
        // Vietnamese and international phone number formats.
        .replace(/(?<!\d)(?:\+?84|0)(?:[\s.-]?\d){8,10}(?!\d)/g, '[REDACTED_PHONE]')
        // Date of birth labels and common date formats.
        .replace(/(?:ngày\s*sinh|date\s*of\s*birth|dob)\s*[:\-]?\s*[^\n,;]*/gi, '[REDACTED_DATE_OF_BIRTH]')
        .replace(/(?<!\d)(?:0?[1-9]|[12]\d|3[01])[\/.\-](?:0?[1-9]|1[0-2])[\/.\-](?:19|20)\d{2}(?!\d)/g, '[REDACTED_DATE]')
        // Gender labels and standalone gender values.
        .replace(/(?<![\p{L}])(?:giới\s*tính\s*[:\-]?\s*)?(?:nam|nữ|nu|male|female)(?![\p{L}])/giu, '[REDACTED_GENDER]')
        .trim();
}

function extractMatchScore(reason) {
    const score = String(reason || '').match(/(\d{1,3})\s*%/);
    return score ? Number(score[1]) : null;
}

const SKIP_TAG_PATTERNS = [
    /^\d+\s*năm/i,
    /^tuổi\s*\d+/i,
    /đại học|cao đẳng|trung cấp/i,
    /^nghỉ thứ/i,
    /^tiếng anh/i,
    /kinh nghiệm chuyên môn/i,
    /^chuyên môn/i,
    /^data analyst$/i,
    /^phân tích dữ liệu$/i,
];

function parseExperienceYears(text) {
    const match = String(text || '').match(/(\d+)\s*năm/i);
    return match ? Number(match[1]) : null;
}

function bucketExperience(years) {
    if (years === null) return 'Không rõ';
    if (years <= 1) return '≤ 1 năm (Intern/Junior)';
    if (years === 2) return '2 năm';
    if (years === 3) return '3 năm';
    if (years === 4) return '4 năm';
    return '≥ 5 năm (Senior)';
}

function isNegotiableSalary(text) {
    const normalized = String(text || '').toLowerCase().trim();
    if (!normalized) return true;
    return /thỏa thuận|thương lượng|cạnh tranh|negotiable/.test(normalized);
}

function extractIndustryTags(tags) {
    return String(tags || '')
        .split(';')
        .map((tag) => tag.trim())
        .filter((tag) => tag && !SKIP_TAG_PATTERNS.some((pattern) => pattern.test(tag)))
        .filter((tag) => /[/\-]|it\s|tài chính|logistic|y tế|bán lẻ|sản xuất|thương mại|marketing|fmcg|dược|ngân hàng|game|adtech|fintech|crypto|e-?commerce/i.test(tag));
}

function cleanCompanyName(name) {
    const raw = String(name || '').trim().toLowerCase();
    const bad = ['', 'na', 'n/a', 'null', 'none', 'ẩn danh', 'công ty ẩn danh',
                 'khách hàng', 'không rõ', 'chưa xác định', 'đang cập nhật',
                 'n/a (công ty chưa cập nhật)'];
    return bad.includes(raw) ? 'Doanh nghiệp Hàng đầu' : String(name).trim();
}

function truncateCompanyName(name) {
    const text = cleanCompanyName(name);
    return text.length > 28 ? `${text.slice(0, 25)}...` : text;
}

function incrementMap(map, key, amount = 1) {
    map.set(key, (map.get(key) || 0) + amount);
}

function mapToSortedArray(map, limit = 10) {
    return [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((left, right) => right.value - left.value)
        .slice(0, limit);
}

function aggregateDashboardAnalytics(rows) {
    const keywords = new Map();
    const experience = new Map();
    const salaryTypes = new Map();
    const companies = new Map();
    const industries = new Map();
    const postingTrend = new Map(); // key: YYYY-MM, value: { label: "Thg 1 2026", count: number }
    const regions = { 'Hà Nội': 0, 'Đà Nẵng': 0, 'TP.HCM': 0 };
    const companySet = new Set();
    let experienceTotal = 0;
    let experienceCount = 0;

    for (const row of rows) {
        const keyword = row.keyword || 'Khác';
        incrementMap(keywords, keyword);

        const expYears = parseExperienceYears(row.detail_experience || row.exp_list);
        incrementMap(experience, bucketExperience(expYears));
        if (expYears !== null) {
            experienceTotal += expYears;
            experienceCount += 1;
        }

        const salaryText = row.detail_salary || row.salary_list;
        const salaryLabel = isNegotiableSalary(salaryText) ? 'Thỏa thuận' : 'Có mức lương cụ thể';
        incrementMap(salaryTypes, salaryLabel);

        const company = cleanCompanyName(row.company);
        incrementMap(companies, company);
        companySet.add(company);

        for (const tag of extractIndustryTags(row.tags)) {
            incrementMap(industries, tag);
        }

        const location = `${row.address_list || ''} ${row.detail_location || ''}`.toLowerCase();
        if (location.includes('hà nội') || location.includes('ha noi')) regions['Hà Nội'] += 1;
        if (location.includes('đà nẵng') || location.includes('da nang')) regions['Đà Nẵng'] += 1;
        if (location.includes('hồ chí minh') || location.includes('ho chi minh') || location.includes('tp.hcm')) {
            regions['TP.HCM'] += 1;
        }

        if (row.created_at) {
            const d = new Date(row.created_at);
            const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
            if (!postingTrend.has(sortKey)) {
                postingTrend.set(sortKey, { label, count: 0 });
            }
            postingTrend.get(sortKey).count += 1;
        }
    }

    const experienceOrder = ['≤ 1 năm (Intern/Junior)', '2 năm', '3 năm', '4 năm', '≥ 5 năm (Senior)', 'Không rõ'];
    const sortedExperience = experienceOrder
        .map((label) => ({ label, value: experience.get(label) || 0 }))
        .filter((item) => item.value > 0);

    const negotiableCount = salaryTypes.get('Thỏa thuận') || 0;
    const totalJobs = rows.length;

    return {
        overview: {
            totalJobs,
            uniqueCompanies: companySet.size,
            uniqueKeywords: keywords.size,
            avgExperienceYears: experienceCount ? Math.round((experienceTotal / experienceCount) * 10) / 10 : null,
            negotiablePercent: totalJobs ? Math.round((negotiableCount / totalJobs) * 100) : 0,
        },
        keywords: mapToSortedArray(keywords, 8),
        experience: sortedExperience.length ? sortedExperience : mapToSortedArray(experience, 6),
        salaryTypes: mapToSortedArray(salaryTypes, 4),
        topCompanies: mapToSortedArray(companies, 8).map((item) => ({
            ...item,
            label: truncateCompanyName(item.label),
            fullName: item.label,
        })),
        industries: mapToSortedArray(industries, 8),
        postingTrend: [...postingTrend.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, { label, count }]) => ({ label, value: count })),
        regions: Object.entries(regions).map(([label, value]) => ({ label, value })),
    };
}

app.get('/api/analytics/dashboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT keyword, company, exp_list, detail_experience,
                   salary_list, detail_salary, tags,
                   address_list, detail_location, created_at
            FROM jobs_data
        `);
        res.json(aggregateDashboardAnalytics(result.rows));
    } catch (error) {
        console.error('❌ Không thể lấy dữ liệu dashboard:', error.message);
        res.status(500).json({ error: 'Không thể tải dữ liệu dashboard từ database.' });
    }
});

app.get('/api/analytics/regions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COALESCE(address_list, '') || ' ' || COALESCE(detail_location, '') AS location
            FROM jobs_data
        `);
        const regions = { 'Hà Nội': 0, 'Đà Nẵng': 0, 'TP.HCM': 0 };

        for (const row of result.rows) {
            const location = String(row.location || '').toLowerCase();
            if (location.includes('hà nội') || location.includes('ha noi')) regions['Hà Nội'] += 1;
            if (location.includes('đà nẵng') || location.includes('da nang')) regions['Đà Nẵng'] += 1;
            if (location.includes('hồ chí minh') || location.includes('ho chi minh') || location.includes('tp.hcm')) {
                regions['TP.HCM'] += 1;
            }
        }

        res.json(Object.entries(regions).map(([label, value]) => ({ label, value })));
    } catch (error) {
        console.error('❌ Không thể lấy dữ liệu khu vực:', error.message);
        res.status(500).json({ error: 'Không thể tải dữ liệu khu vực từ database.' });
    }
});

// ============================================================
// API: TÌM KIẾM JOB THEO KEYWORD
// Dùng cho thanh task bar trên Dashboard
// ============================================================
app.get('/api/jobs/search', async (req, res) => {
    try {
        const keyword = (req.query.keyword || '').trim();
        if (!keyword) {
            return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm (keyword).' });
        }

        const result = await pool.query(`
            SELECT id, job_key, title, company, job_url, salary_list,
                   address_list, exp_list, tags, desc_mota, keyword,
                   created_at
            FROM jobs_data
            WHERE (status IS NULL OR status = 'ACTIVE')
              AND (LOWER(keyword) LIKE LOWER($1)
                OR LOWER(title) LIKE LOWER($2)
                OR LOWER(tags) LIKE LOWER($3))
            ORDER BY created_at DESC
            LIMIT 20
        `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);

        const jobs = result.rows.map((job) => ({
            id: job.id,
            title: job.title,
            company: cleanCompanyName(job.company),
            job_url: job.job_url,
            salary: job.salary_list,
            location: job.address_list,
            experience: job.exp_list,
            tags: job.tags,
            description: job.desc_mota,
            keyword: job.keyword,
            created_at: job.created_at,
        }));

        console.log(`🔍 Tìm kiếm job: keyword="${keyword}" → ${jobs.length} kết quả`);
        res.json({ jobs, total: jobs.length, keyword });
    } catch (error) {
        console.error('❌ Lỗi tìm kiếm job:', error.message);
        res.status(500).json({ error: 'Không thể tìm kiếm job.' });
    }
});

// ============================================================
// AUTO MIGRATION: Tạo bảng CRUD nếu chưa có
// ============================================================
async function runCrudMigration() {
    try {
        const sql = await fs.readFile(path.join(__dirname, 'database', 'migration_crud.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ [CRUD] Migration chạy thành công');
    } catch (err) {
        console.error('❌ [CRUD] Lỗi migration:', err.message);
    }
}
runCrudMigration();

// ============================================================
// CRUD: USER PROFILE
// ============================================================

// GET /api/profile — Xem hồ sơ
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT up.*, u.email AS user_email, u.full_name AS user_name
             FROM user_profiles up RIGHT JOIN users u ON u.id = up.user_id
             WHERE u.id = $1`, [req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.json({ profile: null });
        }
        res.json({ profile: result.rows[0] });
    } catch (err) {
        console.error('❌ Lỗi lấy profile:', err.message);
        res.status(500).json({ error: 'Không thể lấy hồ sơ.' });
    }
});

// PUT /api/profile — Cập nhật hồ sơ
app.put('/api/profile', verifyToken, async (req, res) => {
    try {
        const { phone, skills, experience } = req.body;
        const result = await pool.query(`
            INSERT INTO user_profiles (user_id, full_name, email, phone, skills, experience, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                phone = COALESCE($4, user_profiles.phone),
                skills = COALESCE($5, user_profiles.skills),
                experience = COALESCE($6, user_profiles.experience),
                updated_at = NOW()
            RETURNING *
        `, [req.user.userId, req.user.fullName || '', req.user.email || '', phone, skills, experience]);
        res.json({ profile: result.rows[0], message: 'Cập nhật hồ sơ thành công.' });
    } catch (err) {
        console.error('❌ Lỗi cập nhật profile:', err.message);
        res.status(500).json({ error: 'Không thể cập nhật hồ sơ.' });
    }
});

// POST /api/profile/cv — Upload CV mới
app.post('/api/profile/cv', verifyToken, upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Chưa chọn file CV.' });
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        await pool.query(`
            INSERT INTO user_profiles (user_id, cv_file_name, cv_file_path, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                cv_file_name = $2, cv_file_path = $3, updated_at = NOW()
        `, [req.user.userId, fileName, filePath]);

        res.json({ message: 'Tải CV thành công.', file_name: fileName });
    } catch (err) {
        console.error('❌ Lỗi upload CV:', err.message);
        res.status(500).json({ error: 'Không thể tải CV.' });
    }
});

// ============================================================
// CRUD: INTERVIEW HISTORY
// ============================================================

// GET /api/interviews — Danh sách phỏng vấn đã hoàn thành
app.get('/api/interviews', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, job_title, company, overall_score, summary,
                    strengths, improvements, created_at
             FROM interview_history
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`, [req.user.userId]
        );
        res.json({ interviews: result.rows });
    } catch (err) {
        console.error('❌ Lỗi lấy lịch sử phỏng vấn:', err.message);
        res.status(500).json({ error: 'Không thể lấy lịch sử phỏng vấn.' });
    }
});

// DELETE /api/interviews/:id — Xoá bản ghi phỏng vấn
app.delete('/api/interviews/:id', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM interview_history WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bản ghi phỏng vấn.' });
        }
        res.json({ message: 'Đã xoá bản ghi phỏng vấn.' });
    } catch (err) {
        console.error('❌ Lỗi xoá phỏng vấn:', err.message);
        res.status(500).json({ error: 'Không thể xoá bản ghi.' });
    }
});

// POST /api/interviews — Lưu kết quả phỏng vấn (từ AIInterviewRoom)
app.post('/api/interviews', verifyToken, async (req, res) => {
    try {
        const { job_title, company, overall_score, summary, strengths, improvements, conversation, gemini_analysis } = req.body;
        const result = await pool.query(`
            INSERT INTO interview_history (user_id, job_title, company, overall_score, summary, strengths, improvements, conversation, gemini_analysis)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
        `, [req.user.userId, job_title, company, overall_score, summary, strengths, improvements,
            conversation ? JSON.stringify(conversation) : null,
            gemini_analysis ? JSON.stringify(gemini_analysis) : null]);
        res.json({ id: result.rows[0].id, message: 'Đã lưu kết quả phỏng vấn.' });
    } catch (err) {
        console.error('❌ Lỗi lưu phỏng vấn:', err.message);
        res.status(500).json({ error: 'Không thể lưu kết quả phỏng vấn.' });
    }
});

// ============================================================
// CRUD: SAVED JOBS
// ============================================================

// GET /api/saved-jobs — Danh sách job đã lưu
app.get('/api/saved-jobs', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, job_title, company, job_url, salary, location, created_at
             FROM saved_jobs WHERE user_id = $1
             ORDER BY created_at DESC`, [req.user.userId]
        );
        res.json({ savedJobs: result.rows });
    } catch (err) {
        console.error('❌ Lỗi lấy job đã lưu:', err.message);
        res.status(500).json({ error: 'Không thể lấy danh sách job đã lưu.' });
    }
});

// POST /api/saved-jobs — Lưu một job
app.post('/api/saved-jobs', verifyToken, async (req, res) => {
    try {
        const { job_title, company, job_url, salary, location, description } = req.body;
        if (!job_title || !job_url) {
            return res.status(400).json({ error: 'Thiếu thông tin job (title, url).' });
        }
        const result = await pool.query(`
            INSERT INTO saved_jobs (user_id, job_title, company, job_url, salary, location, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (user_id, job_url) DO NOTHING
            RETURNING id
        `, [req.user.userId, job_title, company, job_url, salary, location, description]);
        if (result.rows.length === 0) {
            return res.json({ message: 'Job đã được lưu trước đó.' });
        }
        res.json({ id: result.rows[0].id, message: 'Đã lưu job.' });
    } catch (err) {
        console.error('❌ Lỗi lưu job:', err.message);
        res.status(500).json({ error: 'Không thể lưu job.' });
    }
});

// DELETE /api/saved-jobs/by-url — Bỏ lưu job theo job_url
app.delete('/api/saved-jobs/by-url', verifyToken, async (req, res) => {
    try {
        const { job_url } = req.body;
        if (!job_url) return res.status(400).json({ error: 'Thiếu job_url.' });
        const result = await pool.query(
            'DELETE FROM saved_jobs WHERE job_url = $1 AND user_id = $2 RETURNING id',
            [job_url, req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy job đã lưu.' });
        }
        res.json({ message: 'Đã bỏ lưu job.' });
    } catch (err) {
        console.error('❌ Lỗi bỏ lưu job:', err.message);
        res.status(500).json({ error: 'Không thể bỏ lưu job.' });
    }
});

// DELETE /api/saved-jobs/:id — Bỏ lưu job theo id
app.delete('/api/saved-jobs/:id', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM saved_jobs WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy job đã lưu.' });
        }
        res.json({ message: 'Đã bỏ lưu job.' });
    } catch (err) {
        console.error('❌ Lỗi bỏ lưu job:', err.message);
        res.status(500).json({ error: 'Không thể bỏ lưu job.' });
    }
});

app.use('/api', (req, res) => {
    res.status(404).json({ error: `Không tìm thấy API: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node.js Gateway running at http://0.0.0.0:${PORT}`);
});