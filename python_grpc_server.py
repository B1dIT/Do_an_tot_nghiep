# python_grpc_server.py
import grpc
from concurrent import futures
import time

import recommend_pb2
import recommend_pb2_grpc

class CVRecommenderServicer(recommend_pb2_grpc.CVRecommenderServicer):
    def AnalyzeCV(self, request, context):
        print(f"🔥 Nhận được CV từ Node.js. Độ dài text: {len(request.cv_text)} ký tự")
        
        
        
        fake_job = recommend_pb2.JobItem(
            id=1,
            title="Lập trình viên VueJS / Node.js",
            company="Công ty ABC",
            job_url="https://topcv.vn/...",
            match_reason="Vì CV của bạn có kỹ năng Node.js và Vue 3 cực kỳ khớp với yêu cầu."
        )
        
        print("✅ Đã phân tích xong, gửi kết quả về cho Node.js...")
        return recommend_pb2.CVResponse(recommended_jobs=[fake_job])

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    recommend_pb2_grpc.add_CVRecommenderServicer_to_server(CVRecommenderServicer(), server)
    
    server.add_insecure_port('[::]:50051')
    server.start()
    print("🚀 Python gRPC Server đang chạy tại cổng 50051...")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()