# 🚀 AI-Powered Voice Interview & Job Recommendation System

> **Hệ thống Phỏng vấn Giọng nói AI Real-time và Gợi ý Việc làm Thông minh**  
> Đồ án Tốt nghiệp ngành Công nghệ Thông tin.

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Vue.js](https://img.shields.io/badge/Frontend-Vue%203%20%7C%20Vite-4fc08d?logo=vuedotjs)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=nodedotjs)
![Python](https://img.shields.io/badge/AI%20Service-Python%20%7C%20gRPC-3776ab?logo=python)
![Gemini](https://img.shields.io/badge/Vision%20AI-Google%20Gemini-8e44ad?logo=google)

---

## 📌 1. Giới thiệu Tổng quan (System Overview)

Hệ thống hỗ trợ ứng viên rèn luyện kỹ năng phỏng vấn thông qua trí tuệ nhân tạo (AI) và tìm kiếm công việc phù hợp với năng lực cá nhân. Hệ thống kết hợp nhiều công nghệ hiện đại bao gồm:
- **Phỏng vấn Giọng nói Real-time (Voice AI):** Tương tác 2 chiều qua Micro và Loa bằng giọng nói tự nhiên nhờ sự kết hợp giữa Web Speech API, DeepSeek AI và giao thức gRPC tốc độ cao.
- **Phân tích Tác phong qua Webcam:** Sử dụng **Gemini Vision API** tự động phân tích biểu cảm, tư thế ngồi và ánh mắt của ứng viên theo thời gian thực trong suốt buổi phỏng vấn.
- **Phân tích CV & Gợi ý Việc làm:** Tự động trích xuất kỹ năng từ file CV (PDF) của ứng viên và đề xuất các bài tuyển dụng phù hợp nhất.
- **Tự động Cào Dữ liệu (Automated Crawler):** Hệ thống thu thập tin tuyển dụng tự động từ các nền tảng tuyển dụng hàng đầu (TopCV, ITViec, Glints...) và tự động làm sạch dữ liệu.

---

## 🏗️ 2. Kiến trúc Hệ thống (System Architecture)

Hệ thống được thiết kế theo mô hình **Microservices** giúp tối ưu hiệu năng và khả năng mở rộng:

```text
                               ┌────────────────────────────────┐
                               │     Vue 3 + Vite Frontend      │
                               │  (Web Speech API, Canvas UI)   │
                               └───────────────┬────────────────┘
                                               │
                                       HTTP / WebSocket
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │     Node.js Express Backend    │
                               │  (REST API, Auth, DB Gateway)  │
                               └──────┬──────────────────┬──────┘
                                      │                  │
                         gRPC Stream  │                  │  REST / Base64
                          (HTTP/2)    │                  │
                                      ▼                  ▼
┌────────────────────────────────────────┐            ┌────────────────────────────────┐
│      Python AI gRPC Microservice       │            │       Google Gemini Vision     │
│   (DeepSeek LLM Conversation Engine)   │            │   (Real-time Posture Analysis) │
└────────────────────────────────────────┘            └────────────────────────────────┘
🛠️ 3. Công nghệ Sử dụng (Tech Stack)
Frontend
Framework: Vue.js 3 (Vite), Pinia, Vue Router

UI & Charts: TailwindCSS, Chart.js / Recharts

Media API: HTML5 Web Speech API (STT/TTS), HTML5 Canvas Webcam Streaming

Core Backend
Runtime: Node.js / Express

Database: PostgreSQL / MongoDB (Sequelize / Mongoose ORM)

Protocol: RESTful API, WebSockets, gRPC Client

AI & Data Service
Language: Python 3.10+

Microservice Communication: gRPC / Protocol Buffers (.proto)

LLM Engine: DeepSeek API

Vision AI: Google Gemini 1.5 Flash Vision API

Crawler: Python BeautifulSoup4, Scrapy, Cronjob Automation

📂 4. Cấu trúc Thư mục Dự án (Project Structure)
```text
crawl-topcv-jobs-master/
│
├── frontend-vue/              # 🟢 Frontend (Vue 3 + Vite) — Deploy Vercel
│   ├── src/
│   │   ├── components/        # Reusable UI Components
│   │   ├── views/             # Main Page Views
│   │   ├── services/          # VoiceInterview, GeminiVision services
│   │   ├── utils/             # API config, helpers
│   │   ├── router/            # Vue Router
│   │   ├── layouts/           # App layout
│   │   └── composables/       # Shared composables
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── backend-node/              # 🔵 Backend API Gateway (Node.js + Express) — Deploy Render
│   ├── src/
│   │   ├── config/            # DB config
│   │   ├── controllers/       # Auth & Admin controllers
│   │   ├── middleware/         # JWT Auth middleware
│   │   └── routes/            # REST API routes
│   ├── .env.example
│   ├── server.js              # Entry point
│   └── package.json
│
├── ai-service/                # 🟣 Python AI & Crawler Service — Deploy Render
│   ├── protos/                # Protocol Buffer files (.proto)
│   ├── scripts/               # Crawlers & data processing
│   │   ├── scrape_topcv.py
│   │   ├── scrape_itviec.py
│   │   ├── scrape_glints.py
│   │   ├── database.py
│   │   ├── data_cleaner.py
│   │   ├── cron_expire_jobs.py
│   │   └── main_runner.py
│   ├── python_grpc_server.py  # gRPC server entry point
│   ├── recommend_pb2.py       # Generated from proto
│   ├── recommend_pb2_grpc.py  # Generated from proto
│   ├── schema.sql
│   ├── pyproject.toml
│   └── uv.lock
│
├── docs/                      # 📄 Documentation & images
│   ├── imgs/
│   └── jobs_sample.json
│
├── credentials/               # Service account credentials
├── .gitignore
└── README.md
```
⚙️ 5. Hướng dẫn Cài đặt & Khởi chạy (Getting Started)
Yêu cầu Hệ thống (Prerequisites)
Node.js version 18.x trở lên

Python version 3.10 trở lên

Database (PostgreSQL) đang khởi chạy

### Bước 1: Khởi chạy Python AI gRPC Service
```bash
cd ai-service

# Tạo môi trường ảo (Virtual environment)
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate

# Cài đặt các thư viện phụ thuộc
pip install -e .

# Khởi chạy gRPC Server
python python_grpc_server.py
```
AI Service sẽ chạy tại address: `localhost:50051`

### Bước 2: Khởi chạy Node.js Backend
```bash
cd backend-node

# Cài đặt dependencies
npm install

# Tạo file cấu hình môi trường
cp .env.example .env
# Chỉnh sửa các thông số trong file .env

# Khởi chạy Server Backend
npm start
```
Server Backend sẽ chạy tại address: `http://localhost:3000`

### Bước 3: Khởi chạy Vue 3 Frontend
```bash
cd frontend-vue

# Cài đặt dependencies
npm install

# Khởi chạy Frontend Development
npm run dev
```
Truy cập giao diện ứng dụng tại: `http://localhost:5173`

🕰️ 6. Cấu hình Tác vụ Cào Data Tự động (Crawler Cronjob)
Để hệ thống tự động cào tin tuyển dụng mới và làm sạch dữ liệu định kỳ mỗi ngày vào 02:00 AM, cấu hình Cronjob trên Server/Máy tính như sau:

Bash
# Mở trình chỉnh sửa crontab
crontab -e

📝 7. Giấy phép & Tác giả (License & Author)
Tác giả: Đồ án Tốt nghiệp Đại học

Giấy phép: MIT License