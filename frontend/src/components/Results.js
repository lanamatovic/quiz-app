import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Results() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container my-5">
      <div className="text-center">
        <h2>Резултати за квиз #{id}</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/quizzes')}>
          Назад на Квизове
        </button>
      </div>
    </div>
  );
}

export default Results;