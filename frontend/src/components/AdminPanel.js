import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  // За форме
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('');
  const [quizDescription, setQuizDescription] = useState('');

  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [points, setPoints] = useState(10);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz);
    }
  }, [selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Грешка:', error);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}/questions?include_answers=true`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Грешка:', error);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/quizzes', {
        title: quizTitle,
        category: quizCategory,
        description: quizDescription
      });
      
      setQuizTitle('');
      setQuizCategory('');
      setQuizDescription('');
      setShowQuizForm(false);
      
      fetchQuizzes();
      alert('Квиз успешно креиран!');
    } catch (error) {
      console.error('Грешка:', error);
      alert('Грешка при креирању квиза');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/questions', {
        quiz_id: selectedQuiz,
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correctAnswer,
        points: points
      });
      
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer('A');
      setPoints(10);
      setShowQuestionForm(false);
      
      fetchQuestions(selectedQuiz);
      alert('Питање успешно додато!');
    } catch (error) {
      console.error('Грешка:', error);
      alert('Грешка при додавању питања');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Да ли сте сигурни да желите да обришете овај квиз?')) {
      try {
        await axios.delete(`http://localhost:5000/api/quizzes/${quizId}`);
        fetchQuizzes();
        if (selectedQuiz === quizId) {
          setSelectedQuiz(null);
          setQuestions([]);
        }
        alert('Квиз обрисан!');
      } catch (error) {
        console.error('Грешка:', error);
        alert('Грешка при брисању');
      }
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Да ли сте сигурни да желите да обришете ово питање?')) {
      try {
        await axios.delete(`http://localhost:5000/api/questions/${questionId}`);
        fetchQuestions(selectedQuiz);
        alert('Питање обрисано!');
      } catch (error) {
        console.error('Грешка:', error);
        alert('Грешка при брисању');
      }
    }
  };

  const seedDatabase = async () => {
    if (window.confirm('Ово ће додати тест податке у базу. Наставити?')) {
      try {
        await axios.post('http://localhost:5000/api/seed');
        fetchQuizzes();
        alert('База успешно попуњена тест подацима!');
      } catch (error) {
        console.error('Грешка:', error);
        alert('Грешка или база већ има податке');
      }
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">⚙️ Админ Панел</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <button
            className="btn btn-primary w-100"
            onClick={() => setShowQuizForm(!showQuizForm)}
          >
            {showQuizForm ? 'Затвори' : '+ Нови Квиз'}
          </button>
        </div>
        <div className="col-md-6">
          <button
            className="btn btn-success w-100"
            onClick={seedDatabase}
          >
            📊 Додај Тест Податке
          </button>
        </div>
      </div>

      {/* Форма за квиз */}
      {showQuizForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h4>Креирај Нови Квиз</h4>
            <form onSubmit={handleCreateQuiz}>
              <div className="mb-3">
                <label className="form-label">Наслов:</label>
                <input
                  type="text"
                  className="form-control"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Категорија:</label>
                <input
                  type="text"
                  className="form-control"
                  value={quizCategory}
                  onChange={(e) => setQuizCategory(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Опис:</label>
                <textarea
                  className="form-control"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Сачувај Квиз
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Листа квизова */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Сви Квизови</h5>
            </div>
            <div className="card-body" style={{maxHeight: '500px', overflowY: 'auto'}}>
              {quizzes.length === 0 ? (
                <p className="text-center text-muted">Нема квизова. Направите први!</p>
              ) : (
                <div className="list-group">
                  {quizzes.map(quiz => (
                    <div
                      key={quiz.id}
                      className={`list-group-item list-group-item-action ${selectedQuiz === quiz.id ? 'active' : ''}`}
                      onClick={() => setSelectedQuiz(quiz.id)}
                      style={{cursor: 'pointer'}}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{quiz.title}</h6>
                          <small>{quiz.category} • {quiz.question_count} питања</small>
                        </div>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuiz(quiz.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Питања за изабрани квиз */}
        <div className="col-md-6">
          {selectedQuiz ? (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>Питања</h5>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowQuestionForm(!showQuestionForm)}
                >
                  + Додај Питање
                </button>
              </div>
              <div className="card-body" style={{maxHeight: '500px', overflowY: 'auto'}}>
                {/* Форма за питање */}
                {showQuestionForm && (
                  <div className="card mb-3 bg-light">
                    <div className="card-body">
                      <form onSubmit={handleCreateQuestion}>
                        <div className="mb-2">
                          <label className="form-label">Питање:</label>
                          <textarea
                            className="form-control form-control-sm"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            rows="2"
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">A:</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={optionA}
                            onChange={(e) => setOptionA(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">B:</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={optionB}
                            onChange={(e) => setOptionB(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">C:</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={optionC}
                            onChange={(e) => setOptionC(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">D:</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={optionD}
                            onChange={(e) => setOptionD(e.target.value)}
                            required
                          />
                        </div>
                        <div className="row">
                          <div className="col-6 mb-2">
                            <label className="form-label">Тачан одговор:</label>
                            <select
                              className="form-select form-select-sm"
                              value={correctAnswer}
                              onChange={(e) => setCorrectAnswer(e.target.value)}
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                          <div className="col-6 mb-2">
                            <label className="form-label">Поени:</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={points}
                              onChange={(e) => setPoints(parseInt(e.target.value))}
                              min="1"
                            />
                          </div>
                        </div>
                        <button type="submit" className="btn btn-sm btn-primary w-100">
                          Сачувај Питање
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Листа питања */}
                {questions.length === 0 ? (
                  <p className="text-center text-muted">Нема питања. Додајте прво питање!</p>
                ) : (
                  questions.map((q, index) => (
                    <div key={q.id} className="card mb-2">
                      <div className="card-body p-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{flex: 1}}>
                            <h6 className="mb-1">{index + 1}. {q.question_text}</h6>
                            <small className="text-success">Тачан: {q.correct_answer}</small>
                          </div>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="alert alert-info text-center">
              Изаберите квиз са леве стране
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;