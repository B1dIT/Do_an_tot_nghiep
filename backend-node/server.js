// backend-node/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const PROTO_PATH = path.join(__dirname, '..', 'protos', 'recommend.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true });
const ai_proto = grpc.loadPackageDefinition(packageDefinition).ai_service;
const grpcClient = new ai_proto.CVRecommender('localhost:50051', grpc.credentials.createInsecure());

app.post('/api/upload-cv', upload.single('cv'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng chọn file CV!' });
    }

    console.log(`📂 Nhận được file CV từ Vue 3: ${req.file.originalname}`);

    const mockTextFromPdf = `Ứng viên có kỹ năng làm việc với Flutter, Dart và Firebase. Tên file CV: ${req.file.originalname}`;
    console.log("⏳ Đang bắn dữ liệu qua gRPC sang Python để AI phân tích...");
    grpcClient.AnalyzeCV({ cv_text: mockTextFromPdf }, (error, response) => {
        if (error) {
            console.error("❌ Lỗi gRPC phía Python:", error);
            return res.status(500).json({ error: 'Lỗi hệ thống phân tích AI' });
        }
        res.json({ recommended_jobs: response.recommended_jobs });
    });
});
app.listen(3000, () => {
    console.log('🟢 Node.js API Gateway đang chạy tại http://localhost:3000');
});