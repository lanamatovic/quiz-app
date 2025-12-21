import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  useEffect(() => {
    if (quizStarted && !showResult && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !showResult) {
      handleNextQuestion();
    }
  }, [timer, quizStarted, showResult]);

  const fetchQuizData = async () => {
    try {
      const quizResponse = await axios.get(`http://localhost:5000/api/quizzes/${id}`);
      setQuiz(quizResponse.data);

      const questionsResponse = await axios.get(`http://localhost:5000/api/quizzes/${id}/questions`);
      setQuestions(questionsResponse.data);
    } catch (error) {
      console.error('Грешка:', error);
    }
  };

  const startQuiz = () => {
    if (playerName.trim() === '') {
      alert('Унесите ваше име!');
      return;
    }
    setQuizStarted(true);
    setTimer(30);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === '') {
      alert('Изаберите одговор!');
      return;
    }

    // Провери тачност одговора
    try {
      const response = await axios.post(
        `http://localhost:5000/api/questions/${questions[currentQuestionIndex].id}/check`,
        { answer: selectedAnswer }
      );

      const isCorrect = response.data.correct;
      const pointsEarned = response.data.points;

      setAnsweredQuestions([...answeredQuestions, {
        question: questions[currentQuestionIndex].question_text,
        userAnswer: selectedAnswer,
        correctAnswer: response.data.correct_answer,
        isCorrect: isCorrect
      }]);

      if (isCorrect) {
        setScore(score + pointsEarned);
      }

      // Следеће питање или крај
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setTimer(30);
      } else {
        await saveResult(isCorrect ? score + pointsEarned : score);
        setShowResult(true);
      }
    } catch (error) {
      console.error('Грешка:', error);
    }
  };

  const saveResult = async (finalScore) => {
    try {
      await axios.post('http://localhost:5000/api/results', {
        quiz_id: parseInt(id),
        player_name: playerName,
        score: finalScore,
        total_questions: questions.length
      });
    } catch (error) {
      console.error('Грешка при чувању резултата:', error);
    }
  };

  if (!quiz || questions.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Учитавање...</span>
        </div>
      </div>
    );
  }

  // Почетни екран
  if (!quizStarted) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="card-title mb-4">{quiz.title}</h2>
                <p className="card-text mb-4">{quiz.description}</p>
                <div className="mb-4">
                  <p><strong>Категорија:</strong> {quiz.category}</p>
                  <p><strong>Број питања:</strong> {questions.length}</p>
                  <p><strong>Време по питању:</strong> 30 секунди</p>
                </div>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Унесите ваше име"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
                />
                <button className="btn btn-primary btn-lg w-100" onClick={startQuiz}>
                  Почни Квиз 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Резултат екран
  if (showResult) {
    const percentage = ((score / questions.length) / 10) * 100;
    
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="mb-4">Резултати 🎉</h2>
                <div className="score-display mb-4">{score}</div>
                <h4>од {questions.length * 10} поена</h4>
                <div className="progress mb-4" style={{height: '30px'}}>
                  <div
                    className="progress-bar"
                    style={{width: `${percentage}%`}}
                  >
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <h5 className="mt-4 mb-3">Преглед Одговора:</h5>
                <div className="text-start">
                  {answeredQuestions.map((item, index) => (
                    <div key={index} className={`card mb-2 ${item.isCorrect ? 'border-success' : 'border-danger'}`}>
                      <div className="card-body">
                        <p className="mb-1"><strong>Питање {index + 1}:</strong> {item.question}</p>
                        <p className="mb-1">
                          <span className={item.isCorrect ? 'text-success' : 'text-danger'}>
                            Ваш одговор: {item.userAnswer} {item.isCorrect ? '✓' : '✗'}
                          </span>
                        </p>
                        {!item.isCorrect && (
                          <p className="mb-0 text-success">
                            Тачан одговор: {item.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <button className="btn btn-primary me-2" onClick={() => navigate('/quizzes')}>
                    Назад на Листу
                  </button>
                  <button className="btn btn-success" onClick={() => navigate('/leaderboard')}>
                    Погледај Табелу 🏆
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Питање екран
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Прогрес и тајмер */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span>Питање {currentQuestionIndex + 1} од {questions.length}</span>
              <span className="timer">⏱️ {timer}s</span>
            </div>
            <div className="progress" style={{height: '25px'}}>
              <div
                className="progress-bar progress-bar-custom"
                style={{width: `${progress}%`}}
              >
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Питање картица */}
          <div className="card question-card">
            <div className="card-body">
              <h4 className="card-title mb-4">{currentQuestion.question_text}</h4>
              
              <div className="d-grid gap-2">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button
                    key={key}
                    className={`btn option-btn ${selectedAnswer === key ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(key)}
                  >
                    <strong>{key}.</strong> {value}
                  </button>
                ))}
              </div>

              <div className="mt-4 d-flex justify-content-between">
                <span className="text-muted">Поени: {score}</span>
                <button
                  className="btn btn-primary"
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === ''}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Следеће →' : 'Заврши'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPlay;