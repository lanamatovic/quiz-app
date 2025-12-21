from flask import Blueprint, request, jsonify
from models import db, Quiz, Question, Result, Category
from sqlalchemy import func

api_bp = Blueprint('api', __name__)

# ============ КВИЗОВИ ============

@api_bp.route('/quizzes', methods=['GET'])
def get_quizzes():
    """Враћа све квизове"""
    category = request.args.get('category')
    
    if category:
        quizzes = Quiz.query.filter_by(category=category).all()
    else:
        quizzes = Quiz.query.all()
    
    return jsonify([quiz.to_dict() for quiz in quizzes])

@api_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    """Враћа један квиз"""
    quiz = Quiz.query.get_or_404(quiz_id)
    return jsonify(quiz.to_dict())

@api_bp.route('/quizzes', methods=['POST'])
def create_quiz():
    """Креира нови квиз"""
    data = request.get_json()
    
    new_quiz = Quiz(
        title=data['title'],
        category=data['category'],
        description=data.get('description', '')
    )
    
    db.session.add(new_quiz)
    db.session.commit()
    
    return jsonify(new_quiz.to_dict()), 201

@api_bp.route('/quizzes/<int:quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    """Ажурира квиз"""
    quiz = Quiz.query.get_or_404(quiz_id)
    data = request.get_json()
    
    quiz.title = data.get('title', quiz.title)
    quiz.category = data.get('category', quiz.category)
    quiz.description = data.get('description', quiz.description)
    
    db.session.commit()
    
    return jsonify(quiz.to_dict())

@api_bp.route('/quizzes/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    """Брише квиз"""
    quiz = Quiz.query.get_or_404(quiz_id)
    db.session.delete(quiz)
    db.session.commit()
    
    return jsonify({'message': 'Quiz deleted successfully'})

# ============ ПИТАЊА ============

@api_bp.route('/quizzes/<int:quiz_id>/questions', methods=['GET'])
def get_questions(quiz_id):
    """Враћа сва питања за квиз"""
    include_answers = request.args.get('include_answers', 'false').lower() == 'true'
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    
    return jsonify([q.to_dict(include_answer=include_answers) for q in questions])

@api_bp.route('/questions', methods=['POST'])
def create_question():
    """Креира ново питање"""
    data = request.get_json()
    
    new_question = Question(
        quiz_id=data['quiz_id'],
        question_text=data['question_text'],
        option_a=data['option_a'],
        option_b=data['option_b'],
        option_c=data['option_c'],
        option_d=data['option_d'],
        correct_answer=data['correct_answer'],
        points=data.get('points', 10)
    )
    
    db.session.add(new_question)
    db.session.commit()
    
    return jsonify(new_question.to_dict(include_answer=True)), 201

@api_bp.route('/questions/<int:question_id>', methods=['PUT'])
def update_question(question_id):
    """Ажурира питање"""
    question = Question.query.get_or_404(question_id)
    data = request.get_json()
    
    question.question_text = data.get('question_text', question.question_text)
    question.option_a = data.get('option_a', question.option_a)
    question.option_b = data.get('option_b', question.option_b)
    question.option_c = data.get('option_c', question.option_c)
    question.option_d = data.get('option_d', question.option_d)
    question.correct_answer = data.get('correct_answer', question.correct_answer)
    question.points = data.get('points', question.points)
    
    db.session.commit()
    
    return jsonify(question.to_dict(include_answer=True))

@api_bp.route('/questions/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    """Брише питање"""
    question = Question.query.get_or_404(question_id)
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({'message': 'Question deleted successfully'})

@api_bp.route('/questions/<int:question_id>/check', methods=['POST'])
def check_answer(question_id):
    """Проверава да ли је одговор тачан"""
    question = Question.query.get_or_404(question_id)
    data = request.get_json()
    user_answer = data.get('answer')
    
    is_correct = user_answer == question.correct_answer
    
    return jsonify({
        'correct': is_correct,
        'correct_answer': question.correct_answer,
        'points': question.points if is_correct else 0
    })

# ============ РЕЗУЛТАТИ ============

@api_bp.route('/results', methods=['POST'])
def save_result():
    """Чува резултат"""
    data = request.get_json()
    
    new_result = Result(
        quiz_id=data['quiz_id'],
        player_name=data['player_name'],
        score=data['score'],
        total_questions=data['total_questions']
    )
    
    db.session.add(new_result)
    db.session.commit()
    
    return jsonify(new_result.to_dict()), 201

@api_bp.route('/results/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz_results(quiz_id):
    """Враћа све резултате за квиз"""
    results = Result.query.filter_by(quiz_id=quiz_id).order_by(Result.score.desc()).all()
    return jsonify([r.to_dict() for r in results])

@api_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Враћа топ 10 резултата"""
    limit = request.args.get('limit', 10, type=int)
    results = Result.query.order_by(Result.score.desc()).limit(limit).all()
    
    return jsonify([r.to_dict() for r in results])

@api_bp.route('/leaderboard/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz_leaderboard(quiz_id):
    """Враћа leaderboard за специфичан квиз"""
    limit = request.args.get('limit', 10, type=int)
    results = Result.query.filter_by(quiz_id=quiz_id).order_by(Result.score.desc()).limit(limit).all()
    
    return jsonify([r.to_dict() for r in results])

# ============ КАТЕГОРИЈЕ ============

@api_bp.route('/categories', methods=['GET'])
def get_categories():
    """Враћа све категорије"""
    # Враћа уникатне категорије из квизова
    categories = db.session.query(Quiz.category).distinct().all()
    return jsonify([{'name': cat[0]} for cat in categories])

@api_bp.route('/categories', methods=['POST'])
def create_category():
    """Креира нову категорију"""
    data = request.get_json()
    
    new_category = Category(name=data['name'])
    
    try:
        db.session.add(new_category)
        db.session.commit()
        return jsonify(new_category.to_dict()), 201
    except:
        db.session.rollback()
        return jsonify({'error': 'Category already exists'}), 400

# ============ СТАТИСТИКА ============

@api_bp.route('/stats/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz_stats(quiz_id):
    """Враћа статистику за квиз"""
    quiz = Quiz.query.get_or_404(quiz_id)
    results = Result.query.filter_by(quiz_id=quiz_id).all()
    
    if not results:
        return jsonify({
            'quiz_title': quiz.title,
            'total_attempts': 0,
            'average_score': 0,
            'highest_score': 0,
            'lowest_score': 0
        })
    
    scores = [r.score for r in results]
    
    return jsonify({
        'quiz_title': quiz.title,
        'total_attempts': len(results),
        'average_score': round(sum(scores) / len(scores), 2),
        'highest_score': max(scores),
        'lowest_score': min(scores)
    })

# ============ SEED DATA (за тестирање) ============

@api_bp.route('/seed', methods=['POST'])
def seed_database():
    """Додаје тест податке у базу"""
    
    # Провери да ли већ постоје подаци
    if Quiz.query.first():
        return jsonify({'message': 'Database already has data'}), 400
    
    # Креирај тест квизове
    quiz1 = Quiz(
        title='Општа култура',
        category='Образовање',
        description='Тест општег знања'
    )
    
    quiz2 = Quiz(
        title='Историја Србије',
        category='Историја',
        description='Питања о српској историји'
    )
    
    db.session.add(quiz1)
    db.session.add(quiz2)
    db.session.commit()
    
    # Додај питања за први квиз
    questions1 = [
        Question(
            quiz_id=quiz1.id,
            question_text='Који је главни град Француске?',
            option_a='Лондон',
            option_b='Париз',
            option_c='Берлин',
            option_d='Мадрид',
            correct_answer='B',
            points=10
        ),
        Question(
            quiz_id=quiz1.id,
            question_text='Колико континената има на Земљи?',
            option_a='5',
            option_b='6',
            option_c='7',
            option_d='8',
            correct_answer='C',
            points=10
        ),
        Question(
            quiz_id=quiz1.id,
            question_text='Ко је написао "Ромео и Јулију"?',
            option_a='Чарлс Дикенс',
            option_b='Виљем Шекспир',
            option_c='Марк Твен',
            option_d='Оскар Вајлд',
            correct_answer='B',
            points=10
        )
    ]
    
    # Додај питања за други квиз
    questions2 = [
        Question(
            quiz_id=quiz2.id,
            question_text='Године којој је Србија постала независна од Отоманског царства?',
            option_a='1804',
            option_b='1830',
            option_c='1878',
            option_d='1912',
            correct_answer='C',
            points=10
        ),
        Question(
            quiz_id=quiz2.id,
            question_text='Ко је био први српски краљ из династије Карађорђевић?',
            option_a='Карађорђе',
            option_b='Милош Обреновић',
            option_c='Петар I Карађорђевић',
            option_d='Александар Карађорђевић',
            correct_answer='C',
            points=10
        )
    ]
    
    for q in questions1 + questions2:
        db.session.add(q)
    
    db.session.commit()
    
    return jsonify({'message': 'Database seeded successfully!'}), 201