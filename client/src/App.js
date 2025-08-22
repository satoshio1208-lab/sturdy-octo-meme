
import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    age: '32',
    gender: '男性',
    height: '170',
    weight: '79',
    health_status: '健康に問題なし',
    goal: '体重を10キロ減らして筋肥大を図る',
    current_routine: '週一の筋トレをジムで行っている',
    available_time: '1時間',
    sleep_hours: '5時間',
    liked_exercise: '筋トレ',
    disliked_exercise: 'ジョギング',
    motivation: '体重が数字で減りかつ、見た目の筋力が多くなること',
  });
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMenu(null);
    setError(null);

    try {
      const response = await fetch('https://satoshiotk-ink-ai-trainer.herokuapp.com/api/generate_menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('ネットワークエラーが発生しました');
      }

      const data = await response.json();
      setMenu(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AIトレーナー</h1>
        <p>13個の項目を入力して、あなただけのトレーニングメニューを作成します。</p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div key={key} style={{ margin: '10px' }}>
              <label>
                {key === 'age' ? '年齢' :
                key === 'gender' ? '性別' :
                key === 'height' ? '身長' :
                key === 'weight' ? '体重' :
                key === 'health_status' ? '健康状態' :
                key === 'goal' ? '目標' :
                key === 'current_routine' ? '運動習慣' :
                key === 'available_time' ? 'トレーニング時間' :
                key === 'sleep_hours' ? '睡眠時間' :
                key === 'liked_exercise' ? '好きな運動' :
                key === 'disliked_exercise' ? '嫌いな運動' :
                key === 'motivation' ? 'モチベーション' : key}
                ：
              </label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
              />
            </div>
          ))}
          <button type="submit" disabled={loading}>
            {loading ? '作成中...' : 'メニューを作成'}
          </button>
        </form>

        {loading && <p>トレーニングメニューを作成しています...</p>}
        {error && <p style={{ color: 'red' }}>エラー: {error}</p>}
        
        {menu && (
          <div style={{ marginTop: '20px', textAlign: 'left', border: '1px solid #ccc', padding: '20px' }}>
            <h2>作成されたメニュー</h2>
            <h3>目標</h3>
            <p>{menu.goal}</p>
            <h3>トレーニングプラン</h3>
            <p>{menu.workout_plan}</p>
            {menu.workout_days && menu.workout_days.map((day, index) => (
              <div key={index}>
                <h4>{day.day}</h4>
                <p>{day.menu}</p>
                <p><em>備考: {day.notes}</em></p>
              </div>
            ))}
            <h3>有酸素運動</h3>
            <p>{menu.cardio_plan}</p>
            <h3>食事のアドバイス</h3>
            <p>{menu.diet_advice}</p>
            <h3>睡眠のアドバイス</h3>
            <p>{menu.sleep_advice}</p>
            <p style={{ fontSize: '0.8em', color: '#666' }}>{menu.disclaimer}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;