import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
    fetchCategories();
  }, [selectedCategory]);

  const fetchQuizzes = async () => {
    try {
      const url = selectedCategory 
        ? `http://localhost:5000/api/quizzes?category=${selectedCategory}`
        : 'http://localhost:5000/api/quizzes';
      
      const response = await axios.get(url);
      setQuizzes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Грешка при учитавању квизова:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Грешка при учитавању категорија:', error);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <h1 className="text-center mb-4">Сви Квизови</h1>

      {/* Филтери */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Претражи квизове..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-3">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Све категорије</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Листа квизова */}
      {filteredQuizzes.length === 0 ? (
        <div className="alert alert-info text-center">
          <h4>Нема доступних квизова</h4>
          <p>Покушајте са другим филтерима или додајте нове квизове у админ панелу.</p>
        </div>
      ) : (
        <div className="row">
          {filteredQuizzes.map(quiz => (
            <div key={quiz.id} className="col-md-4 mb-4">
              <div className="card quiz-card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">{quiz.title}</h5>
                    <span className="badge bg-primary">{quiz.category}</span>
                  </div>
                  <p className="card-text flex-grow-1">{quiz.description}</p>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        📝 {quiz.question_count} питања
                      </small>
                      <small className="text-muted">
                        📅 {new Date(quiz.created_at).toLocaleDateString('sr-RS')}
                      </small>
                    </div>
                    <Link to={`/quiz/${quiz.id}`} className="btn btn-primary w-100">
                      Почни Квиз →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizList;