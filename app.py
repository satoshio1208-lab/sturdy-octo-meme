import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# .envファイルからAPIキーを読み込みます
load_dotenv()

# Flaskというサーバーを「app」という名前で作ります
app = Flask(__name__)
CORS(app) # ウェブサイトからの通信を許可します

# 隠しておいたAPIキーを読み込んで、Geminiに繋げます
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Geminiモデルの設定
generation_config = {
    "temperature": 0.5,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}
model = genai.GenerativeModel("gemini-1.5-flash-latest", generation_config=generation_config)

# このURLにデータが送られてきたら、以下の処理を実行します
@app.route("/api/generate_menu", methods=["POST"])
def generate_menu():
    # ウェブサイトから送られてきたデータを取得します
    data = request.json
    
    # Geminiへの「指示書」を作ります
    prompt = f"""
    あなたは経験豊富なパーソナルトレーナーです。
    以下のユーザーデータに基づいて、トレーニングメニューをJSON形式で作成してください。
    
    - 年齢: {data['age']}
    - 性別: {data['gender']}
    - 身長: {data['height']} cm
    - 体重: {data['weight']} kg
    - 健康状態: {data['health_status']}
    - 目標: {data['goal']}
    - 運動習慣: {data['current_routine']}
    - トレーニング時間: {data['available_time']}
    - 睡眠時間: {data['sleep_hours']}
    - 好きな運動: {data['liked_exercise']}
    - 嫌いな運動: {data['disliked_exercise']}
    - モチベーション: {data['motivation']}
    
    回答は以下のJSON形式のみで出力してください。
    ```json
    {{
      "goal": "...",
      "workout_plan": "...",
      "workout_days": [
        {{ "day": "...", "menu": "...", "notes": "..." }},
        ...
      ],
      "cardio_plan": "...",
      "diet_advice": "...",
      "sleep_advice": "...",
      "disclaimer": "..."
    }}
    ```
    """
    
    try:
        print("Sending prompt to Gemini API...")
        response = model.generate_content(prompt)
        print("Received response from Gemini API.")
        
        # レスポンスが空の場合のエラーハンドリング
        if not response.text:
            print("Gemini API response text is empty.")
            return jsonify({"error": "Gemini APIからの応答が空です"}), 500
            
        print("Received response text:", response.text)

        # JSONを解析する
        response_json = json.loads(response.text.strip().lstrip('```json').rstrip('```'))
        return jsonify(response_json)
    except Exception as e:
        # 発生したエラーを詳しく出力
        print(f"An error occurred: {e}")
        return jsonify({"error": f"サーバーエラー: {e}"}), 500

# このファイルを直接実行したときにサーバーを起動します
if __name__ == "__main__":
    app.run(debug=True)
