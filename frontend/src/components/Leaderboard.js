import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [results, setResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
    fetchLeaderboard();
  }, [selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Грешка:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const url = selectedQuiz
        ? `http://localhost:5000/api/leaderboard/quiz/${selectedQuiz}`
        : 'http://localhost:5000/api/leaderboard';
      
      const response = await axios.get(url);
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Грешка:', error);
      setLoading(false);
    }
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const getMedalClass = (index) => {
    if (index === 0) return 'badge-gold';
    if (index === 1) return 'badge-silver';
    if (index === 2) return 'badge-bronze';
    return 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Учитавање...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">🏆 Табела Најбољих</h1>

      {/* Филтер по квизу */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
          >
            <option value="">Сви квизови</option>
            {quizzes.map(quiz => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Табела */}
      {results.length === 0 ? (
        <div className="alert alert-info text-center">
          <h4>Још увек нема резултата</h4>
          <p>Будите први који ће се појавити на табели!</p>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{width: '80px'}}>Место</th>
                        <th>Играч</th>
                        <th>Квиз</th>
                        <th className="text-center">Скор</th>
                        <th className="text-center">%</th>
                        <th>Датум</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={result.id} className="leaderboard-item">
                          <td>
                            <span className={`badge ${getMedalClass(index)} fs-5`}>
                              {getMedalEmoji(index)}
                            </span>
                          </td>
                          <td><strong>{result.player_name}</strong></td>
                          <td>{result.quiz_title}</td>
                          <td className="text-center">
                            <strong>{result.score}</strong>/{result.total_questions * 10}
                          </td>
                          <td className="text-center">
                            <span className={`badge ${result.percentage >= 80 ? 'bg-success' : result.percentage >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                              {result.percentage}%
                            </span>
                          </td>
                          <td className="text-muted">
                            {new Date(result.completed_at).toLocaleDateString('sr-RS')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Статистика */}
            {results.length > 0 && (
              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="card text-center stat-card">
                    <div className="card-body">
                      <h6 className="text-muted">Највиши Скор</h6>
                      <h3 className="text-primary">{Math.max(...results.map(r => r.score))}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center stat-card">
                    <div className="card-body">
                      <h6 className="text-muted">Просек</h6>
                      <h3 className="text-success">
                        {(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center stat-card">
                    <div className="card-body">
                      <h6 className="text-muted">Укупно Покушаја</h6>
                      <h3 className="text-warning">{results.length}</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;