import os
import json
import grpc
import psycopg2
import uuid
import re
import sys
import io
from concurrent import futures
from google import genai
from dotenv import load_dotenv


sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import recommend_pb2
import recommend_pb2_grpc

# Load .env — prefer same dir as script, fallback to backend-node/
_script_dir = os.path.dirname(os.path.abspath(__file__))
_env_loaded = load_dotenv(os.path.join(_script_dir, '.env'))
if not _env_loaded:
    _env_loaded = load_dotenv(os.path.join(_script_dir, '..', 'backend-node', '.env'))
    if not _env_loaded:
        # Default (CWD) if above paths don't exist
        load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    print(f"[Config] GEMINI_API_KEY loaded from .env")
else:
    print(f"[Config] GEMINI_API_KEY not found in .env — Gemini unavailable.")

# Database config from environment
DB_NAME = os.getenv("DB_NAME", "do_an_tot_nghiep")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "160105")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
    
client = genai.Client(api_key=GEMINI_API_KEY)
interview_sessions = {}

def get_jobs_from_db():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, company, job_url, desc_mota, desc_yeucau
            FROM jobs_data
            WHERE (status IS NULL OR status = 'ACTIVE')
              AND created_at >= NOW() - INTERVAL '7 days'
            ORDER BY created_at DESC
            LIMIT 20
        """)
        jobs = cursor.fetchall()
        cursor.close()
        conn.close()
        
        jobs_list = []
        for j in jobs:
            jobs_list.append({
                "id": str(j[0]),
                "title": j[1] if j[1] else "",
                "company": j[2] if j[2] else "",
                "job_url": j[3] if j[3] else "",
                "description": j[4] if j[4] else "",
                "requirements": j[5] if j[5] else ""
            })
        return jobs_list
    except Exception as e:
        print(f"PostgreSQL connection error: {e}")
        return []

def match_cv_with_gemini(cv_text):
    jobs = get_jobs_from_db()
    if not jobs:
        print("[DEBUG] No jobs fetched from Database PostgreSQL!", flush=True)
        return []

    print(f"[DEBUG] Fetched {len(jobs)} jobs from DB. Sending to Gemini...", flush=True)

    
    prompt = f"""
    Bạn là một chuyên gia Tuyển dụng AI chuyên đánh giá kỹ năng nghề nghiệp.
    --- NỘI DUNG CV ĐÃ ẨN DANH ---
    {cv_text}
    
    --- DANH SÁCH CÔNG VIỆC ---
    {json.dumps(jobs, ensure_ascii=False)}
    
    YÊU CẦU:
    1. Chọn ra tối đa 5 công việc PHÙ HỢP NHẤT với CV này.
    2. Trả về KẾT QUẢ ĐÚNG ĐỊNH DẠNG JSON LIST (không kèm bất kỳ lời giải thích hay ký tự markdown nào khác):
    [
      {{
        "id": 123,
        "title": "tên_công_việc",
        "company": "tên_công_ty",
        "job_url": "đường_dẫn",
        "match_reason": "Lý do phù hợp (phù hợp bao nhiêu %)",
        "jd_text": "Mô tả công việc"
      }}
    ]
    """

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
        )
        # Clean JSON if Gemini returns Markdown block
        clean_str = re.sub(r'```json\s*|\s*```', '', response.text).strip()
        return json.loads(clean_str)
    except Exception as e:
        print(f"[DEBUG] Gemini JSON parse error: {e}", flush=True)
        return []

# ---------------------------------------------------------
# 2. gRPC INTERVIEW SERVICE
# ---------------------------------------------------------
class AIServiceServicer(recommend_pb2_grpc.AIServiceServicer):
    def AnalyzeCV(self, request, context):
        print("\n[gRPC] Received CV data from Node.js!")
        jobs_data = match_cv_with_gemini(request.cv_text)
        
        response_jobs = []
        for job in jobs_data:
            try:
                job_id = int(job.get('id', 0))
            except (ValueError, TypeError):
                job_id = 0

            item = recommend_pb2.JobItem(
                id=job_id,
                title=str(job.get('title', '')),
                company=str(job.get('company', '')),
                job_url=str(job.get('job_url', '')),
                match_reason=str(job.get('match_reason', '')),
                jd_text=str(job.get('jd_text', ''))
            )
            response_jobs.append(item)
            
        print(f"Gemini analysis complete! Returning {len(response_jobs)} jobs.")
        return recommend_pb2.CVResponse(recommended_jobs=response_jobs)

    def StartInterview(self, request, context):
        session_id = str(uuid.uuid4())
        
        system_instruction = f"""
        Bạn là Chuyên gia Phỏng vấn tuyển dụng vị trí {request.job_title} tại công ty {request.company}.
        Nhiệm vụ: Phỏng vấn ứng viên dựa trên CV và JD dưới đây.
        Ngôn ngữ: {request.language} | Độ khó: {request.difficulty} | Tổng số câu hỏi: {request.num_questions}

        --- NỘI DUNG CV ---
        {request.cv_text}
        
        --- YÊU CẦU CÔNG VIỆC (JD) ---
        {request.jd_text}
        
        QUY TẮC:
        1. Chỉ đặt 1 câu hỏi mỗi lượt.
        2. Hỏi xoáy vào dự án, kinh nghiệm trong CV và độ khớp JD.
        3. Thái độ chuyên nghiệp, lịch sự nhưng thử thách.
        4. Phản hồi ngắn gọn câu trả lời trước đó (1 câu) rồi hỏi câu tiếp theo.
        """

        chat = client.chats.create(
            model='gemini-3.6-flash',
            config={'system_instruction': system_instruction}
        )
        
        initial_prompt = "Chào bạn, hãy gửi lời chào ngắn gọn và đặt câu hỏi phỏng vấn đầu tiên luôn."
        response = chat.send_message(initial_prompt)
        
        interview_sessions[session_id] = {
            'chat': chat,
            'question_count': 1,
            'max_questions': request.num_questions,
            'history': [{"role": "ai", "content": response.text}]
        }
        
        return recommend_pb2.InterviewResponse(
            session_id=session_id,
            initial_message=response.text
        )

    def ChatInterview(self, request, context):
        session = interview_sessions.get(request.session_id)
        if not session:
            context.abort(grpc.StatusCode.NOT_FOUND, "Session not found or expired")
        
        chat = session['chat']
        user_msg = request.user_message
        
        session['history'].append({"role": "user", "content": user_msg})
        
        response = chat.send_message(user_msg)
        session['question_count'] += 1
        session['history'].append({"role": "ai", "content": response.text})
        
        is_finished = session['question_count'] > session['max_questions']
        ai_msg = response.text
        if is_finished:
            ai_msg += "\n\nCảm ơn bạn! Buổi phỏng vấn đã hoàn tất. Bạn có thể bấm Kết thúc để xem báo cáo đánh giá."

        return recommend_pb2.ChatResponse(
            ai_message=ai_msg,
            is_finished=is_finished
        )

    def EndInterview(self, request, context):
        session = interview_sessions.get(request.session_id)
        
        if not session:
            print("[EndInterview] Session not found, returning default result.")
            return recommend_pb2.EvaluationResponse(
                overall_score=70,
                summary="Buổi phỏng vấn đã hoàn thành. Hệ thống đã ghi nhận các câu trả lời của bạn.",
                strengths=["Đã tham gia hoàn thành các câu hỏi phỏng vấn."],
                improvements=["Cần trau dồi thêm câu trả lời chi tiết hơn cho từng tình huống."],
                detailed_feedback=[]
            )
        
        chat = session['chat']
        
        prompt = """
        Buổi phỏng vấn đã kết thúc. Hãy dựa vào toàn bộ lịch sử trò chuyện để đánh giá ứng viên.
        Trả về KẾT QUẢ CHUẨN ĐỊNH DẠNG JSON DUY NHẤT (không kèm ký tự markdown hay bất kỳ lời giải thích nào):
        {
            "overall_score": 75,
            "summary": "Tóm tắt ngắn gọn đánh giá ứng viên",
            "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
            "improvements": ["Cần cải thiện 1"],
            "detailed_feedback": [
                {
                    "question": "Câu hỏi",
                    "user_answer": "Câu trả lời của ứng viên",
                    "score": 7,
                    "suggested_answer": "Gợi ý trả lời hay hơn"
                }
            ]
        }
        """
        
        try:
            response = chat.send_message(prompt)
            print(f"[DEBUG] Raw Evaluation Response from Gemini:\n{response.text}", flush=True)

            # Safely extract JSON with Regex
            raw_text = response.text.strip()
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            clean_str = match.group(0) if match else re.sub(r'```json\s*|\s*```', '', raw_text).strip()
            
            eval_data = json.loads(clean_str)
            
            detailed_feedback = []
            for item in eval_data.get('detailed_feedback', []):
                detailed_feedback.append(recommend_pb2.DetailedFeedback(
                    question=str(item.get('question', '')),
                    user_answer=str(item.get('user_answer', '')),
                    score=int(item.get('score', 0)),
                    suggested_answer=str(item.get('suggested_answer', ''))
                ))
            
            # Delete session after completion
            del interview_sessions[request.session_id]
            
            return recommend_pb2.EvaluationResponse(
                overall_score=int(eval_data.get('overall_score', 70)),
                summary=str(eval_data.get('summary', 'Đã hoàn thành phỏng vấn.')),
                strengths=[str(s) for s in eval_data.get('strengths', [])],
                improvements=[str(imp) for imp in eval_data.get('improvements', [])],
                detailed_feedback=detailed_feedback
            )

        except Exception as e:
            print(f"[DEBUG] Error generating interview evaluation (Gemini Quota/JSON): {e}", flush=True)
            
            if request.session_id in interview_sessions:
                del interview_sessions[request.session_id]
           
            return recommend_pb2.EvaluationResponse(
                overall_score=70,
                summary="Phỏng vấn hoàn tất! (Hệ thống đã tự động tổng hợp kết quả).",
                strengths=["Hoàn thành đủ số lượng câu hỏi phỏng vấn", "Tích cực tương tác với nhà tuyển dụng AI"],
                improvements=["Cần bổ sung chi tiết hơn các ví dụ thực tế trong câu trả lời"],
                detailed_feedback=[]
            )

def serve():
    grpc_port = os.getenv("GRPC_PORT", "50051")
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    recommend_pb2_grpc.add_AIServiceServicer_to_server(AIServiceServicer(), server)
    server.add_insecure_port(f'0.0.0.0:{grpc_port}')
    server.start()
    print("=" * 50)
    print(f"Python gRPC Server running on port {grpc_port}...", flush=True)
    print("=" * 50)
    server.wait_for_termination()

if __name__ == '__main__':
    serve()