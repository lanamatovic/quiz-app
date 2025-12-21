import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      {/* Hero секција */}
      <div className="hero-section">
        <div className="container">
          <h1>Добродошли на Квиз Апликацију! 🎯</h1>
          <p>Тестирајте своје знање и такмичите се са другима</p>
          <Link to="/quizzes" className="btn btn-light btn-lg">
            Почни Квиз
          </Link>
        </div>
      </div>

      {/* Карактеристике */}
      <div className="container my-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card text-center h-100">
              <div className="card-body">
                <div className="display-4 text-primary mb-3">📚</div>
                <h5 className="card-title">Разноврсни Квизови</h5>
                <p className="card-text">
                  Велики избор квизова из различитих области знања
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card text-center h-100">
              <div className="card-body">
                <div className="display-4 text-success mb-3">🏆</div>
                <h5 className="card-title">Табела Резултата</h5>
                <p className="card-text">
                  Такмичите се са другима и будите на врху табеле
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card text-center h-100">
              <div className="card-body">
                <div className="display-4 text-warning mb-3">⏱️</div>
                <h5 className="card-title">Тестирајте Брзину</h5>
                <p className="card-text">
                  Одговарајте брзо и освојите више поена
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="row mt-5">
          <div className="col-md-12">
            <h2 className="text-center mb-4">Зашто наша платформа?</h2>
          </div>
          <div className="col-md-3 text-center">
            <h3 className="text-primary">500+</h3>
            <p>Питања</p>
          </div>
          <div className="col-md-3 text-center">
            <h3 className="text-success">50+</h3>
            <p>Квизова</p>
          </div>
          <div className="col-md-3 text-center">
            <h3 className="text-warning">1000+</h3>
            <p>Корисника</p>
          </div>
          <div className="col-md-3 text-center">
            <h3 className="text-danger">10+</h3>
            <p>Категорија</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;