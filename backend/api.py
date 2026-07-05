from datetime import datetime

import database
import models


# ============ POMOĆNE FUNKCIJE ZA SERIJALIZACIJU ============
# Ručno oblikujemo JSON odgovore (umesto generisanog to_dict()) da bi oblik
# odgovora ostao isti kao u originalnom Flask projektu, i da frontend ne mora
# da se menja.

def _quiz_to_dict(quiz):
    return {
        "id": quiz.id,
        "title": quiz.title,
        "category": quiz.category,
        "description": quiz.description,
        "created_at": quiz.created_at.strftime("%Y-%m-%d %H:%M:%S") if quiz.created_at else None,
        "question_count": len(models.Question.query.filter_by(quiz_id=quiz.id).all()),
    }


def _question_to_dict(question, include_answer=False):
    data = {
        "id": question.id,
        "quiz_id": question.quiz_id,
        "question_text": question.question_text,
        "options": {
            "A": question.option_a,
            "B": question.option_b,
            "C": question.option_c,
            "D": question.option_d,
        },
        "points": question.points,
    }
    if include_answer:
        data["correct_answer"] = question.correct_answer
    return data


def _result_to_dict(result):
    quiz = models.Quiz.query.get(result.quiz_id)
    return {
        "id": result.id,
        "quiz_id": result.quiz_id,
        "quiz_title": quiz.title if quiz else None,
        "player_name": result.player_name,
        "score": result.score,
        "total_questions": result.total_questions,
        "percentage": round((result.score / result.total_questions) * 100, 2)
        if result.total_questions
        else 0,
        "completed_at": result.completed_at.strftime("%Y-%m-%d %H:%M:%S")
        if result.completed_at
        else None,
    }


def _category_to_dict(category):
    return {"id": category.id, "name": category.name}


# ============ KVIZOVI ============

def getQuizzes(category=None):
    """Vraća sve kvizove"""
    if category:
        quizzes = models.Quiz.query.filter_by(category=category).all()
    else:
        quizzes = models.Quiz.query.all()
    return [_quiz_to_dict(q) for q in quizzes]


def getQuiz(quiz_id):
    """Vraća jedan kviz"""
    quiz = models.Quiz.query.get(quiz_id)
    if quiz is None:
        return "Kviz nije pronađen", 404
    return _quiz_to_dict(quiz)


def createQuiz(body):
    """Kreira novi kviz"""
    quiz = models.Quiz(
        title=body["title"],
        category=body["category"],
        description=body.get("description", ""),
        created_at=datetime.utcnow(),
    )
    database.db.session.add(quiz)
    database.db.session.commit()
    return _quiz_to_dict(quiz), 201


def updateQuiz(quiz_id, body):
    """Ažurira kviz"""
    quiz = models.Quiz.query.get(quiz_id)
    if quiz is None:
        return "Kviz nije pronađen", 404

    quiz.title = body.get("title", quiz.title)
    quiz.category = body.get("category", quiz.category)
    quiz.description = body.get("description", quiz.description)

    database.db.session.commit()
    return _quiz_to_dict(quiz)


def deleteQuiz(quiz_id):
    """Briše kviz"""
    quiz = models.Quiz.query.get(quiz_id)
    if quiz is None:
        return "Kviz nije pronađen", 404

    database.db.session.delete(quiz)
    database.db.session.commit()
    return {"message": "Quiz deleted successfully"}


# ============ PITANJA ============

def getQuestions(quiz_id, include_answers=False):
    """Vraća sva pitanja za kviz"""
    questions = models.Question.query.filter_by(quiz_id=quiz_id).all()
    return [_question_to_dict(q, include_answer=include_answers) for q in questions]


def createQuestion(body):
    """Kreira novo pitanje"""
    question = models.Question(
        quiz_id=body["quiz_id"],
        question_text=body["question_text"],
        option_a=body["option_a"],
        option_b=body["option_b"],
        option_c=body["option_c"],
        option_d=body["option_d"],
        correct_answer=body["correct_answer"],
        points=body.get("points", 10),
    )
    database.db.session.add(question)
    database.db.session.commit()
    return _question_to_dict(question, include_answer=True), 201


def updateQuestion(question_id, body):
    """Ažurira pitanje"""
    question = models.Question.query.get(question_id)
    if question is None:
        return "Pitanje nije pronađeno", 404

    question.question_text = body.get("question_text", question.question_text)
    question.option_a = body.get("option_a", question.option_a)
    question.option_b = body.get("option_b", question.option_b)
    question.option_c = body.get("option_c", question.option_c)
    question.option_d = body.get("option_d", question.option_d)
    question.correct_answer = body.get("correct_answer", question.correct_answer)
    question.points = body.get("points", question.points)

    database.db.session.commit()
    return _question_to_dict(question, include_answer=True)


def deleteQuestion(question_id):
    """Briše pitanje"""
    question = models.Question.query.get(question_id)
    if question is None:
        return "Pitanje nije pronađeno", 404

    database.db.session.delete(question)
    database.db.session.commit()
    return {"message": "Question deleted successfully"}


def checkAnswer(question_id, body):
    """Proverava da li je odgovor tačan"""
    question = models.Question.query.get(question_id)
    if question is None:
        return "Pitanje nije pronađeno", 404

    user_answer = body.get("answer")
    is_correct = user_answer == question.correct_answer

    return {
        "correct": is_correct,
        "correct_answer": question.correct_answer,
        "points": question.points if is_correct else 0,
    }


# ============ REZULTATI ============

def saveResult(body):
    """Čuva rezultat"""
    result = models.Result(
        quiz_id=body["quiz_id"],
        player_name=body["player_name"],
        score=body["score"],
        total_questions=body["total_questions"],
        completed_at=datetime.utcnow(),
    )
    database.db.session.add(result)
    database.db.session.commit()
    return _result_to_dict(result), 201


def getQuizResults(quiz_id):
    """Vraća sve rezultate za kviz"""
    results = (
        models.Result.query.filter_by(quiz_id=quiz_id)
        .order_by(models.Result.score.desc())
        .all()
    )
    return [_result_to_dict(r) for r in results]


def getLeaderboard(limit=10):
    """Vraća top rezultate"""
    results = models.Result.query.order_by(models.Result.score.desc()).limit(limit).all()
    return [_result_to_dict(r) for r in results]


def getQuizLeaderboard(quiz_id, limit=10):
    """Vraća leaderboard za specifičan kviz"""
    results = (
        models.Result.query.filter_by(quiz_id=quiz_id)
        .order_by(models.Result.score.desc())
        .limit(limit)
        .all()
    )
    return [_result_to_dict(r) for r in results]


# ============ KATEGORIJE ============

def getCategories():
    """Vraća sve (unikatne) kategorije iz postojećih kvizova"""
    categories = database.db.session.query(models.Quiz.category).distinct().all()
    return [{"name": c[0]} for c in categories]


def createCategory(body):
    """Kreira novu kategoriju"""
    existing = models.Category.query.filter_by(name=body["name"]).first()
    if existing:
        return {"error": "Category already exists"}, 400

    category = models.Category(name=body["name"])
    database.db.session.add(category)
    database.db.session.commit()
    return _category_to_dict(category), 201


# ============ STATISTIKA ============

def getQuizStats(quiz_id):
    """Vraća statistiku za kviz"""
    quiz = models.Quiz.query.get(quiz_id)
    if quiz is None:
        return "Kviz nije pronađen", 404

    results = models.Result.query.filter_by(quiz_id=quiz_id).all()

    if not results:
        return {
            "quiz_title": quiz.title,
            "total_attempts": 0,
            "average_score": 0,
            "highest_score": 0,
            "lowest_score": 0,
        }

    scores = [r.score for r in results]

    return {
        "quiz_title": quiz.title,
        "total_attempts": len(results),
        "average_score": round(sum(scores) / len(scores), 2),
        "highest_score": max(scores),
        "lowest_score": min(scores),
    }


# ============ SEED DATA (za testiranje) ============

def seedDatabase():
    """Dodaje test podatke u bazu"""
    if models.Quiz.query.first():
        return {"message": "Database already has data"}, 400

    quiz1 = models.Quiz(
        title="Opšta kultura",
        category="Obrazovanje",
        description="Test opšteg znanja",
        created_at=datetime.utcnow(),
    )
    quiz2 = models.Quiz(
        title="Istorija Srbije",
        category="Istorija",
        description="Pitanja o srpskoj istoriji",
        created_at=datetime.utcnow(),
    )

    database.db.session.add(quiz1)
    database.db.session.add(quiz2)
    database.db.session.commit()

    questions = [
        models.Question(
            quiz_id=quiz1.id,
            question_text="Koji je glavni grad Francuske?",
            option_a="London",
            option_b="Pariz",
            option_c="Berlin",
            option_d="Madrid",
            correct_answer="B",
            points=10,
        ),
        models.Question(
            quiz_id=quiz1.id,
            question_text="Koliko kontinenata ima na Zemlji?",
            option_a="5",
            option_b="6",
            option_c="7",
            option_d="8",
            correct_answer="C",
            points=10,
        ),
        models.Question(
            quiz_id=quiz1.id,
            question_text='Ko je napisao "Romeo i Julija"?',
            option_a="Čarls Dikens",
            option_b="Viljem Šekspir",
            option_c="Mark Tven",
            option_d="Oskar Vajld",
            correct_answer="B",
            points=10,
        ),
        models.Question(
            quiz_id=quiz2.id,
            question_text="Koje godine je Srbija postala nezavisna od Otomanskog carstva?",
            option_a="1804",
            option_b="1830",
            option_c="1878",
            option_d="1912",
            correct_answer="C",
            points=10,
        ),
        models.Question(
            quiz_id=quiz2.id,
            question_text="Ko je bio prvi srpski kralj iz dinastije Karađorđević?",
            option_a="Karađorđe",
            option_b="Miloš Obrenović",
            option_c="Petar I Karađorđević",
            option_d="Aleksandar Karađorđević",
            correct_answer="C",
            points=10,
        ),
    ]

    for q in questions:
        database.db.session.add(q)

    database.db.session.commit()

    return {"message": "Database seeded successfully!"}, 201
