import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import QuizList from './components/QuizList';
import QuizPlay from './components/QuizPlay';
import Results from './components/Results';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Навигација */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <Link className="navbar-brand" to="/">
              🎯 Квиз Апликација
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Почетна</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/quizzes">Квизови</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/leaderboard">Табела</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Админ</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Руте */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quiz/:id" element={<QuizPlay />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-dark text-white text-center py-3 mt-5">
          <p className="mb-0">© 2025 Квиз Апликација - Грађевински факултет</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;