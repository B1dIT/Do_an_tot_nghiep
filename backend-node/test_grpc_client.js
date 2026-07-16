// test_grpc_client.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', 'protos', 'recommend.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const ai_proto = grpc.loadPackageDefinition(packageDefinition).ai_service;

const client = new ai_proto.CVRecommender(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

const mockCvText = "Tôi là sinh viên IT, có kinh nghiệm làm Node.js, Vue3 và gRPC.";

console.log("Sending gRPC request to Python...");

// Call AnalyzeCV
client.AnalyzeCV({ cv_text: mockCvText }, (error, response) => {
    if (error) {
        console.error("gRPC call error:", error);
        return;
    }
    console.log("Result from Python:", JSON.stringify(response.recommended_jobs, null, 2));
});