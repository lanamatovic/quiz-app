from flask import Flask
from flask_cors import CORS
from models import db
from routes import api_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Иницијализација базе података
db.init_app(app)

# Омогући CORS за комуникацију са React
CORS(app)

# Региструј руте
app.register_blueprint(api_bp, url_prefix='/api')

# Креирај табеле у бази података
with app.app_context():
    db.create_all()
    print("Database tables created!")

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)